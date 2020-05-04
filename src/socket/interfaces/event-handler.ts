export interface SocketEventHandler {
  name: string;
  handler: (...args: any[]) => Promise<void>;
}
