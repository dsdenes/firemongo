'use strict';

var _mongodb = require('mongodb');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var mongodb = require('mongo-mock');
mongodb.max_delay = 0;
// const MongoClient = mongodb.MongoClient;

var fireMongo = (0, _index2.default)(_mongodb.MongoClient, 'mongodb://163.172.170.96:27122/firemongo');

describe('firemongo', function () {

  beforeAll(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fireMongo.child('node').remove();

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  describe('set', function () {

    it('should set/get simple value at single path', function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(done) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return fireMongo.ref('settest1').set(1);

              case 2:
                fireMongo.ref('settest1').once('value', function (snapshot) {
                  expect(snapshot.val()).toBe(1);
                  done();
                });

              case 3:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, undefined);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());

    it('should set/get object at single path', function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(done) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return fireMongo.ref('settest2').set({ a: 1 });

              case 2:
                fireMongo.ref('settest2').once('value', function (snapshot) {
                  expect(snapshot.val()).toEqual({ a: 1 });
                  done();
                });

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined);
      }));

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }());

    it('should set/get array at single path', function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(done) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return fireMongo.ref('settest3').set([1, 2, 3]);

              case 2:
                fireMongo.ref('settest3').once('value', function (snapshot) {
                  expect(snapshot.val()).toEqual({ '0': 1, '1': 2, '2': 3 });
                  done();
                });

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined);
      }));

      return function (_x3) {
        return _ref4.apply(this, arguments);
      };
    }());

    it('should set/get simple value at multi level path', function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(done) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return fireMongo.ref('settest/path1').set(1);

              case 2:
                fireMongo.ref('settest/path1').once('value', function (snapshot) {
                  expect(snapshot.val()).toBe(1);
                  done();
                });

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, undefined);
      }));

      return function (_x4) {
        return _ref5.apply(this, arguments);
      };
    }());

    it('should set/get object at multi level path', function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(done) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return fireMongo.ref('settest/path2').set({ a: 1 });

              case 2:
                fireMongo.ref('settest/path2').once('value', function (snapshot) {
                  expect(snapshot.val()).toEqual({ a: 1 });
                  done();
                });

              case 3:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, undefined);
      }));

      return function (_x5) {
        return _ref6.apply(this, arguments);
      };
    }());

    it('should set/get array at multi level path', function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(done) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return fireMongo.ref('settest/path3').set([1, 2, 3]);

              case 2:
                fireMongo.ref('settest/path3').once('value', function (snapshot) {
                  expect(snapshot.val()).toEqual({ '0': 1, '1': 2, '2': 3 });
                  done();
                });

              case 3:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, undefined);
      }));

      return function (_x6) {
        return _ref7.apply(this, arguments);
      };
    }());
  });

  describe('push', function () {

    it('should push/get simple value at single path', function () {
      var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(done) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return fireMongo.ref('pushtest1').push(7);

              case 2:
                fireMongo.ref('pushtest1').once('value', function (snapshot) {
                  var result = Object.values(snapshot.val());
                  expect(result.length).toBe(1);
                  expect(result[0]).toBe(7);
                  done();
                });

              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, undefined);
      }));

      return function (_x7) {
        return _ref8.apply(this, arguments);
      };
    }());

    it('should push/get object at single path', function () {
      var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(done) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return fireMongo.ref('pushtest2').push({ a: 1 });

              case 2:
                fireMongo.ref('pushtest2').once('value', function (snapshot) {
                  var result = Object.values(snapshot.val());
                  expect(result.length).toBe(1);
                  expect(result[0]).toEqual({ a: 1 });
                  done();
                });

              case 3:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, undefined);
      }));

      return function (_x8) {
        return _ref9.apply(this, arguments);
      };
    }());

    it('should push/get simple value at multi level path', function () {
      var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(done) {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return fireMongo.ref('pushtest/path1').push(7);

              case 2:
                fireMongo.ref('pushtest/path1').once('value', function (snapshot) {
                  var result = Object.values(snapshot.val());
                  expect(result.length).toBe(1);
                  expect(result[0]).toBe(7);
                  done();
                });

              case 3:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, undefined);
      }));

      return function (_x9) {
        return _ref10.apply(this, arguments);
      };
    }());

    it('should push/get object at multi level path', function () {
      var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(done) {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return fireMongo.ref('pushtest/path2').push({ a: 1 });

              case 2:
                fireMongo.ref('pushtest/path2').once('value', function (snapshot) {
                  var result = Object.values(snapshot.val());
                  expect(result.length).toBe(1);
                  expect(result[0]).toEqual({ a: 1 });
                  done();
                });

              case 3:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, undefined);
      }));

      return function (_x10) {
        return _ref11.apply(this, arguments);
      };
    }());
  });
});