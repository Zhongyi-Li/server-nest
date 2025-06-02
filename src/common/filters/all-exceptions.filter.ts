import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any)?.message || message;
    } else if (exception instanceof Error) {
      message = '服务器处理异常';
    }

    // 详细的错误信息，仅用于服务端日志
    const errorInfo = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: HttpStatus[status] || '未知错误',
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    // 记录详细错误日志（服务端）
    this.logger.error(
      `全局异常捕获: ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // 返回给客户端的简化响应
    const clientResponse = {
      code: status,
      message,
    };

    response.status(status).json(clientResponse);
  }
}
