import { Component, State } from '@stencil/core';
import { OnixClient } from '@onixjs/sdk';
import { Browser } from '@onixjs/sdk/dist/adapters/browser.adapters';
import { AppReference } from '@onixjs/sdk/dist/core/app.reference';

@Component({
  tag: 'my-app',
  styleUrl: 'my-app.css'
})
export class MyApp {
  private sdk: OnixClient;
  private componentRef: any;
  @State() private todos: any[];
  @State() private value: any;
  constructor() {
    // Create SDK Instance
    this.sdk = new OnixClient({
      host: 'http://127.0.0.1',
      port: 3000,
      adapters: {
        http: Browser.HTTP,
        websocket: Browser.WebSocket,
        storage: Browser.LocalStorage
      }
    });
    // Setup Component
    this.setup();
  }
  /**
   * @method setup
   * @description This method will initialize the SDK, create a TodoApp Reference
   * and then define a listener for our stream of todos. (Real-Time)
   */
  private async setup() {
    // Initialize the SDK
    await this.sdk.init();
    // Create an Application Reference
    const todoApp = this.sdk.AppReference('TodoApp');
    // Verify we got a valid AppReference, else throw the error.
    if (todoApp instanceof AppReference) {
      // Create Component Reference
      this.componentRef = todoApp.Module('TodoModule').Component('TodoComponent');
      // Create a listTodos stream reference
      this.componentRef.Method('listTodos').stream((todos) => {
        this.todos = todos ;
      });
    } else {
      throw todoApp;
    }
  }

  public render() {
    if (this.todos) {
      return (
        <div class="App">
          <header class="App-header">
            <img src="assets/icon/icon.png" style={{width: '82px'}}/>
            <h1 class="App-title">OnixJS - Stencil Todo Example</h1>
          </header>
          <form onSubmit={this.addTodo.bind(this)}>
            <label>
              Add Todo:
              <input type="text" value={this.value} onChange={this.onChange.bind(this)} />
            </label>
            <input type="submit" value="Add Todo" />
          </form>
          <ul>
            {this.todos.map((todo) => <li>{todo.text} <button onClick={this.removeTodo.bind(this, todo)}>Remove</button></li>)}
          </ul>
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }

    /**
   * @method addTodo
   * @description Uses the component reference to call the addTodo remote method.
   * It will create a new todo on the database.
   */
  async addTodo(event) {
    event.preventDefault();
    await this.componentRef.Method('addTodo').call({ text: this.value });
    this.value = '';
  }
  /**
   * @method removeTodo
   * @description Uses the component reference to call the removeTodo remote method.
   * It will remove a given todo from the database.
   */
  async removeTodo(todo) {
    await this.componentRef.Method('removeTodo').call(todo);
  }

  onChange(event) {
    this.value = event.target.value;
  }
}
