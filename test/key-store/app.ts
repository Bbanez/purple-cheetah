import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  EnableMiracleKeyStore,
} from '../../src';

@EnableMiracleKeyStore({
  configFilePath: 'test/key-store/config.yaml',
})
@Application({
  port: 1280,
  controllers: [],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
