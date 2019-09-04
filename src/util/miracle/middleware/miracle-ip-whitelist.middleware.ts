import { Middleware } from '../../../interfaces/middleware.interface';
import { Request, Response, NextFunction } from 'express';
import { MiracleIpWhitelistService } from '../services/miracle-ip-whitelist.service';
import { Service } from '../../../decorators/service.decorator';
import { HttpException } from '../../../models/http-exception.model';
import { HttpStatus } from '../../../models/http-status.model';

export class MiracleIpWhitelistMiddleware implements Middleware {
  public uri: string;
  @Service(MiracleIpWhitelistService)
  private miracleIpWhitelistService: MiracleIpWhitelistService;

  constructor(config: { uri: string; allowedIps: string[] }) {
    this.uri = config.uri;
    this.miracleIpWhitelistService.addMany(config.allowedIps);
  }

  public async handler(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    if (
      this.miracleIpWhitelistService.isPresent('0.0.0.0') === false &&
      this.miracleIpWhitelistService.isPresent(
        request.connection.remoteAddress,
      ) === false
    ) {
      throw new HttpException(
        HttpStatus.FORBIDDEN,
        'IP address not whitelisted.',
      );
    }
    next();
  }
}
