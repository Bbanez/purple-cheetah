import { Logger } from '../logging';
import { Router } from 'express';

export interface ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;
}
