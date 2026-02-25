// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 *
 * @typedef {Object} StoreConfig
 * @property {string | null} key
 * @property {string | null} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 */


const util = require('../util/util.js');

let mem = {};

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function put(state, configuration, callback) {
  if (configuration == null){
    configuration = util.id.getID(state);
  }
  if (state == null){
    return callback(new Error('state cannot be null'));
  }
  mem[configuration] = state;
  callback(null, configuration);
};

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function append(state, configuration, callback) {
  return callback(new Error('mem.append not implemented')); // You'll need to implement this method for the distributed processing milestone.
};

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function get(configuration, callback) {
  if (mem[configuration] == null) {
    return callback(new Error('mem.get not found'));
  }
  callback(null, mem[configuration]);
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function del(configuration, callback) {
  delete mem[configuration];
  callback(null, configuration);
};

module.exports = {put, get, del, append};
