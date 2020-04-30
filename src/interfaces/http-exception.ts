export enum HttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUNT = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export class HttpException {
  public message: any;
  public stack: any;
  constructor(public status: number, message: any) {
    if (typeof message === 'object') {
      this.message = message;
    } else {
      this.message = { message };
    }
    this.stack = new Error().stack;
  }
}
