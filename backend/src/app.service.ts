import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Welcome to Oniki.net API',
      version: '1.0.0',
      docs: '/api',
    };
  }
}

