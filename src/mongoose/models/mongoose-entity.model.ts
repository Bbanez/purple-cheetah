import { Document, Types } from 'mongoose';

export interface IEntity extends Document {
  _id: Types.ObjectId;
  createdAt: number;
  updatedAt: number;
}

export interface Entity {
  _id: Types.ObjectId;
  createdAt: number;
  updatedAt: number;
}
