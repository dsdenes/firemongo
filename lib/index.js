'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongodb = require('mongodb');

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-polyfill');

exports.default = (MongoClient, connectionUrl) => {

  let _connection = null;

  return Object.freeze({
    ref,
    child: child('')
  });

  function getConnection() {
    return new Promise(async (resolve, reject) => {
      try {
        if (_connection) {
          resolve(_connection);
        } else {
          _connection = await MongoClient.connect(connectionUrl);
          resolve(_connection);
        }
      } catch (err) {
        console.log('ERROR', err);
        reject(err);
      }
    });
  }

  function ref(path) {
    return {
      set: set(path),
      update: update(path),
      remove: remove(path),
      push: push(path),
      once: once(path),
      child: child(path)
    };
  }

  function child(basePath) {
    return path => {
      return ref(getPathString([basePath, path]));
    };
  }

  function set(path) {
    return async value => {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      if (pathArray.length === 0) {
        throw new Error('set path?');
      } else if (pathArray.length === 1) {
        const collection = connection.collection('__values');
        const updateValue = getInsertValue(null, value);
        return collection.updateOne({ _id: path }, updateValue, { upsert: true });
      } else if (pathArray.length === 2) {
        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        const updateFilter = getUpdateFilter(path);
        const updateValue = getInsertValue(null, value);
        return collection.replaceOne(updateFilter, updateValue, { upsert: true });
      } else {
        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        const updateFilter = getUpdateFilter(path);
        const unsetUpdateObject = getUnsetUpdateObject(path);
        await collection.updateOne(updateFilter, unsetUpdateObject, { upsert: true });
        const setObject = getSetObject(path, value);
        return collection.updateOne(updateFilter, setObject, { upsert: true });
      }
    };
  }

  function update(path) {
    return async value => {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      if (pathArray.length === 0) {
        throw new Error('update path?');
      } else if (pathArray.length === 1) {
        const collection = connection.collection('__values');
        return collection.updateOne({ _id: path }, { '$set': value }, { upsert: true });
      } else if (pathArray.length === 2) {
        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        const updateFilter = getUpdateFilter(path);
        return collection.updateOne(updateFilter, { '$set': value }, { upsert: true });
      } else {
        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        const updateFilter = getUpdateFilter(path);
        const updateObject = getUpdateObject(path, value);
        return collection.updateOne(updateFilter, updateObject, { upsert: true });
      }
    };
  }

  function remove(path) {
    return async () => {
      const connection = await getConnection();
      const pathArray = getPathArray(path);
      if (pathArray.length === 0) {
        const collections = await connection.listCollections().toArray();
        await Promise.all(collections.map(collection => {
          if (collection.name.indexOf("system.") === -1) {
            return connection.collection(collection.name).drop();
          }
        }));
      } else if (pathArray.length === 1) {
        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        try {
          return await collection.drop();
        } catch (err) {
          if (err.message !== 'ns not found') {
            throw err;
          }
        }
      } else if (pathArray.length === 2) {
        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        const findFilter = getUpdateFilter(path);
        return collection.deleteOne(findFilter);
      } else {

        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        const updateFilter = getUpdateFilter(path);
        const unsetUpdateObject = getUnsetUpdateObject(path);
        return collection.updateOne(updateFilter, unsetUpdateObject, { upsert: true });
      }
    };
  }

  function push(path) {
    return async value => {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      if (pathArray.length === 0) {
        throw new Error('push path?');
      } else if (pathArray.length === 1) {
        const collection = connection.collection(path);
        const pushDocument = getPushDocument(value);
        return collection.insertOne(pushDocument);
      } else {
        const collectionName = getCollectionName(path);
        const collection = connection.collection(collectionName);
        const findFilter = getFindFilter(path);
        const pushObject = getPushObject(path, value);
        // console.log(util.inspect(pushObject, { showHidden: false, depth: null }));
        return collection.updateOne(findFilter, pushObject, { upsert: true });
      }
    };
  }

  function once(path) {
    const eventEmitter = new _events2.default();

    process.nextTick(async function () {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      let collectionName, collection, findFilter, result, resultDoc;
      switch (pathArray.length) {
        case 0:
          // TODO get back with all collections??
          break;
        case 1:
          if (await isCollection(path)) {
            collectionName = getCollectionName(path);
            collection = connection.collection(collectionName);
            result = (await collection.find({}).toArray()) || null;
            result = getResult(result);
          } else {
            collection = connection.collection('__values');
            result = (await collection.findOne({ _id: path })) || {};
            result = getResult(result);
          }
          break;
        case 2:
          collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          findFilter = getFindFilter(path);
          result = (await collection.findOne(findFilter)) || null;
          result = getResult(result);
          break;
        default:
          collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          findFilter = getFindFilter(path);
          const resolvePath = getResolvePath(path);
          result = (await collection.findOne(findFilter)) || null;
          result = getResult(result, resolvePath);
          break;
      }

      eventEmitter.emit('value', getSnapshot(collectionName, result));
    });

    return eventEmitter.once.bind(eventEmitter);
  }

  function getSnapshot(key, result) {
    return {
      key,
      exists: () => !!result,
      val: () => result
    };
  }

  async function isCollection(path) {
    const collections = await getCollectionNames();
    return collections.indexOf(path) !== -1;
  }

  async function getCollectionNames() {
    const connection = await getConnection();
    const collections = Array.from((await connection.listCollections().toArray()));
    return _lodash2.default.map(collections, 'name');
  }

  function getPathArray(path) {
    return path ? _lodash2.default.compact(path.split('/')) : [];
  }

  function getPathString(pathArray) {
    pathArray = _lodash2.default.flatten(pathArray);
    pathArray = pathArray.map(getPathArray);
    pathArray = _lodash2.default.flatten(pathArray);
    return pathArray.join('/');
  }

  function getCollectionName(path) {
    return getPathArray(path)[0];
  }

  function getFindFilter(path) {
    const pathArray = getPathArray(path);
    const documentId = pathArray.slice(1)[0];
    let findFilter = {
      _id: documentId
    };
    return findFilter;
  }

  function getUpdateFilter(path) {
    const documentId = getPathArray(path)[1];
    return {
      _id: documentId
    };
  }

  function getResolvePath(path) {
    const pathArray = getPathArray(path);
    const resolvePathArray = pathArray.slice(2);
    const resolvePath = resolvePathArray.join('.');
    return resolvePath;
  }

  function getInsertValue(key, value, force = false) {
    if (force || _lodash2.default.isString(value) || _lodash2.default.isNumber(value) || _lodash2.default.isBoolean(value) || _lodash2.default.isArray(value)) {
      const insertVal = {
        '_value': value
      };
      if (key) {
        insertVal['_id'] = key;
      }
      return insertVal;
    } else if (_lodash2.default.isPlainObject(value)) {
      return Object.assign({}, value);
    } else {
      throw new Error('getInsertValue, what else? ' + JSON.stringify(value));
    }
  }

  function getResult(result, resolvePath) {

    // console.log('getResult', result, resolvePath);

    if (result === null || typeof result === 'undefined') {
      return null;
    } else if (_lodash2.default.isPlainObject(result) && result.hasOwnProperty('_value')) {
      return getResult(result._value);
      // } else if (_.isPlainObject(result) && result.hasOwnProperty('_values')) {
      //   return getResult(result._values);
    } else if (_lodash2.default.isPlainObject(result) && resolvePath) {
      return getResult(_lodash2.default.get(result, resolvePath));
    } else if (_lodash2.default.isPlainObject(result)) {
      return _lodash2.default.omit(result, '_id');
    } else if (_lodash2.default.isArray(result)) {
      if (result.length && result[0].hasOwnProperty('_id')) {
        const arrayResult = Object.values(result);
        return _lodash2.default.zipObject(_lodash2.default.map(arrayResult, '_id'), _lodash2.default.map(arrayResult, '_value'));
      } else {
        return result;
      }
    } else if (_lodash2.default.isNumber(result) || _lodash2.default.isString(result)) {
      return result;
    } else {
      throw new Error('Get result, what else?? ' + JSON.stringify(result));
    }
  }

  function getPushObject(path, value) {
    const pathArray = getPathArray(path);
    if (pathArray.length === 2) {
      pathArray.push('_value');
    }
    let pushPathItems = pathArray.slice(2);
    const _id = (0, _mongodb.ObjectId)();
    let pushObject = {
      [pushPathItems.join('.')]: getInsertValue(_id, value, true)
    };

    // pushPathItems = pushPathItems.reverse();
    // for (let pathItem of pushPathItems) {
    //   pushObject = {
    //     [pathItem]: Object.assign({}, pushObject)
    //   };
    // }

    pushObject = {
      '$push': Object.assign({}, pushObject)
    };

    return pushObject;
  }

  function getPushDocument(value) {
    return {
      _id: (0, _mongodb.ObjectId)(),
      _value: value
    };
  }

  function getSetObject(path, value) {
    const pathArray = getPathArray(path);
    let setPathItems = pathArray.slice(2);
    let setObject = {
      '$set': {
        [setPathItems.join('.')]: value
      }
    };
    return setObject;
  }

  function getUpdateObject(path, value) {
    const pathArray = getPathArray(path);
    let updatePathItems = pathArray.slice(2);
    let updateObject = {
      '$set': {}
    };

    for (let key in value) {
      updateObject.$set[updatePathItems.concat(key).join('.')] = value[key];
    }
    return updateObject;
  }

  function getUnsetUpdateObject(path) {
    let updateObject = { $unset: { [getNestedUnsetPath(path)]: 1 } };
    return updateObject;
  }

  function getNestedUnsetPath(path) {
    const pathArray = getPathArray(path);
    return pathArray.slice(2).join('.');
  }
};