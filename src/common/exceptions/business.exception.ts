import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, code: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, code);
  }
}

// 常见的业务异常
export class UserNotFoundException extends BusinessException {
  constructor(id?: number | string) {
    super(id ? `用户 ${id} 不存在` : '用户不存在', HttpStatus.NOT_FOUND);
  }
}

export class UserAlreadyExistsException extends BusinessException {
  constructor(username?: string) {
    super(
      username ? `用户名 ${username} 已存在` : '用户已存在',
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super('用户名或密码错误', HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenOperationException extends BusinessException {
  constructor(operation?: string) {
    super(
      operation ? `无权限执行操作: ${operation}` : '无权限执行此操作',
      HttpStatus.FORBIDDEN,
    );
  }
}
