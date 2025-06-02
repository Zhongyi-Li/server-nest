import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('evv--------', process.env.NODE_ENV);
    return 'Hello World!';
  }
}
