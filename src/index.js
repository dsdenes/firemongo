require('babel-polyfill');
import EventEmitter from 'events';
import _ from 'lodash';
import {
  ObjectId
} from 'mongodb';

export default (MongoClient, connectionUrl) => {

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
    }
  }

  function child(basePath) {
    return (path) => {
      return ref(getPathString([basePath, path]))
    }
  }

  function set(path) {
    return async (value) => {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      let collectionName, collection, updateFilter;
      switch (pathArray.length) {
        case 0:
          throw new Error('path?');
          break;
        case 1:
          collection = connection.collection('__values');
          value = getInsertValue(null, value);
          //console.log(path, value);
          return collection.updateOne({ _id: path }, value, { upsert: true });
          break;
        case 2:
          collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          updateFilter = getUpdateFilter(path);
          value = getInsertValue(null, value);
          // console.log('SET', updateFilter, value);
          return collection.replaceOne(updateFilter, value, { upsert: true });
          break;
        default:
          collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          updateFilter = getUpdateFilter(path);
          const updateObject = getUpdateObject(path, value);
          const unsetUpdateObject = getUnsetUpdateObject(path, value);
          await collection.updateOne(updateFilter, unsetUpdateObject, { upsert: true });
          return collection.updateOne(updateFilter, updateObject, { upsert: true });
          break;
      }
    }
  }

  function update(path) {
    return async (data) => {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      let collectionName, collection, updateFilter;
      switch (pathArray.length) {
        case 0:
          throw new Error('path?');
          break;
        case 1:
          path = '__values/' + path;
          collection = connection.collection('__values');
          return collection.updateOne({ _id: path }, data, { upsert: true });
          break;
        case 2:
          collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          updateFilter = getUpdateFilter(path);
          return collection.updateOne(updateFilter, data, { upsert: true });
          break;
        default:
          collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          updateFilter = getUpdateFilter(path);
          const updateObject = getUpdateObject(path, data);
          return collection.updateOne(updateFilter, updateObject, { upsert: true });
          break;
      }
    }
  }

  function remove(path) {
    return async (data) => {
      const connection = await getConnection();
      if (path === 'node') {
        const collections = await connection.listCollections().toArray();
        await Promise.all(collections.map(collection => {
          if (collection.name.indexOf("system.") === -1) {
            return connection.collection(collection.name).drop();
          }
        }));
      } else {
        return update(path, null);
      }
    }
  }

  function push(path) {
    return async (data) => {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      let collection;
      switch (pathArray.length) {
        case 0:
          throw new Error('path?');
          break;
        case 1:
          collection = connection.collection(path);
          data = getInsertValue(null, data);
          return collection.insertOne(data);
          break;
        default:
          const collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          const findFilter = getFindFilter(path);
          const pushObject = getPushObject(path + '/_values', data);
          return collection.updateOne(findFilter, pushObject, { upsert: true });
          break;
      }
    }
  }

  function once(path) {
    const eventEmitter = new EventEmitter();

    process.nextTick(async function() {
      const connection = await getConnection();
      const pathArray = getPathArray(path);

      let collectionName, collection, findFilter, result, resultDoc;
      switch (pathArray.length) {
        case 0:
          throw new Error('path?');
          break;
        case 1:
          if (await isCollection(path)) {
            collectionName = getCollectionName(path);
            collection = connection.collection(collectionName);
            result = await collection.find({}).toArray() || null;
            result = getResult(result);
          } else {
            collection = connection.collection('__values');
            result = await collection.findOne({ _id: path }) || {};
            result = getResult(result);
          }
          break;
        case 2:
          collectionName = getCollectionName(path);
          collection = connection.collection(collectionName);
          findFilter = getFindFilter(path);
          result = await collection.findOne(findFilter) || null;
          result = getResult(result);
          break;
        default:
          // TODO
          break;
      }

      eventEmitter.emit('value', getSnapshot(collectionName, result));
    });

    return eventEmitter.once.bind(eventEmitter);
  }

  function getSnapshot(key, result) {
    return {
      key,
      val: () => result
    }
  }

  async function isCollection(path) {
    const collections = await getCollectionNames();
    return collections.indexOf(path) !== -1;
  }

  async function getCollectionNames() {
    const connection = await getConnection();
    const collections = Array.from(await connection.listCollections().toArray());
    return _.map(collections, 'name');
  }

  function getPathArray(path) {
    return _.compact(path.split('/'));
  }

  function getPathString(pathArray) {
    pathArray = _.flatten(pathArray);
    pathArray = pathArray.map(getPathArray);
    pathArray = _.flatten(pathArray);
    return pathArray.join('/');
  }

  function getCollectionName(path) {
    return getPathArray(path)[0];
  }

  function getFindFilter(path) {
    const documentId = getPathArray(path)[1];
    return {
      _id: documentId
    }
  }

  function getUpdateFilter(path) {
    const documentId = getPathArray(path)[1];
    return {
      _id: documentId
    }
  }

  function getInsertValue(key, value) {
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
      const insertVal = {
        '_value': value
      };
      if (key) {
        insertVal['_id'] = key;
      }
      return insertVal;
    } else if (_.isPlainObject(value)) {
      return value;
    } else if (_.isArray(value)) {
      return _.zipObject(Object.keys(value), Object.values(value));
    } else {
      throw new Error('getInsertValue, what else? ' + JSON.stringify(value));
    }
  }

  function getResult(result) {
    if (result === null) {
      return null;
    } else if (_.isPlainObject(result) && result.hasOwnProperty('_value')) {
      return result._value;
    } else if (_.isPlainObject(result) && result.hasOwnProperty('_values')) {
      return getResult(result._values);
    } else if (_.isPlainObject(result)) {
      return _.omit(result, '_id');
    } else if (_.isArray(result)) {
      return _(result)
        .keyBy('_id')
        .mapValues(getResult)
        .value();
    } else {
      throw new Error('Get result, what else?? ' + JSON.stringify(result));
    }
  }

  function getPushObject(path, data) {
    const pathArray = getPathArray(path);
    const pushPathItems = pathArray.slice(2);
    const _id = ObjectId();
    data = getInsertValue(_id, data);
    let pushObject = data;
    for (let pathItem of pushPathItems) {
      pushObject = {
        [pathItem]: Object.assign({}, pushObject)
      };
    }

    pushObject = {
      '$push': Object.assign({}, pushObject)
    };

    return pushObject;
  }

  function getUpdateObject(path, data) {
    const pathArray = getPathArray(path);
    const updatePathItems = pathArray.slice(2);
    let updateObject = data;
    for (let pathItem of updatePathItems) {
      updateObject = {
        [pathItem]: Object.assign({}, updateObject)
      };
    }
    return updateObject;
  }

  function getUnsetUpdateObject(path) {
    const pathArray = getPathArray(path);
    const updatePathItems = pathArray.slice(2, -1);
    const unsetKey = pathArray.slice(-1)[0];
    let updateObject = { $unset: { [unsetKey]: 1 } };
    for (let pathItem of updatePathItems) {
      updateObject = {
        [pathItem]: Object.assign({}, updateObject)
      };
    }
    return updateObject;
  }
}

