/**
 * Special type of exception that is understood
 * by [ExceptionHandlerMiddleware](/classes/exceptionhandlermiddleware.html)
 */
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
