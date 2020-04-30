import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  EnableGraphQL,
} from '../src';
import { TestController } from './controller';

@EnableGraphQL({
  uri: '/graphql',
  rootName: 'Test',
  graphiql: true,
})
@Application({
  port: 1280,
  controllers: [new TestController()],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
