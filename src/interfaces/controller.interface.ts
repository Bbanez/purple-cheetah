import { Router } from 'express';

export interface IController {
  name?: string;
  baseUri?: string;
  router?: Router;
  initRouter?: () => void;
}
