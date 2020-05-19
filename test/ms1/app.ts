import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  MiracleConnect,
} from '../../src';

@MiracleConnect({
  keyStore: {
    origin: 'http://localhost:1280',
    auth: {
      key: '2',
      secret: 'ms1',
    },
  },
  registry: {
    origin: 'http://localhost:1281',
    service: {
      name: '2',
      origin: 'http://localhost:1282',
      ssl: false,
    },
  },
})
@Application({
  port: 1282,
  controllers: [],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
