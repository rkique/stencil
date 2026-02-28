// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Config} Config
 * @typedef {import("../types.js").Hasher} Hasher
 * @typedef {import("../types.js").Node} Node
 */


/**
 * @typedef {Object} StoreConfig
 * @property {string | null} key
 * @property {string} gid
 *
 * @typedef {StoreConfig | string | null} SimpleConfig
 */


/**
 * @param {Config} config
 */
function store(config) {
  const context = {
    gid: config.gid || 'all',
    hash: config.hash || globalThis.distribution.util.id.naiveHash,
    subset: config.subset,
  };

  function normalizeConfig(configuration, state, is_get=false){
    let kid;
    if (configuration == null) {
      //when call from myggroup.store.null, hash id. 
      console.log(`using state ${JSON.stringify(state)} to generate key`);
      kid = distribution.util.id.getID(state);
      return {key: kid, gid: context.gid};
    } else {
      if (typeof configuration === 'string') {
        // if config already looks like hash, use it
        if (/^[0-9a-fA-F]+$/.test(configuration)) {
          return {key: configuration, gid: context.gid};
        }
        kid = distribution.util.id.getID(configuration);
        if (is_get){ return {key: kid, gid: context.gid}; }
        return { key: kid, gid: context.gid };
      } else {
        kid = distribution.util.id.getID(configuration.key);
        if (is_get){ return {key: configuration.key, gid: context.gid}; }
        return { key: kid, gid: context.gid };
      }
    }
  }

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function get(configuration, callback) {
    configuration = normalizeConfig(configuration, undefined, true);
    console.log(`[all.store.get] configuration set as ${JSON.stringify(configuration)}`)
    //SyntaxError: Cannot convert jcarbmpg to a BigInt]
    distribution.local.groups.get(context.gid, (e, nodes) => {

      if (e) return callback(e);
      const nids = Object.keys(nodes);
      const nodeID = context.hash(configuration.key, nids);
      const node = nodes[nodeID];

      if (!node) {
        return callback(new Error(`Node ${nodeID} not found in group ${context.gid}`));
      }
      //use remote store call
      let remote = { node: node, service: 'store', method: 'get' };
      distribution.local.comm.send([configuration], remote, callback);
    });
  }

  /**
   * @param {any} state
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function put(state, configuration, callback) {
    configuration = normalizeConfig(configuration, state);
    console.log(`[all.store.put] configuration set as ${JSON.stringify(configuration)}`)

    distribution.local.groups.get(context.gid, (e, nodes) => {

      if (e) return callback(e);
      const nids = Object.keys(nodes);
      const nodeID = context.hash(configuration.key, nids);
      const node = nodes[nodeID];

      if (!node) {
        return callback(new Error(`Node ${nodeID} not found in group ${context.gid}`));
      }
      console.log(`[all.store.put] we are using configuration ${JSON.stringify(configuration)}`)
      let remote = { node: node, service: 'store', method: 'put' };
      let message = [state, configuration];
      //console.log(`[all.store.put] sending store.put kv pair ${configuration}:${JSON.stringify(state)} to node ${JSON.stringify(node)}`);
      return distribution.local.comm.send(message, remote, callback);
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

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function del(configuration, callback) {
    configuration = normalizeConfig(configuration);
    distribution.local.groups.get(context.gid, (e, nodes) => {

      if (e) return callback(e);
      const nids = Object.keys(nodes);
      const nodeID = context.hash(configuration.key, nids);
      const node = nodes[nodeID];

      if (!node) {
        return callback(new Error(`Node ${nodeID} not found in group ${context.gid}`));
      }
      //use remote store call
      let remote = { node: node, service: 'store', method: 'del' };
      distribution.local.comm.send([configuration], remote, callback);
    }); 
  }
  /**
   * @param {Object.<string, Node>} configuration
   * @param {Callback} callback
   */
  function reconf(configuration, callback) {
    return callback(new Error('store.reconf not implemented'));
  }

  /* For the distributed store service, the configuration will
          always be a string */
  return { get, put, append, del, reconf };
}

module.exports = store;
