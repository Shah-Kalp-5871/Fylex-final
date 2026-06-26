import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

type AuthRole = 'customer' | 'admin';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private sanitizeUser<T extends Record<string, any>>(user: T, role: AuthRole) {
    const { password, ...result } = user;
    const userData: Record<string, any> = { ...result, role };

    Object.keys(userData).forEach((key) => {
      if (typeof userData[key] === 'number') {
        userData[key] = userData[key].toString();
      }
    });

    return userData;
  }

  // Shared validator for strategies that can authenticate either role.
  async validateUser(email: string, pass: string): Promise<any> {
    let user: any = await this.prisma.customer.findUnique({ where: { email } });
    let role: AuthRole = 'customer';

    if (!user) {
      user = await this.prisma.admin.findUnique({ where: { email } });
      role = 'admin';
    }

    if (user && await bcrypt.compare(pass, user.password)) {
      return this.sanitizeUser(user, role);
    }

    return null;
  }

  // Customer login must never authenticate admins through the customer portal.
  async validateCustomer(email: string, pass: string) {
    const customer = await this.prisma.customer.findUnique({ where: { email } });

    if (customer && await bcrypt.compare(pass, customer.password)) {
      return this.sanitizeUser(customer, 'customer');
    }

    return null;
  }

  async validateCustomerByOtp(mobile: string, otp: string) {
    if (otp !== '1234') {
      return null;
    }

    const customer = await this.prisma.customer.findUnique({ where: { mobile } });

    if (!customer) {
      return null;
    }

    return this.sanitizeUser(customer, 'customer');
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id.toString(),
      role: user.role as AuthRole,
    };

    // Update last login if it's a customer
    if (user.role === 'customer') {
      await this.prisma.customer.update({
        where: { id: Number(user.id) },
        data: { lastLoginAt: new Date() },
      }).catch(err => console.error('Failed to update last login:', err));
    }

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getAuthenticatedUser(userId: string, role: AuthRole) {
    if (role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: Number(userId) },
      });

      if (!admin) {
        throw new UnauthorizedException('Session is no longer valid');
      }

      return this.sanitizeUser(admin, 'admin');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: Number(userId) },
    });

    if (!customer) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    return this.sanitizeUser(customer, 'customer');
  }

  async registerCustomer(dto: RegisterDto) {
    const { email, password, name, mobile, otp, address } = dto;

    if (otp !== '1234') {
      throw new BadRequestException('Invalid OTP');
    }

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (existingCustomer) {
      throw new BadRequestException('Customer with this email already exists');
    }

    if (mobile) {
      const existingMobile = await this.prisma.customer.findUnique({
        where: { mobile },
      });
      if (existingMobile) {
        throw new BadRequestException('Customer with this mobile already exists');
      }
    }

    try {
      const effectivePassword = password || `OTP_${Math.random().toString(36).slice(-8)}`;
      const hashedPassword = await bcrypt.hash(effectivePassword, 10);
      const customer = await this.prisma.customer.create({
        data: {
          email,
          name,
          mobile,
          address,
          password: hashedPassword,
          status: 1,
        },
      });

      return this.sanitizeUser(customer, 'customer');
    } catch (error) {
      throw new BadRequestException('Failed to register customer: ' + error.message);
    }
  }

  async forgotPassword(email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      // Don't leak whether the email exists or not, but for our case we can return success
      return { success: true, message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    // Store token in DB
    await this.prisma.passwordResetToken.upsert({
      where: { email },
      update: {
        token: hashedToken,
        createdAt: new Date(),
      },
      create: {
        email,
        token: hashedToken,
        createdAt: new Date(),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Setup NodeMailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        await transporter.sendMail({
          from: `"Fylex Support" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Password Reset Request',
          html: `<p>Hello ${customer.name},</p><p>You requested a password reset. Click the link below to reset it:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`,
        });
        console.log(`Password reset email sent to ${email}`);
      } else {
        // Simulation mode
        console.log(`\n========================================================`);
        console.log(`[SIMULATED EMAIL] Password reset requested for: ${email}`);
        console.log(`Reset Link: ${resetLink}`);
        console.log(`========================================================\n`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      // Even if email fails, return success to not leak errors/info to user
    }

    return { success: true, message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetCustomerPassword(resetPasswordDto: ResetPasswordDto & { token?: string }) {
    const { email, password, token } = resetPasswordDto;

    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const isValidToken = await bcrypt.compare(token, resetRecord.token);
    if (!isValidToken) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Check expiration (e.g. 1 hour)
    const tokenAge = Date.now() - new Date(resetRecord.createdAt!).getTime();
    if (tokenAge > 3600000) {
      throw new BadRequestException('Password reset token has expired');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new BadRequestException('No customer account found with this email');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.customer.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Clear the token
      await this.prisma.passwordResetToken.delete({
        where: { email },
      });

      return {
        success: true,
        message: 'Password updated successfully',
        email,
      };
    } catch (error) {
      throw new BadRequestException('Failed to update password: ' + error.message);
    }
  }

  async validateAdmin(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    if (admin && await bcrypt.compare(password, admin.password)) {
      return this.login(this.sanitizeUser(admin, 'admin'));
    }

    throw new UnauthorizedException('Invalid admin credentials');
  }

  async checkMobileExists(mobile: string) {
    const customer = await this.prisma.customer.findUnique({ where: { mobile } });
    return !!customer;
  }
}


