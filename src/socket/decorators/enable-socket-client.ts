import { SocketEventHandler } from '../interfaces';

export function CreateSocketClient(config: {
  name: string;
  server: {
    origin: string;
    path?: string;
  };
  eventHandlerFns?: SocketEventHandler[];
}) {
  return () => {};
}
