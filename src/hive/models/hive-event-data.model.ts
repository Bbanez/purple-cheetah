/** @ignore */
export interface IHiveEventData {
  nonce: string;
  timestamp: number;
  signature: string;
  payload: any;
}

/**
 * Event Data Object. Used for transferring messages
 * between [Client](/globals.html#enablehiveclient) and
 * [Server](/globals.html#enablehiveserver).
 */
export class HiveEventData {
  constructor(
    public nonce: string,
    public timestamp: number,
    public signature: string,
    public payload: any,
  ) {}

  public static schema() {
    return {
      nonce: {
        __type: 'string',
        __required: true,
      },
      timestamp: {
        __type: 'string',
        __required: true,
      },
      signature: {
        __type: 'string',
        __required: true,
      },
    };
  }
}
