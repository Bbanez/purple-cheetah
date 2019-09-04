import { EurekaClient, Eureka } from 'eureka-js-client';
import { Logger } from '../logger';

export function EnableEurekaClient(config: {
  eureka: {
    client: {
      appId: string;
      vipId: string;
      ip: string;
      port: number;
      basicAuth?: {
        username: string;
        password: string;
      };
    };
    server: {
      ip: string;
      port: number;
    };
  };
}) {
  return (target) => {
    const logger = new Logger('EnableEurekaClient');
    const eurekaPortWrapper: EurekaClient.LegacyPortWrapper = {
      // tslint:disable-next-line: object-literal-key-quotes
      $: config.eureka.client.port,
      '@enabled': true,
    };
    const eurekaConfig: EurekaClient.EurekaConfig = {
      instance: {
        app: config.eureka.client.appId,
        hostName: config.eureka.client.ip,
        ipAddr: config.eureka.client.ip,
        statusPageUrl: `http://${config.eureka.client.ip}:${
          config.eureka.client.port
        }`,
        port: eurekaPortWrapper,
        vipAddress: config.eureka.client.vipId,
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          // tslint:disable-next-line: object-literal-key-quotes
          name: 'MyOwn',
        },
      },
      eureka: {
        host: config.eureka.server.ip,
        port: config.eureka.server.port,
        servicePath: '/eureka/apps/',
        preferIpAddress: true,
      },
    };
    target.prototype.eureka = new Eureka(eurekaConfig);
    target.prototype.eureka.start(error => {
      if (error) {
        logger.error('.init', 'Failed to connect to eureka server.')
        return;
      }
      logger.info('.init', 'Connected to eureka server.');
    });
  };
}