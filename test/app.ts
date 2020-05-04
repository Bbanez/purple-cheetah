import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  EnableGraphQL,
} from '../src';
import { TestController } from './controller';
import { TestQLObject } from './gql/object';
import { TestQLResolver } from './gql/resolver';
import { TestQLInput } from './gql/input';

@EnableGraphQL({
  uri: '/graphql',
  rootName: 'Test',
  objects: [new TestQLObject()],
  inputs: [new TestQLInput()],
  resolvers: [new TestQLResolver()],
  graphiql: true,
})
@Application({
  port: 1280,
  controllers: [new TestController()],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
