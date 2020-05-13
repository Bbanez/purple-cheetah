import * as path from 'path';
import * as YAML from 'yamljs';
import {
  MiracleKeyStoreConfig,
  MiracleKeyStoreConfigSchema,
  MiracleKeyStoreConfigCache,
  MiracleKeyStoreController,
} from '../key-store';
import { ObjectUtility } from '../../util';

export function EnableMiracleKeyStore(config: { configFilePath: string }) {
  return async (target: any) => {
    let conf: MiracleKeyStoreConfig;
    {
      if (config.configFilePath.startsWith('/') === true) {
        conf = YAML.load(config.configFilePath);
      } else {
        conf = YAML.load(path.join(process.cwd(), config.configFilePath));
      }
    }
    ObjectUtility.compareWithSchema(
      conf,
      MiracleKeyStoreConfigSchema,
      '[configFile]',
    );
    MiracleKeyStoreConfigCache.init(conf);
    if (!target.prototype.controllers) {
      target.prototype.controllers = [new MiracleKeyStoreController()];
    } else {
      target.prototype.controllers.push(new MiracleKeyStoreController());
    }
  };
}
