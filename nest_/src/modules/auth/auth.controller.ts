import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginOtpDto } from './dto/login-otp.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Register request received for email=${registerDto.email}`);
    const user = await this.authService.registerCustomer(registerDto);
    this.logger.log(`Register success for email=${registerDto.email}`);
    return await this.authService.login(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Customer login attempt for email=${loginDto.email}`);
    const user = await this.authService.validateCustomer(loginDto.email, loginDto.password);

    if (!user) {
      this.logger.warn(`Customer login failed for email=${loginDto.email}`);
      throw new UnauthorizedException('Invalid customer credentials');
    }

    const result = await this.authService.login(user);
    this.logger.log(`Customer login success for email=${loginDto.email}`);
    return result;
  }

  @Post('login-otp')
  @HttpCode(HttpStatus.OK)
  async loginOtp(@Body() loginOtpDto: LoginOtpDto) {
    this.logger.log(`Customer OTP login attempt for mobile=${loginOtpDto.mobile}`);
    const user = await this.authService.validateCustomerByOtp(loginOtpDto.mobile, loginOtpDto.otp);

    if (!user) {
      this.logger.warn(`Customer OTP login failed for mobile=${loginOtpDto.mobile}`);
      throw new UnauthorizedException('Invalid mobile number or OTP');
    }

    const result = await this.authService.login(user);
    this.logger.log(`Customer OTP login success for mobile=${loginOtpDto.mobile}`);
    return result;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    this.logger.log(`Forgot password request received for email=${body.email}`);
    const result = await this.authService.forgotPassword(body.email);
    return result;
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto & { token?: string }) {
    this.logger.log(`Password reset execution received for email=${resetPasswordDto.email}`);
    const result = await this.authService.resetCustomerPassword(resetPasswordDto);
    this.logger.log(`Password reset success for email=${resetPasswordDto.email}`);
    return result;
  }

  @Post('check-mobile')
  @HttpCode(HttpStatus.OK)
  async checkMobile(@Body() body: { mobile: string }) {
    this.logger.log(`Check mobile request for mobile=${body.mobile}`);
    const exists = await this.authService.checkMobileExists(body.mobile);
    if (!exists) {
      throw new UnauthorizedException('Mobile number not registered. Please sign up first.');
    }
    return { success: true };
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginDto: LoginDto) {
    this.logger.log(`Admin login attempt for email=${loginDto.email}`);
    const result = await this.authService.validateAdmin(loginDto);
    this.logger.log(`Admin login success for email=${loginDto.email}`);
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    this.logger.log(`Auth verification request for userId=${req.user.userId}, role=${req.user.role}`);
    const user = await this.authService.getAuthenticatedUser(req.user.userId, req.user.role);
    return { user };
  }
}


