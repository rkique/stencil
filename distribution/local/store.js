// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 *
 * @typedef {Object} StoreConfig
 * @property {?string} key
 * @property {?string} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 */

/* Notes/Tips:

- Use absolute paths to make sure they are agnostic to where your code is running from!
  Use the `path` module for that.
*/
const path = require('path');
const fs = require('fs');
const util = require('../util/util.js');

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
//value, key, callback.
function put(state, configuration, callback) {
  let serializedState = util.serialize(state);
  if (configuration == null){
    configuration = util.id.getID(serializedState);
  }
  if (state == null){
    return callback(new Error('state cannot be null'));
  }
  //use the key as filename, attaching to absolute path
  const filePath = path.resolve(__dirname, 'store', String(configuration));
  fs.writeFile(filePath, serializedState, callback);
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function get(configuration, callback) {
  const filePath = path.resolve(__dirname, 'store', String(configuration));
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }
    try {
      callback(null, util.deserialize(data));
    } catch (e) {
      callback(e);
    }
  });
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function del(configuration, callback) {
  const filePath = path.resolve(__dirname, 'store', String(configuration));
  fs.unlink(filePath, callback);
}

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function append(state, configuration, callback) {
  return callback(new Error('store.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
}

module.exports = {put, get, del, append};
