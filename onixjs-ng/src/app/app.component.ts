import { Component, OnInit } from '@angular/core';
import { OnixClient, ComponentReference, AppReference} from '@onixjs/sdk';
import { Browser } from '@onixjs/sdk/dist/core/browser.adapters';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /**
   * @property sdk
   * @description This property is a SDK reference.
   * It will connect to the onix scheme provider and
   * configure the environment adapters.
   */
  private sdk: OnixClient = new OnixClient({
    host: 'http://127.0.0.1',
    port: 3000,
    adapters: {
      http: Browser.HTTP,
      websocket: Browser.WebSocket
    }
  });
  /**
   * @property componentRef
   * @description A reference for an app component, used to call
   * multiple methods within that component.
   */
  private componentRef: ComponentReference;
  /**
   * @property observable
   * @description An observable used as wrapper to listen a stream of todos.
   * It will be passed to the angular tempalte as an async iterable
   * (let item of observable | async as todos)
   */
  public observable: Observable<{text: string}>;
  /**
   * @method ngOnInit
   * @description This method will initialize the SDK, create a TodoApp Reference
   * and then define a listener for our stream of todos. (Real-Time)
   */
  async ngOnInit() {
    // Initialize the SDK
    await this.sdk.init();
    // Create an Application Reference
    const todoApp: AppReference | Error = await this.sdk.AppReference('TodoApp');
    // Verify we got a valid AppReference, else throw the error.
    if (todoApp instanceof AppReference) {
      // Create Component Reference
      this.componentRef = todoApp.Module('TodoModule').Component('TodoComponent');
      // Create an Observable that listens for the Todo Stream, so we use async on the template
      this.observable = Observable.create((observer) => {
        // Create a listTodos stream reference
        this.componentRef.Method('listTodos').stream((todos) => observer.next(todos));
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
  async addTodo(input) {
    await this.componentRef.Method('addTodo').call({ text: input.value });
    input.value = '';
  }
  /**
   * @method removeTodo
   * @description Uses the component reference to call the removeTodo remote method.
   * It will remove a given todo from the database.
   */
  async removeTodo(todo) {
    await this.componentRef.Method('removeTodo').call(todo);
  }
}
