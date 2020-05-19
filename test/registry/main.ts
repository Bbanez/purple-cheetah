import * as path from 'path';
import { App } from './app';

const app = new App({
  logFileLocation: path.join(__dirname, 'logs'),
  staticContentDirectory: path.join(__dirname, 'public'),
});
app.listen();
