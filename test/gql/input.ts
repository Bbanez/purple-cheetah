import { QLInputPrototype, QLFieldPrototype } from '../../src';

export interface TestInput {
  message: string;
}

export class TestQLInput implements QLInputPrototype {
  name: string = 'TestInput';
  fields: QLFieldPrototype[] = [
    {
      name: 'message',
      type: 'String!',
    },
  ];
  description?: string = 'This is test input description';
}
