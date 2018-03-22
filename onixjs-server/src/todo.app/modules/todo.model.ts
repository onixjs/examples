import {Model, IModel, Property} from '@onixjs/core';
import {MongooseDatasource} from './mongoose.datasource';
/**
 * @class TodoModel
 * @author Jonathan Casarrubias
 * @license MIT
 * @description This is an example of how to define and
 * register models for an application.
 *
 * Models are injected in a module context, trying to inject
 * a model within another app or module won't be possible,
 * unless it's also installed in that other module.
 */
@Model({
  // Datasource (Required): Any datasource you create
  datasource: MongooseDatasource
})
export class TodoModel implements IModel {
  // Mongo will return _id once persisted, therefore _id is optional.
  _id?: string;
  // Same as the schema but this will be used when creating
  // New instances of the TodoModel Class
  @Property({
    type: String,
    required: true
  }) text: String;
}
