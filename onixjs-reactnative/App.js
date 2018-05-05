/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, StatusBar, FlatList, Button, TextInput } from 'react-native';
import { OnixClient, AppReference } from '@onixjs/sdk';
import { Browser } from '@onixjs/sdk/dist/adapters/browser.adapters';

export default class App extends Component {

  constructor() {
    super();
    // Set initial state
    this.state = {todos: [], todo: ''};
    // Create SDK Instance
    this.sdk = new OnixClient({
      host: 'http://localhost',
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

  render() {
    const todos = this.state.todos;
    const todo = this.state.todo;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>
        <Text style={styles.header}>OnixJS - React Native Todo App</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.formInput}
            onChangeText={(text) => this.setState({todo: text})}
            placeholder="Enter Todo"
            value={todo}
          />
          <Button
            style={styles.formButton}
            onPress={() => this.addTodo()}
            title="ADD"
          />
        </View>
        <FlatList
          style={styles.list}
          data={todos}
          keyExtractor={(item, index) => 'item-'+index}
          renderItem={({item}) => (
            <View style={styles.listItem}>
              <Text>{item.text}</Text>
              <Button
                onPress={() => this.removeTodo(item)}
                title="remove"
                color="#ff3535"
              />
            </View>
          )}/>
      </View>
    );
  }

  /**
   * @method setup
   * @description This method will initialize the SDK, create a TodoApp Reference
   * and then define a listener for our stream of todos. (Real-Time)
   */
  async setup() {
    // Initialize the SDK
    await this.sdk.init();
    // Create an Application
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
  async addTodo() {
    await this.componentRef.Method('addTodo').call({ text: this.state.todo });
    this.setState({todo: ''});
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    width: '100%',
    color: '#FFFFFF',
    backgroundColor: '#282937'
  },
  form: {
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  formInput: {
    flex: 2,
    height: 40,
    marginLeft: 10,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 20 ,
    backgroundColor : "#FFFFFF",
  },
  formButton: {
    flex: 1,
    height: 40
  },
  list: {
    width: '100%'
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
    marginLeft: 15,
    paddingTop: 5,
    paddingBottom: 5
  }
});
