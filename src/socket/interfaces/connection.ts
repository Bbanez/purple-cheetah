export interface SocketConnection {
  createdAt: number;
  name: string;
  connected: {
    state: boolean;
    error: any;
  };
  socket: any;
}
