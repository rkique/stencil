// @ts-check
/**
 * @typedef {import("../types.js").Callback} Callback
 * @typedef {import("../types.js").Node} Node
 */

//singular node: variable s

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function get(configuration, callback) {
  const id = distribution.util.id;
  //object configuration has value "sid", "nid", "ip", "port", "counts", "heapTotal", or "heapUsed"
  //should implement the ability to get string implementations from callback
  if (configuration == 'nid') {
     return callback(null, id.getNID(distribution.node.config));
  } else if (configuration == 'sid') {
      return callback(null, id.getSID(distribution.node.config));
  } else if (configuration == 'ip') {
    return callback(null, distribution.node.config.ip);
  } else if (configuration == 'port') {
    return callback(null, distribution.node.config.port);
  } else if (configuration == 'counts') {
    console.log('[getting counts] ' + distribution.node.counts);
    return callback(null, distribution.node.counts);
  } else if (configuration == 'heapTotal') {
    return callback(null, process.memoryUsage().heapTotal);
  } else if (configuration == 'heapUsed') {
    return callback(null, process.memoryUsage().heapUsed);
  }
  else {
    console.log('[getting badconfig] ' + configuration);
    return callback(new Error('Unsupported configuration: ' + configuration), null);
  }
};


/**
 * @param {Node} configuration
 * @param {Callback} callback
 */
function spawn(configuration, callback) {
  callback(new Error('status.spawn not implemented'));
}

/**
 * @param {Callback} callback
 */
function stop(callback) {
  callback(new Error('status.stop not implemented'));
}

module.exports = {get, spawn, stop};
