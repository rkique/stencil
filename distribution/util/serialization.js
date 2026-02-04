// @ts-check

const assert = require('assert');
const { type } = require('os');

/**
 * @param {any} object
 * @returns {string}
 */
function serialize(object) {

  //Number, String, Boolean
  const primitives = ["number", "string", "boolean"]

  // Handle null
  if (object === null) {
    return JSON.stringify(null);
  }

  //Handle undefined
  else if (typeof object === 'undefined') {
    return JSON.stringify({ type: 'undefined', value: '' })
  }

  //Handle function
  else if (typeof object === 'function') {
    function extractFunctionParts(func) {
      const funcStr = func.toString();
      //arrow case
      if (funcStr.includes('=>')) {
        const arrowIndex = funcStr.indexOf('=>');
        let paramsPart = funcStr.slice(0, arrowIndex).trim();
        let bodyPart = funcStr.slice(arrowIndex + 2).trim();
        paramsPart = paramsPart.replace(/^\(|\)$/g, '');
        const args = paramsPart ? paramsPart.split(',').map(p => p.trim()) : [];
        if (!bodyPart.startsWith('{')) {
          bodyPart = `return ${bodyPart};`;
        } else {
          bodyPart = bodyPart.slice(1, -1).trim();
        }
        return { args, body: bodyPart };
      } else {
        // Regular function matching args.
        const argsMatch = funcStr.match(/\(([^)]*)\)/);
        const args = argsMatch && argsMatch[1]
          ? argsMatch[1].split(',').map(arg => arg.trim()).filter(Boolean)
          : [];
        const bodyMatch = funcStr.match(/\{([\s\S]*)\}/);
        const body = bodyMatch ? bodyMatch[1].trim() : '';
        return { args, body };
      }
    }
    // Usage in serialize:
    const { args, body } = extractFunctionParts(object);
    const wrappedFunction = {
      type: "function",
      args: args,
      body: body
    };
    return JSON.stringify(wrappedFunction);
  }

  //Handle Error
  else if (object instanceof Error) {
    const errorProps = {};
    Object.getOwnPropertyNames(object).forEach(function (key) {
      errorProps[key] = object[key];
    });
    const wrappedError = {
      type: "error",
      value: JSON.stringify(errorProps)
    }
    return JSON.stringify(wrappedError);
  }

  //Handle Date
  else if (object instanceof Date) {
    const wrappedDate = {
      type: "date",
      value: object.toISOString()
    }
    return JSON.stringify(wrappedDate)
  }

  //Handle array
  else if (Array.isArray(object)) {
    let serializedDict = {}
    for (var i = 0; i < object.length; i++) {
      serializedDict[`${i}`] = serialize(object[i])
    }
    const wrappedArray = {
      type: "array",
      value: serializedDict
    }
    return JSON.stringify(wrappedArray)
  }

  //Handle primitives
  else if (primitives.includes(typeof object)) {
    let value = object.toString()
    const wrapped = {
      type: typeof object,
      value: value
    }
    return JSON.stringify(wrapped);
  }
  //Handle object
  else {
    let serializedDict = {}
    for (let key of Object.keys(object)) {
      serializedDict[key] = serialize(object[key])
    }
    const wrappedObject = {
      type: "object",
      value: serializedDict
    }
    return JSON.stringify(wrappedObject)
  }
}

/**
 * @param {string} string
 * @returns {any}
 */
function deserialize(string) {
  if (typeof string !== 'string') {
    throw new Error(`Invalid argument type: ${typeof string}.`);
  }
  let parsed = JSON.parse(string);
  if (parsed == null) return null
  if (parsed.type == 'undefined') return undefined
  if (parsed.type == 'function') {
    const func = new Function(...parsed.args, parsed.body);
    return func;
  }
  let serializedDict;
  switch (parsed.type) {
    case 'error':
      const errorObj = JSON.parse(parsed.value);
      const error = new Error();
      Object.assign(error, errorObj);
      return error;
    case 'date':
      return new Date(parsed.value);
    case 'array':
      serializedDict = parsed.value
      const length = Object.keys(serializedDict).length
      //return an Array from an iterable
      return Array.from({ length }, (_, i) => deserialize(serializedDict[i]))
    case 'number':
      return Number(parsed.value);
    case 'string':
      return String(parsed.value);
    case 'boolean':
      return parsed.value === 'true';
    //recursively deserialize parsed object values
    case 'object':
      serializedDict = parsed.value
      let deserializedObject = {}
      for (let key of Object.keys(serializedDict)) {
        deserializedObject[key] = deserialize(serializedDict[key])
      }
      return deserializedObject
    default:
      throw new Error(`Unsupported type during deserialization: ${parsed.type}`);
  }
}

module.exports = {
  serialize,
  deserialize,
};
