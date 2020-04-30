import { QLObjectPrototype } from '../interfaces';

export class QLResponseFactory {
  public static create(
    edgeName: string,
    edgeType?: string,
  ): {
    name: string;
    object: QLObjectPrototype;
  } {
    const eType = typeof edgeType !== 'string' ? edgeName : edgeType;
    return {
      name: `${edgeName}Response`,
      object: {
        name: `${edgeName}Response`,
        fields: [
          {
            name: 'error',
            type: 'ResponseError',
          },
          {
            name: eType.startsWith('[') ? 'edges' : 'edge',
            type: eType,
          },
        ],
      },
    };
  }
}
