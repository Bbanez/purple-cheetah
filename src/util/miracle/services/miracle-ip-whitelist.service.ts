export class MiracleIpWhitelistService {
  private static ips: string[] = [];

  public add(ip: string) {
    MiracleIpWhitelistService.ips.push(ip);
  }

  public addMany(ips: string[]) {
    MiracleIpWhitelistService.ips = [...MiracleIpWhitelistService.ips, ...ips];
  }

  public isPresent(ip: string): boolean {
    return MiracleIpWhitelistService.ips.find(e => e === ip) ? true : false;
  }
}
