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

  /**
   * @param {SimpleConfig} configuration
   * @param {Callback} callback
   */
  function get(configuration, callback) {
    //get the key from the configuration
    console.log(`[store.get] using id for config: ${JSON.stringify(configuration)}`)
    const kid = distribution.util.id.getID(configuration);
    if (typeof configuration === 'string') {
      configuration = { key: configuration, gid: context.gid };
    }

    console.log(`[all.store.get] configuration set as ${JSON.stringify(configuration)}`)
    //get the nodes from invocation context
    distribution.local.groups.get(context.gid, (e, nodes) => {

      if (e) return callback(e);
      const nids = Object.keys(nodes);
      const nodeID = context.hash(kid, nids);
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
    //allow null config for id
    let kid;
    if (configuration == null) {
      kid = distribution.util.id.getID(state);
      configuration = {key: kid, gid: context.gid};
    //not null case
    } else {
      if (typeof configuration === 'string') {
        configuration = { key: configuration, gid: context.gid };
      } else {
      kid = distribution.util.id.getID(configuration.key);
      configuration = { key: kid, gid: context.gid } }
    }

    console.log(`[all.store.put] configuration set as ${JSON.stringify(configuration)}`)
    //get nodes from invocation context
    distribution.local.groups.get(context.gid, (e, nodes) => {

      if (e) return callback(e);
      const nids = Object.keys(nodes);
      const nodeID = context.hash(kid, nids);
      //use the actual node (node config) enumerated by local.groups.get(context.gid)
      const node = nodes[nodeID];

      if (!node) {
        return callback(new Error(`Node ${nodeID} not found in group ${context.gid}`));
      }
      //console.log(`[all.store.put] we are using configuration ${JSON.stringify(configuration)}`)
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
    //get the key from the configuration
    const kid = distribution.util.id.getID(configuration);

    //get the nodes in the local context
    distribution.local.groups.get(context.gid, (e, nodes) => {

      if (e) return callback(e);
      const nids = Object.keys(nodes);
      const nodeID = context.hash(kid, nids);
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
