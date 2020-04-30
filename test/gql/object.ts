import { QLObject, QLResponseFactory } from "src";

@QLObject({
  name: QLResponseFactory.create('Test').name,
})
export class TestQLObject {}