import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      name: '管理员',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      ...createUserDto,
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

    return {
      data: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  async remove(id: number): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    this.users.splice(userIndex, 1);
  }
}
