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
const { config } = require("./node.js");

//mem is a store for the local node
let mem = {};

/**
 * @param {any} state
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function put(state, configuration, callback) {
  if (typeof configuration == 'object') {
    configuration = `${configuration.key}.${configuration.gid}`;
  }
  if (configuration == null){
    configuration = util.id.getID(state);
  }
  if (state == null){
    return callback(new Error('state cannot be null'));
  }
  //console.log(`[mem.put] putting value with key ${configuration} and state ${state} in mem`);
  mem[configuration] = state;
  callback(null, state);
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

  if (typeof configuration == 'object') {
      //support gid-based retrieval
    //configuration = `${configuration.key}.${configuration.gid}`;
    configuration = configuration.key;
  }
  if (mem[configuration] == null) {
    return callback(new Error(`mem.get for ${JSON.stringify(configuration)} not found`));
  }
  callback(null, mem[configuration]);
}

/**
 * @param {SimpleConfig} configuration
 * @param {Callback} callback
 */
function del(configuration, callback) {
  //if configuration is not found, return error
  if (typeof configuration == 'object') {
    configuration = `${configuration.key}.${configuration.gid}`;
  }
  if (mem[configuration] == null) {
    return callback(new Error(`mem.del for ${JSON.stringify(configuration)} not found`));
  }
  const state = mem[configuration];
  delete mem[configuration];
  callback(null, state);
};

module.exports = {put, get, del, append};
