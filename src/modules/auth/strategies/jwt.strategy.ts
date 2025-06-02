import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // 生产环境应该使用环境变量
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.userService.findOne(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      // 返回的用户信息会被添加到request.user中
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
      };
    } catch (error) {
      throw new UnauthorizedException('无效的token');
    }
  }
}
