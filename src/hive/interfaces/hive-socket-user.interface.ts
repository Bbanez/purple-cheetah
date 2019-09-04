import { HiveEventName } from '../models/hive-event-name.enum';
import { Types } from 'mongoose';

export interface IHiveSocketUser {
  _id: Types.ObjectId;
  createdAt: number;
  updatedAt: number;
  username: string;
  secret: string;
  allowedEventNames: HiveEventName[];
}
