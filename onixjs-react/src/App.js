import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { OnixClient, AppReference } from '@onixjs/sdk';
import { Browser } from '@onixjs/sdk/dist/core/browser.adapters';

class App extends Component {

  constructor() {
    super();
    // Create SDK Instance
    this.sdk = new OnixClient({
      host: 'http://127.0.0.1',
      port: 3000,
      adapters: {
        http: Browser.HTTP,
        websocket: Browser.WebSocket
      }
    });
    // Setup Component
    this.setup();
  }

  render() {
    if (this.state && this.state.todos) {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">OnixJS - React Todo Example</h1>
          </header>
          <form onSubmit={this.addTodo.bind(this)}>
            <label>
              Add Todo:
              <input type="text" value={this.state.value} onChange={this.onChange.bind(this)} />
            </label>
            <input type="submit" value="Add Todo" />
          </form>
          <ul>
            {this.state.todos.map((todo) => <li key={todo._id}>{todo.text} <button onClick={this.removeTodo.bind(this, todo)}>Remove</button></li>)}
          </ul>
        </div>
      );
    } else {
      return <div>Loading...</div>;
    }
  }
  /**
   * @method ngOnInit
   * @description This method will initialize the SDK, create a TodoApp Reference
   * and then define a listener for our stream of todos. (Real-Time)
   */
  async setup() {
    // Initialize the SDK
    await this.sdk.init();
    // Create an Application Reference
    const todoApp = await this.sdk.AppReference('TodoApp');
    // Verify we got a valid AppReference, else throw the error.
    if (todoApp instanceof AppReference) {
      // Create Component Reference
      this.componentRef = todoApp.Module('TodoModule').Component('TodoComponent');
      // Create a listTodos stream reference
      this.componentRef.Method('listTodos').stream((todos) => {
        this.setState({ todos });
      });
    } else {
      throw todoApp;
    }
  }
  /**
   * @method addTodo
   * @description Uses the component reference to call the addTodo remote method.
   * It will create a new todo on the database.
   */
  async addTodo(event) {
    event.preventDefault();
    await this.componentRef.Method('addTodo').call({ text: this.state.value });
    this.setState({value: ''});
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
    this.setState({value: event.target.value});
  }
}

export default App;
