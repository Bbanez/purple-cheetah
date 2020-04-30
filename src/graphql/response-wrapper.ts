import { HttpException } from '../interfaces';
import { QLResponse } from './interfaces';

export class QLResponseWrapper {
  public static async wrap<T>(
    fn: () => Promise<QLResponse<T>>,
  ): Promise<QLResponse<T>> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof HttpException) {
        return {
          error: {
            status: error.status,
            message: error.message.message,
          },
        };
      }
      throw error;
    }
  }
}
