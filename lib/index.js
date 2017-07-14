'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('babel-polyfill');

exports.default = function (MongoClient, connectionUrl) {
  var isCollection = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(path) {
      var collections;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return getCollectionNames();

            case 2:
              collections = _context7.sent;
              return _context7.abrupt('return', collections.indexOf(path) !== -1);

            case 4:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    return function isCollection(_x7) {
      return _ref7.apply(this, arguments);
    };
  }();

  var getCollectionNames = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
      var connection, collections;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return getConnection();

            case 2:
              connection = _context8.sent;
              _context8.t0 = Array;
              _context8.next = 6;
              return connection.listCollections().toArray();

            case 6:
              _context8.t1 = _context8.sent;
              collections = _context8.t0.from.call(_context8.t0, _context8.t1);
              return _context8.abrupt('return', _lodash2.default.map(collections, 'name'));

            case 9:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    return function getCollectionNames() {
      return _ref8.apply(this, arguments);
    };
  }();

  var _connection = null;

  return Object.freeze({
    ref,
    child: child('')
  });

  function getConnection() {
    var _this = this;

    return new Promise(function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!_connection) {
                  _context.next = 5;
                  break;
                }

                resolve(_connection);
                _context.next = 9;
                break;

              case 5:
                _context.next = 7;
                return MongoClient.connect(connectionUrl);

              case 7:
                _connection = _context.sent;

                resolve(_connection);

              case 9:
                _context.next = 15;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context['catch'](0);

                console.log('ERROR', _context.t0);
                reject(_context.t0);

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this, [[0, 11]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
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
    return function (path) {
      return ref(getPathString([basePath, path]));
    };
  }

  function set(path) {
    var _this2 = this;

    return function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(value) {
        var connection, pathArray, collectionName, collection, updateFilter, updateObject, unsetUpdateObject;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return getConnection();

              case 2:
                connection = _context2.sent;
                pathArray = getPathArray(path);
                collectionName = void 0, collection = void 0, updateFilter = void 0;
                _context2.t0 = pathArray.length;
                _context2.next = _context2.t0 === 0 ? 8 : _context2.t0 === 1 ? 10 : _context2.t0 === 2 ? 14 : 20;
                break;

              case 8:
                throw new Error('path?');

              case 10:
                collection = connection.collection('__values');
                value = getInsertValue(null, value);
                //console.log(path, value);
                return _context2.abrupt('return', collection.updateOne({ _id: path }, value, { upsert: true }));

              case 14:
                collectionName = getCollectionName(path);
                collection = connection.collection(collectionName);
                updateFilter = getUpdateFilter(path);
                value = getInsertValue(null, value);
                // console.log('SET', updateFilter, value);
                return _context2.abrupt('return', collection.replaceOne(updateFilter, value, { upsert: true }));

              case 20:
                collectionName = getCollectionName(path);
                collection = connection.collection(collectionName);
                updateFilter = getUpdateFilter(path);
                updateObject = getUpdateObject(path, value);
                unsetUpdateObject = getUnsetUpdateObject(path, value);
                _context2.next = 27;
                return collection.updateOne(updateFilter, unsetUpdateObject, { upsert: true });

              case 27:
                return _context2.abrupt('return', collection.updateOne(updateFilter, updateObject, { upsert: true }));

              case 29:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }));

      return function (_x3) {
        return _ref2.apply(this, arguments);
      };
    }();
  }

  function update(path) {
    var _this3 = this;

    return function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(data) {
        var connection, pathArray, collectionName, collection, updateFilter, updateObject;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return getConnection();

              case 2:
                connection = _context3.sent;
                pathArray = getPathArray(path);
                collectionName = void 0, collection = void 0, updateFilter = void 0;
                _context3.t0 = pathArray.length;
                _context3.next = _context3.t0 === 0 ? 8 : _context3.t0 === 1 ? 10 : _context3.t0 === 2 ? 14 : 19;
                break;

              case 8:
                throw new Error('path?');

              case 10:
                path = '__values/' + path;
                collection = connection.collection('__values');
                return _context3.abrupt('return', collection.updateOne({ _id: path }, data, { upsert: true }));

              case 14:
                collectionName = getCollectionName(path);
                collection = connection.collection(collectionName);
                updateFilter = getUpdateFilter(path);
                return _context3.abrupt('return', collection.updateOne(updateFilter, data, { upsert: true }));

              case 19:
                collectionName = getCollectionName(path);
                collection = connection.collection(collectionName);
                updateFilter = getUpdateFilter(path);
                updateObject = getUpdateObject(path, data);
                return _context3.abrupt('return', collection.updateOne(updateFilter, updateObject, { upsert: true }));

              case 25:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this3);
      }));

      return function (_x4) {
        return _ref3.apply(this, arguments);
      };
    }();
  }

  function remove(path) {
    var _this4 = this;

    return function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(data) {
        var connection, collections;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return getConnection();

              case 2:
                connection = _context4.sent;

                if (!(path === 'node')) {
                  _context4.next = 11;
                  break;
                }

                _context4.next = 6;
                return connection.listCollections().toArray();

              case 6:
                collections = _context4.sent;
                _context4.next = 9;
                return Promise.all(collections.map(function (collection) {
                  if (collection.name.indexOf("system.") === -1) {
                    return connection.collection(collection.name).drop();
                  }
                }));

              case 9:
                _context4.next = 12;
                break;

              case 11:
                return _context4.abrupt('return', update(path, null));

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this4);
      }));

      return function (_x5) {
        return _ref4.apply(this, arguments);
      };
    }();
  }

  function push(path) {
    var _this5 = this;

    return function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(data) {
        var connection, pathArray, collection, collectionName, findFilter, pushObject;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return getConnection();

              case 2:
                connection = _context5.sent;
                pathArray = getPathArray(path);
                collection = void 0;
                _context5.t0 = pathArray.length;
                _context5.next = _context5.t0 === 0 ? 8 : _context5.t0 === 1 ? 10 : 14;
                break;

              case 8:
                throw new Error('path?');

              case 10:
                collection = connection.collection(path);
                data = getInsertValue(null, data);
                return _context5.abrupt('return', collection.insertOne(data));

              case 14:
                collectionName = getCollectionName(path);

                collection = connection.collection(collectionName);
                findFilter = getFindFilter(path);
                pushObject = getPushObject(path + '/_values', data);
                return _context5.abrupt('return', collection.updateOne(findFilter, pushObject, { upsert: true }));

              case 20:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this5);
      }));

      return function (_x6) {
        return _ref5.apply(this, arguments);
      };
    }();
  }

  function once(path) {
    var eventEmitter = new _events2.default();

    process.nextTick(_asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
      var connection, pathArray, collectionName, collection, findFilter, result, resultDoc;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return getConnection();

            case 2:
              connection = _context6.sent;
              pathArray = getPathArray(path);
              collectionName = void 0, collection = void 0, findFilter = void 0, result = void 0, resultDoc = void 0;
              _context6.t0 = pathArray.length;
              _context6.next = _context6.t0 === 0 ? 8 : _context6.t0 === 1 ? 10 : _context6.t0 === 2 ? 33 : 44;
              break;

            case 8:
              throw new Error('path?');

            case 10:
              _context6.next = 12;
              return isCollection(path);

            case 12:
              if (!_context6.sent) {
                _context6.next = 24;
                break;
              }

              collectionName = getCollectionName(path);
              collection = connection.collection(collectionName);
              _context6.next = 17;
              return collection.find({}).toArray();

            case 17:
              _context6.t1 = _context6.sent;

              if (_context6.t1) {
                _context6.next = 20;
                break;
              }

              _context6.t1 = null;

            case 20:
              result = _context6.t1;

              result = getResult(result);
              _context6.next = 32;
              break;

            case 24:
              collection = connection.collection('__values');
              _context6.next = 27;
              return collection.findOne({ _id: path });

            case 27:
              _context6.t2 = _context6.sent;

              if (_context6.t2) {
                _context6.next = 30;
                break;
              }

              _context6.t2 = {};

            case 30:
              result = _context6.t2;

              result = getResult(result);

            case 32:
              return _context6.abrupt('break', 45);

            case 33:
              collectionName = getCollectionName(path);
              collection = connection.collection(collectionName);
              findFilter = getFindFilter(path);
              _context6.next = 38;
              return collection.findOne(findFilter);

            case 38:
              _context6.t3 = _context6.sent;

              if (_context6.t3) {
                _context6.next = 41;
                break;
              }

              _context6.t3 = null;

            case 41:
              result = _context6.t3;

              result = getResult(result);
              return _context6.abrupt('break', 45);

            case 44:
              return _context6.abrupt('break', 45);

            case 45:

              eventEmitter.emit('value', getSnapshot(collectionName, result));

            case 46:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    })));

    return eventEmitter.once.bind(eventEmitter);
  }

  function getSnapshot(key, result) {
    return {
      key,
      exists: function exists() {
        return !!result;
      },
      val: function val() {
        return result;
      }
    };
  }

  function getPathArray(path) {
    return _lodash2.default.compact(path.split('/'));
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
    var documentId = getPathArray(path)[1];
    return {
      _id: documentId
    };
  }

  function getUpdateFilter(path) {
    var documentId = getPathArray(path)[1];
    return {
      _id: documentId
    };
  }

  function getInsertValue(key, value) {
    if (_lodash2.default.isString(value) || _lodash2.default.isNumber(value) || _lodash2.default.isBoolean(value)) {
      var insertVal = {
        '_value': value
      };
      if (key) {
        insertVal['_id'] = key;
      }
      return insertVal;
    } else if (_lodash2.default.isPlainObject(value)) {
      return value;
    } else if (_lodash2.default.isArray(value)) {
      return _lodash2.default.zipObject(Object.keys(value), Object.values(value));
    } else {
      throw new Error('getInsertValue, what else? ' + JSON.stringify(value));
    }
  }

  function getResult(result) {
    if (result === null) {
      return null;
    } else if (_lodash2.default.isPlainObject(result) && result.hasOwnProperty('_value')) {
      return result._value;
    } else if (_lodash2.default.isPlainObject(result) && result.hasOwnProperty('_values')) {
      return getResult(result._values);
    } else if (_lodash2.default.isPlainObject(result)) {
      return _lodash2.default.omit(result, '_id');
    } else if (_lodash2.default.isArray(result)) {
      return (0, _lodash2.default)(result).keyBy('_id').mapValues(getResult).value();
    } else {
      throw new Error('Get result, what else?? ' + JSON.stringify(result));
    }
  }

  function getPushObject(path, data) {
    var pathArray = getPathArray(path);
    var pushPathItems = pathArray.slice(2);
    var _id = (0, _mongodb.ObjectId)();
    data = getInsertValue(_id, data);
    var pushObject = data;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = pushPathItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var pathItem = _step.value;

        pushObject = {
          [pathItem]: Object.assign({}, pushObject)
        };
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    pushObject = {
      '$push': Object.assign({}, pushObject)
    };

    return pushObject;
  }

  function getUpdateObject(path, data) {
    var pathArray = getPathArray(path);
    var updatePathItems = pathArray.slice(2);
    var updateObject = data;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = updatePathItems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var pathItem = _step2.value;

        updateObject = {
          [pathItem]: Object.assign({}, updateObject)
        };
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return updateObject;
  }

  function getUnsetUpdateObject(path) {
    var pathArray = getPathArray(path);
    var updatePathItems = pathArray.slice(2, -1);
    var unsetKey = pathArray.slice(-1)[0];
    var updateObject = { $unset: { [unsetKey]: 1 } };
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = updatePathItems[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var pathItem = _step3.value;

        updateObject = {
          [pathItem]: Object.assign({}, updateObject)
        };
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return updateObject;
  }
};