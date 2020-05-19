import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  EnableMiracleRegistry,
} from '../../src';

@EnableMiracleRegistry({
  keyStore: {
    origin: 'http://localhost:1280',
    auth: {
      key: '1',
      secret: 'reg',
    },
  },
})
@Application({
  port: 1281,
  controllers: [],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
