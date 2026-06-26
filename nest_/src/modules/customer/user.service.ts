import { Injectable } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Injectable()
export class UserService {
  constructor(private readonly customerService: CustomerService) {}

  async findAll() {
    return this.customerService.getAllUsers();
  }

  async findOne(id: string) {
    return this.customerService.getProfile(id);
  }

  async create(createUserDto: any) {
    // Basic implementation to satisfy the controller
    return { success: true, message: 'User creation not fully implemented', data: createUserDto };
  }

  async update(id: string, updateUserDto: any) {
    return this.customerService.updateCustomer(id, updateUserDto);
  }

  async remove(id: string) {
    return this.customerService.deleteCustomer(id);
  }
}

