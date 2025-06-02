import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse();
    const errorMessage =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as any)?.message || '请求处理失败';

    // 详细的错误信息，仅用于服务端日志
    const errorInfo = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      error: HttpStatus[status] || '未知错误',
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    // 记录详细错误日志（服务端）
    this.logger.error(
      `HTTP异常: ${request.method} ${request.url}`,
      JSON.stringify(errorInfo),
    );

    // 返回给客户端的简化响应
    const clientResponse = {
      code: status,
      message: errorMessage,
    };

    response.status(status).json(clientResponse);
  }
}
