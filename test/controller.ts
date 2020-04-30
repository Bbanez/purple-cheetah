import { ControllerPrototype, Logger, Controller, Get, Post } from '../src';
import { Router, Request } from 'express';

@Controller('/test')
export class TestController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get('/get')
  async get(request: Request): Promise<{ test: string }> {
    return {
      test: 'This is test string',
    };
  }

  @Post('/post')
  async post(request: Request) {
    return request.body;
  }
}
