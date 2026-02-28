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
- Store should also implement a unique gid path
- Use absolute paths to make sure they are agnostic to where your code is running from!
  Use the `path` module for that.
*/
const path = require('path');
const fs = require('fs');
const util = require('../util/util.js');

/**
 * @param {SimpleConfig} configuration
 * @returns {string | null}
 */
function normalizeConfig(configuration, state) {

  if (configuration == null) {
    return util.id.getID(state);
  }
  //use standard format
  if (typeof configuration === 'object') {
    if (!configuration.key || !configuration.gid) {
      console.log(`[store.normalizeConfig] warning: configuration object ${JSON.stringify(configuration)} missing key or gid`);
    }
    configuration.key = distribution.util.id.getID(configuration.key);
    return `${configuration.key}.${configuration.gid}`
  }
  return String(configuration);
}

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function put(state, configuration, callback) {
  if (state == null) {
    return callback(new Error('state cannot be null'));
  }
  let serializedState = util.serialize(state);
  let key = normalizeConfig(configuration, state);
  console.log(`[store.put] normalized key: ${key} for configuration: ${JSON.stringify(configuration)}`)
  const filePath = path.resolve(__dirname, 'store', String(key));
  //make sure the store directory exists
  fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
    if (err) {
      return callback(err);
    }
    fs.writeFile(filePath, serializedState, (err) => {
      if (err) return callback(err);
      return callback(null, state);
    });
  });
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function get(configuration, callback) {
  const key = normalizeConfig(configuration);
  if (key == null) {
    return callback(new Error('store.get key cannot be null'));
  }
  
  const filePath = path.resolve(__dirname, 'store', key);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(new Error(err.message));
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
  const key = normalizeConfig(configuration);
  if (key == null) {
    return callback(new Error('store.del key cannot be null'));
  }
  //atempt to resolve path at store/[key]
  const filePath = path.resolve(__dirname, 'store', key);
  fs.readFile(filePath, 'utf8', (readErr, data) => {
    if (readErr) {
      return callback(new Error(readErr.message));
    }
    //try to deserialize, erroring if failure
    let value;
    try {
      value = util.deserialize(data);
    } catch (e) {
      return callback(e);
    }
    //given the value, proceed to unlink path and return value.
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        return callback(new Error(unlinkErr.message));
      }
      return callback(null, value);
    });
  });
}

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function append(state, configuration, callback) {
  return callback(new Error('store.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
}

module.exports = { put, get, del, append };
