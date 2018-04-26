'use strict';
const {OnixClient, AppReference} = require('@onixjs/sdk');
const {Browser} = require('@onixjs/sdk/dist/core/browser.adapters');


// Create SDK Instance
let sdk = new OnixClient({
  host: 'http://127.0.0.1',
  port: 3000,
  adapters: {
    http: Browser.HTTP,
    websocket: Browser.WebSocket
  }
});

let componentRef;

/**
 * @method setup
 * @description This method will initialize the SDK, create a TodoApp Reference
 * and then define a listener for our stream of todos. (Real-Time)
 */
const setup = async () => {
  // Initialize the SDK
  await sdk.init();
  // Create an Application Reference
  const todoApp = await sdk.AppReference('TodoApp');
  // Verify we got a valid AppReference, else throw the error.
  if(todoApp instanceof AppReference) {
    // Create Component Reference
    componentRef = todoApp.Module('TodoModule').Component('TodoComponent');
    // Create a listTodos stream reference
    componentRef.Method('listTodos').stream((todos) => {
      // Update view to show todos
      showTodos(todos);
    });
  } else {
    throw todoApp;
  }
};

/**
 * @method addTodo
 * @description Uses the component reference to call the addTodo remote method.
 * It will create a new todo on the database.
 */
const addTodo = async (e) => {
  e.preventDefault();
  await componentRef.Method('addTodo').call({ text: document.querySelector('#todo-text').value });
}

/**
 * @method removeTodo
 * @description Uses the component reference to call the removeTodo remote method.
 * It will remove a given todo from the database.
 */
const removeTodo = async (todo) => {
  await componentRef.Method('removeTodo').call(todo);
};

/**
 * @method showTodos
 * @description Updates the view template to render the todos list
 */
const showTodos = (todos) => {
  // Get list element
  let ul = document.querySelector('ul');
  // Clean list element content
  ul.innerHTML = '';
  // Iterate todos array and create a list item for each todo
  todos.forEach((todo) => {
    // Create list item
    let li = document.createElement('li');
    // Create span to display todo text
    let span = document.createElement('span');
    span.innerText = todo.text;
    // Create button to handle the remove of a todo
    let button = document.createElement('button');
    button.innerText = 'REMOVE';
    button.addEventListener('click', (e) => {
      removeTodo(todo);
    });
    // Append span and button to li
    li.appendChild(span);
    li.appendChild(button);
    // Append li to ul
    ul.appendChild(li);
  });
}

// Start setup
setup();