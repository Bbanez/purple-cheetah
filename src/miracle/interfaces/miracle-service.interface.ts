import { Permission } from '../../jwt';

export interface MiracleService {
  name: string;
  url: string;
  secret: string;
  permissions: Permission[];
}
