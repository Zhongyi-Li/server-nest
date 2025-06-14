import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
} from '../../common/exceptions/business.exception';

interface TokenCache {
  token: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private tokenCache: Map<string, TokenCache> = new Map();

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 检查用户是否已存在
    try {
      const existingUser = await this.userService.findByUsername(
        registerDto.username,
      );
      if (existingUser) {
        throw new UserAlreadyExistsException(registerDto.username);
      }
    } catch (error) {
      // 如果是UserNotFoundException，说明用户不存在，可以继续注册
      if (!(error.message && error.message.includes('不存在'))) {
        throw error;
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 创建用户
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // 生成token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // 验证用户
    const user = await this.validateUser(loginDto.username, loginDto.password);

    // 生成token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    // 检查是否有缓存的token
    const cacheKey = `${user.id}:${user.username}`;
    const cachedToken = this.tokenCache.get(cacheKey);

    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return {
        access_token: cachedToken.token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          status: user.status,
        },
      };
    }

    // 生成新token
    const token = this.jwtService.sign(payload);

    // 缓存token，设置7天过期
    this.tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    };
  }

  async validateUser(username: string, password: string) {
    try {
      const user = await this.userService.findByUsername(username);
      console.log('检查密码---', user.password, password);
      if (user && (await bcrypt.compare(password, user.password))) {
        if (user.status !== 'active') {
          throw new InvalidCredentialsException();
        }
        return user;
      }

      throw new InvalidCredentialsException();
    } catch (error) {
      throw new InvalidCredentialsException();
    }
  }

  async refreshToken(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
