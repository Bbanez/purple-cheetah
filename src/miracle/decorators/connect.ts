import * as crypto from 'crypto';
import * as osu from 'node-os-utils';
import Axios from 'axios';
import { MiracleServiceKeyStoreConfig } from '../interfaces';
import { MiracleSecurity } from '../security';
import { Miracle } from '../miracle';
import { Logger } from '../../logging';
import { MiracleHeartbeatController } from '../controllers/heartbeat';
import { Types } from 'mongoose';

export function MiracleConnect(config: {
  keyStore: {
    origin: string;
    auth: {
      key: string;
      secret: string;
    };
  };
  registry: {
    origin: string;
    service: {
      name: string;
      origin: string;
      ssl: boolean;
    };
  };
}) {

  const initKeyStore = async () => {
    let security: MiracleSecurity;
    {
      const data = {
        nonce: crypto.randomBytes(6).toString('hex'),
        timestamp: Date.now(),
        key: config.keyStore.auth.key,
        signature: '',
      };
      data.signature = crypto
        .createHmac('sha256', config.keyStore.auth.secret)
        .update(data.timestamp + data.nonce + data.key)
        .digest('hex');
      const keyStoreAuthResult = await Axios({
        url: `${config.keyStore.origin}/miracle/key-store/auth`,
        method: 'POST',
        data,
      });
      const keyStoreConfig: MiracleServiceKeyStoreConfig =
        keyStoreAuthResult.data;
      security = new MiracleSecurity(
        keyStoreConfig.name,
        keyStoreConfig.key,
        keyStoreConfig.secret,
        keyStoreConfig.iv,
        keyStoreConfig.pass,
        keyStoreConfig.policy,
      );
    }
    Miracle.init(security);
    // if (!target.prototype.controllers) {
    //   target.prototype.controllers = [new MiracleHeartbeatController(security)];
    // } else {
    //   target.prototype.controllers.push(
    //     new MiracleHeartbeatController(security),
    //   );
    // }
  };

  const initRegistry = async () => {
    await Miracle.register(config.registry.origin, {
      name: config.registry.service.name,
      heartbeat: '/miracle/heartbeat',
      origin: config.registry.service.origin,
      ssl: config.registry.service.ssl,
      stats: {
        cpu: await osu.cpu.usage(),
        ram: (await osu.mem.used()).usedMemMb / 1024,
        lastCheck: Date.now(),
      },
    });
  };

  return (target: any) => {
    const id = Types.ObjectId();
    target.prototype.queue.push({
      id,
      state: false,
    });
    const logger = new Logger('MiracleConnect');
    logger.info(
      '',
      'Connecting to Miracle Key Store and Miracle Registry .....',
    );
    initKeyStore()
      .then(async () => {
        await initRegistry();
        logger.info('', 'Connection was successful.');
        setInterval(async () => {
          await initRegistry();
        }, 15000);
        setInterval(async () => {
          await initKeyStore();
        }, 60000);
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
