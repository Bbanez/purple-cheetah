import { QLResponseFactory } from '../factories';

export function QLObject(config: { name: string; type?: string }) {
  return (target: any) => {
    target.prototype.wrapperObject = QLResponseFactory.create(
      config.name,
      config.type,
    ).object;
    // target.prototype.name = QLResponseFactory.create(config.name, config.type).name;
    target.prototype.name = config.name;
  };
}
