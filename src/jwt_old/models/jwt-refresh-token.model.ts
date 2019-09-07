export interface IRefreshToken {
  value: string;
  expAt: number;
}

export class RefreshToken implements IRefreshToken {
  constructor(public value: string, public expAt: number) {}
}