import * as fs from 'fs';
import { MiracleUserService } from '../services/miracle-user.service';
import { MiracleAuthController } from '../miracle-auth.controller';

export function EnableMiracleAuthController(config: {
  pathToUsersJsonFile?: string;
  baseUri: string;
}) {
  return (target: any) => {
    if (config.pathToUsersJsonFile) {
      const miracleUserService = new MiracleUserService();
      fs.readFile(config.pathToUsersJsonFile, (error: Error, data) => {
        miracleUserService.addMany(JSON.parse(data.toString()));
      });
    }
    if (target.prototype.controllers) {
      target.prototype.controllers.push(new MiracleAuthController());
    } else {
      target.prototype.controllers = [new MiracleAuthController()];
    }
  };
}
