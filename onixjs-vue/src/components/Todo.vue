<template>
  <div class="hello">
    <h2>{{ title }}</h2>
    <input v-model="todo.text">
    <button v-on:click="addTodo()">Add Todo</button>
    <ul>
      <li v-bind:key="item._id" v-for="item in todos">
        {{ item.text }} <button v-on:click="removeTodo(item)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script>
/* eslint-disable */
import { OnixClient, AppReference } from "@onixjs/sdk";
import { Browser } from "@onixjs/sdk/dist/adapters/browser.adapters";
export default {
  name: "Todo",
  data() {
    return {
      // Title
      title: "OnixJS - Vue Application Example",
      // Create an empty SDK Reference
      sdk: null,
      // Create a todo reference
      todo: { text: "" },
      // Create a  todo list reference
      todos: []
    };
  },
  // Once mounted create an instance of the SDK
  mounted: function() {
    this.sdk = new OnixClient({
      host: "http://127.0.0.1",
      port: 3000,
      adapters: {
        http: Browser.HTTP,
        websocket: Browser.WebSocket,
        storage: Browser.LocalStorage
      }
    });
  },
  // Watch for the SDK to be instantiated so we init our sdk
  // client and create our TodoApp reference.
  // Finally we will create a stream listener for a real-time
  // Todo list
  watch: {
    // Watch SDK
    sdk: async function() {
      // Initialize the SDK
      await this.sdk.init();
      // Create an Application Reference
      const todoApp = this.sdk.AppReference("TodoApp");
      // Verify we got a valid AppReference, else throw the error.
      if (todoApp instanceof AppReference) {
        // Create Component Reference
        this.componentRef = todoApp
          .Module("TodoModule")
          .Component("TodoComponent");
        // Create a listTodos stream reference
        this.componentRef.Method("listTodos").stream(todos => {
          this.todos = todos;
        });
      } else {
        throw todoApp;
      }
    }
  },
  methods: {
    /**
     * @method addTodo
     * @description Uses the component reference to call the addTodo remote method.
     * It will create a new todo on the database.
     */
    addTodo: async function() {
      await this.componentRef.Method("addTodo").call(this.todo);
    },
    /**
     * @method removeTodo
     * @description Uses the component reference to call the removeTodo remote method.
     * It will remove a given todo from the database.
     */
    removeTodo: async function(todo) {
      await this.componentRef.Method("removeTodo").call(todo);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
}
input {
  background: #eee;
  border: 0px;
  padding: 5px 2.5px;
}
</style>
