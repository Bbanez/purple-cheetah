import { MiracleResponse, MiracleResponseType } from './models/miracle-response.model';
import { MiracleResponseFactory } from './models/factories/miracle-response.factory';
import { Request } from 'express';
import { StringUtility } from '../string.util';
import { HttpErrorFactory } from '../../models/factories/http-error.factory';
import { Logger } from '../../logger';
import { HttpStatus } from '../../models/http-status.model';
import { ObjectUtility } from '../object.util';

export interface IMiracleDefaultEntityControllerMethods {
  findAll: (request: Request) => Promise<MiracleResponse>;
  findAllById: (request: Request) => Promise<MiracleResponse>;
  add: (request: Request) => Promise<MiracleResponse>;
  update: (request: Request) => Promise<MiracleResponse>;
  deleteById: (request: Request) => Promise<MiracleResponse>;
}

export interface MiracleEntityService<T> {
  findAll: () => Promise<T[]>;
  findAllById: (ids: string[]) => Promise<T[]>;
  add: (entity: T) => Promise<boolean>;
  update: (entity: T) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
}

export class MiracleDefaultEntityControllerMethods<T> {
  constructor(
    private readonly entityService: MiracleEntityService<T>,
    private readonly logger: Logger,
  ) {}

  async findAll(): Promise<MiracleResponse> {
    const entities = await this.entityService.findAll();
    return MiracleResponseFactory.success(entities);
  }

  async findAllById(request: Request): Promise<MiracleResponse> {
    const error = HttpErrorFactory.simple('.findAllById', this.logger);
    const ids: string[] = request.params.ids.split('_');
    for (const i in ids) {
      if (StringUtility.isIdValid(ids[i]) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          MiracleResponseFactory.error({
            type: MiracleResponseType.CONSUMER,
            httpStatus: HttpStatus.BAD_REQUEST,
            propagate: true,
            message: 'Invalid ID hes been found.',
          }),
        );
      }
    }
    const entities = await this.entityService.findAllById(ids);
    return MiracleResponseFactory.success(entities);
  }

  add(config: { bodySchema: any }) {
    return async (request: Request) => {
      const error = HttpErrorFactory.simple('.add', this.logger);
      try {
        ObjectUtility.compareWithSchema(request.body, config.bodySchema);
      } catch (e) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          MiracleResponseFactory.error({
            type: MiracleResponseType.CONSUMER,
            httpStatus: HttpStatus.BAD_REQUEST,
            propagate: true,
            message: e.message,
          }),
        );
      }
      const addEntityResult = await this.entityService.add(request.body);
      if (addEntityResult === false) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          MiracleResponseFactory.error({
            type: MiracleResponseType.CONSUMER,
            httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
            propagate: true,
            message: 'Failed to add entity to database.',
          }),
        );
      }
      return MiracleResponseFactory.success(request.body);
    };
  }

  update(config: { bodySchema: any }) {
    return async (request: Request): Promise<MiracleResponse> => {
      const error = HttpErrorFactory.simple('.add', this.logger);
      try {
        ObjectUtility.compareWithSchema(request.body, config.bodySchema);
      } catch (e) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          MiracleResponseFactory.error({
            type: MiracleResponseType.CONSUMER,
            httpStatus: HttpStatus.BAD_REQUEST,
            propagate: true,
            message: e.message,
          }),
        );
      }
      const updateEntityResult = await this.entityService.update(request.body);
      if (updateEntityResult === false) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          MiracleResponseFactory.error({
            type: MiracleResponseType.CONSUMER,
            httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
            propagate: true,
            message: 'Failed to update entity in database.',
          }),
        );
      }
      return MiracleResponseFactory.success(request.body);
    };
  }

  async deleteById(request: Request): Promise<MiracleResponse> {
    const error = HttpErrorFactory.simple('.deleteById', this.logger);
    if (StringUtility.isIdValid(request.params.id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        MiracleResponseFactory.error({
          type: MiracleResponseType.CONSUMER,
          httpStatus: HttpStatus.BAD_REQUEST,
          propagate: true,
          message: 'Invalid ID hes been provided.',
        }),
      );
    }
    const deleteEntityResult = await this.entityService.deleteById(
      request.params.id,
    );
    if (deleteEntityResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        MiracleResponseFactory.error({
          type: MiracleResponseType.PRODUCER,
          httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
          propagate: true,
          message: 'Failed to delete entity from database.',
        }),
      );
    }
    return MiracleResponseFactory.success({ _id: request.params.id });
  }
}
