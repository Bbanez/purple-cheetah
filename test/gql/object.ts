import { QLObject, QLObjectPrototype, QLFieldPrototype } from '../../src';

export interface Test {
  test: string;
}

@QLObject({
  name: 'Test',
})
export class TestQLObject implements QLObjectPrototype {
  name: string;
  type?: string;
  fields: QLFieldPrototype[] = [
    {
      name: 'test',
      type: 'String!',
    },
  ];
  description?: string = 'This is object description.';
}
