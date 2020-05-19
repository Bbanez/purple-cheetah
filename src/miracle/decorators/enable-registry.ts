import * as crypto from 'crypto';
import Axios from 'axios';
import { Logger } from '../../logging';
import { MiracleSecurity } from '../security';
import { MiracleServiceKeyStoreConfig } from '../interfaces';
import { MiracleRegistryController } from '../controllers';
import { Types } from 'mongoose';

export function EnableMiracleRegistry(config: {
  keyStore: {
    origin: string;
    auth: {
      key: string;
      secret: string;
    };
  };
}) {
  const init = async (target: any, logger: Logger) => {
    let security: MiracleSecurity;
    {
      logger.info('', 'Connecting to Miracle Key Store .....');
      const data = {
        nonce: crypto.randomBytes(6).toString('hex'),
        timestamp: Date.now(),
        key: config.keyStore.auth.key,
        signature: '',
      };
      data.signature = crypto
        .createHmac('sha256', config.keyStore.auth.secret)
        .update(`${data.timestamp}${data.nonce}${data.key}`)
        .digest('hex');
      const keyStoreAuthResult = await Axios({
        url: `${config.keyStore.origin}/miracle/key-store/auth`,
        method: 'POST',
        data,
      });
      const keyStoreConfig: MiracleServiceKeyStoreConfig =
        keyStoreAuthResult.data;
      security = new MiracleSecurity(
        keyStoreConfig.key,
        keyStoreConfig.secret,
        keyStoreConfig.iv,
        keyStoreConfig.pass,
        keyStoreConfig.policy,
      );
      logger.info('', 'Connection to Miracle Key Store was successful.');
    }
    if (!target.prototype.controllers) {
      target.prototype.controllers = [new MiracleRegistryController(security)];
    } else {
      target.prototype.controllers.push(
        new MiracleRegistryController(security),
      );
    }
  };

  return (target: any) => {
    const logger = new Logger('MiracleRegistry');
    const id = Types.ObjectId();
    target.prototype.queue.push({
      id,
      state: false,
    });
    init(target, logger)
      .then(() => {
        target.prototype.queue.forEach((e) => {
          if (e.id === id) {
            e.state = true;
          }
        });
      })
      .catch((error) => {
        logger.error('', error);
        process.exit(1);
      });
  };
}
