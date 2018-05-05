import {Module, ModelProvider, OnixMessage, OnixMethod} from '@onixjs/core';
import {TodoComponent} from './todo.component';
import {TodoModel} from './todo.model';
import {TodoService} from './todo.service';
/**
 * @class TodoModule
 * @author Jonathan Casarrubias
 * @license MIT
 * @description This demo module is for testing
 * purposes. It contains Todo related components
 */
@Module({
  models: [TodoModel],
  services: [TodoService],
  renderers: [],
  components: [TodoComponent],
  lifecycle: async (
    models: ModelProvider,
    message: OnixMessage,
    method: OnixMethod
  ) => {
    // before call
    const result = await method();
    // after call
    return result;
  },
})
export class TodoModule {}
