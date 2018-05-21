import { IComponent, Inject, Component, RPC, Stream, AllowEveryone, ModelProvider, OnixMethod } from '@onixjs/core';
import { TodoService } from './todo.service';
import { TodoModel } from './todo.model';
import { EventEmitter } from 'events';
import {OnixMessage} from '@onixjs/sdk';
/**
 * @class TodoComponent
 * @author Jonathan Casarrubias
 * @license MIT
 * @description This class is an example of how to
 * declare components for your application.
 *
 * It must implement the IComponent interface.
 */
@Component({
  // Allow Everyone for DemoPurposes
  acl: [AllowEveryone],
  // Optional component level lifecycle
  // will execute on every RPC Call, do your magic here. :)
  lifecycle: async (
    models: ModelProvider,
    message: OnixMessage,
    method: OnixMethod
  ): Promise<TodoModel> => {
    // before call
    const result = await method();
    // after call
    console.log('Custom Logger: ', result);
    return result;
  },
})
export class TodoComponent implements IComponent {
  /**
   * @prop emmiter
   * @description Event emmiter will be used for
   * the pub-sub pattern.
   */
  private emmiter: EventEmitter = new EventEmitter();
  /**
   * @property service
   * @description This is a dependency injection example.
   * Here we inject a singleton instance of TodoService.
   */
  @Inject.Service(TodoService) private service: TodoService;
  /**
   * @method init
   * @description This method will be executed by the framework
   * when everything has been configured.
   */
  init() {
    // Some emmiters won't require a max number of listeners
    // Others will. That is up to you and your infrastructure.
    // You can also use Mongo/Redis PubSub instead of Emmiters
    this.emmiter.setMaxListeners(0);
  }
  /**
   * @method addTodo
   * @param todo
   * @returns Promise<TodoModel>
   * @description Example method of how to expose through
   * RPC methods that internally might add business logic
   * or database/services calls.
   */
  @RPC()
  async addTodo(todo: TodoModel): Promise<TodoModel> {
    const result = await this.service.create(todo);
    this.emmiter.emit('onCreate', result);
    return result;
  }
  /**
   * @method removeTodo
   * @param todo
   * @returns Promise<TodoModel>
   * @description Example method of how to expose through
   * RPC methods that internally might add business logic
   * or database/services calls.
   */
  @RPC()
  async removeTodo(todo: TodoModel): Promise<TodoModel> {
    const result = await this.service.remove(todo);
    this.emmiter.emit('onRemove', result);
    return result;
  }
  /**
   * @method listTodos
   * @param todo
   * @returns Promise<TodoModel>
   * @description Example of endpoint listing todos, this will
   * return an initial list of todos, then will update
   * on every created or removed todo.
   */
  @Stream()
  async listTodos(stream) {
    // Publish initial stream
    this.publish(stream);
    // Publish on create todos
    this.emmiter.on('onCreate', () => this.publish(stream));
    // Publish on remove todos
    this.emmiter.on('onRemove', () => this.publish(stream))
  }
  /**
   * @method publish
   * @param stream 
   * @description This method will publish a list of todos
   * to the given stream instance.
   */
  private async publish(stream) {
    const list: TodoModel[] = await this.service.find();
    stream(list);
  }
  /**
   * @method onCreate
   * @param todo
   * @description Example method of how to implement the
   * pub-sub pattern. Clients will subscribe to this stream
   * and receive each new created todo.
   */
  @Stream()
  onCreate(stream: (todo: TodoModel) => void) {
    this.emmiter.on('onCreate', (todo: TodoModel) => stream(todo));
  }
  /**
   * @method destroy
   * @param todo
   * @description Destroy method will be executed before terminating
   * an application process.
   */
  destroy() { }
}
