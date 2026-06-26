import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { UserService } from './user.service';
import { CustomerController } from './customer.controller';
import { UserController } from './user.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController, UserController],
  providers: [CustomerService, UserService],
  exports: [CustomerService, UserService],
})
export class CustomerModule {}


