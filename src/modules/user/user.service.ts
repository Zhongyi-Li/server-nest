import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { User } from './entities/user.entity';
import {
  UserNotFoundException,
  UserAlreadyExistsException,
} from '../../common/exceptions/business.exception';

@Injectable()
export class UserService {
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      name: '管理员',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = this.users.find(
      (user) => user.username === createUserDto.username,
    );
    if (existingUser) {
      throw new UserAlreadyExistsException(createUserDto.username);
    }

    // 检查邮箱是否已存在
    const existingEmail = this.users.find(
      (user) => user.email === createUserDto.email,
    );
    if (existingEmail) {
      throw new UserAlreadyExistsException(
        `邮箱 ${createUserDto.email} 已被使用`,
      );
    }

    // 如果密码没有加密，则加密密码
    let hashedPassword = createUserDto.password;
    if (!createUserDto.password.startsWith('$2a$')) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    const newUser: User = {
      id: this.users.length + 1,
      ...createUserDto,
      password: hashedPassword,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async findAll(queryUserDto: QueryUserDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, username, email, status } = queryUserDto;

    let filteredUsers = this.users;

    if (username) {
      filteredUsers = filteredUsers.filter((user) =>
        user.username.includes(username),
      );
    }

    if (email) {
      filteredUsers = filteredUsers.filter((user) =>
        user.email.includes(email),
      );
    }

    if (status) {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // 移除密码字段
    const safeUsers = paginatedUsers.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return {
      data: safeUsers as User[],
      total: filteredUsers.length,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // 移除密码字段
    const { password, ...safeUser } = user;
    return safeUser as User;
  }

  async findByUsername(username: string): Promise<User> {
    const user = this.users.find((user) => user.username === username);
    if (!user) {
      throw new UserNotFoundException(username);
    }
    return user; // 认证时需要返回完整用户信息包括密码
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new UserNotFoundException(id);
    }

    // 如果更新用户名，检查是否与其他用户冲突
    if (updateUserDto.username) {
      const existingUser = this.users.find(
        (user) => user.username === updateUserDto.username && user.id !== id,
      );
      if (existingUser) {
        throw new UserAlreadyExistsException(updateUserDto.username);
      }
    }

    // 如果更新邮箱，检查是否与其他用户冲突
    if (updateUserDto.email) {
      const existingEmail = this.users.find(
        (user) => user.email === updateUserDto.email && user.id !== id,
      );
      if (existingEmail) {
        throw new UserAlreadyExistsException(
          `邮箱 ${updateUserDto.email} 已被使用`,
        );
      }
    }

    // 如果更新密码，加密新密码
    if (updateUserDto.password && !updateUserDto.password.startsWith('$2a$')) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    // 移除密码字段
    const { password, ...safeUser } = this.users[userIndex];
    return safeUser as User;
  }

  async remove(id: number): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new UserNotFoundException(id);
    }

    this.users.splice(userIndex, 1);
  }
}
