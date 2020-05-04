import {
  QLResolver,
  QLResolverType,
  QLResponseFactory,
  QLResolverPrototype,
  QLArgPrototype,
  QLResponse,
} from '../../src';
import { Test } from './object';
import { TestInput } from './input';

@QLResolver<Test>({
  name: 'test',
  description: 'Test resolver description.',
  type: QLResolverType.QUERY,
  returnType: QLResponseFactory.create('Test').name,
  args: [
    {
      name: 'test',
      type: 'TestInput!',
    },
  ],
  resolver: async (test: TestInput) => {
    return {
      test: test.message,
    };
  },
})
export class TestQLResolver implements QLResolverPrototype {
  name: string;
  type: QLResolverType;
  root: {
    args?: QLArgPrototype[];
    returnType: string;
  };
  resolver: (args: any) => Promise<QLResponse<Test>>;
  description?: string;
}
