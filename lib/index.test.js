'use strict';

var _mongodb = require('mongodb');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();
const mongodb = require('mongo-mock');
mongodb.max_delay = 0;

const fireMongo = (0, _index2.default)(_mongodb.MongoClient, process.env.MONGODB_URL);

const serviceAccount = require('../keys/firemongo-85ffd-firebase-adminsdk-u4g11-68e8dae31e.json');

const app = _firebaseAdmin2.default.initializeApp({
  credential: _firebaseAdmin2.default.credential.cert(serviceAccount),
  databaseURL: 'https://firemongo-85ffd.firebaseio.com'
});

const firebase = app.database();

describe('firemongo', () => {

  testWithImplementation(firebase, 'firebase');
  testWithImplementation(fireMongo, 'firemongo');

  function testWithImplementation(firebase, name) {

    beforeAll(async () => {
      await firebase.ref().remove();
    });

    describe(name, () => {
      describe('set', async () => {

        const paths = ['path1', 'path2/path3', 'path3/path4/path5', 'path3/path4/path5/path6', 'path3/path4/path5/path6/path7'];

        const values = [1, { a: 1 }, [1, 2, 3], { a: [1, 2, 3] }, { a: { b: [1, 2, 3] } }];

        await Promise.all(paths.map(path => {
          return Promise.all(values.map(value => {
            return testSetGet(path, value);
          }));
        }));

        function testSetGet(path, value) {
          return new Promise((resolve, reject) => {
            it(`should set/get value (${JSON.stringify(value)}) at path ${path}`, async done => {
              await firebase.ref(path).set(value);
              firebase.ref(path).once('value', snapshot => {
                expect(snapshot.val()).toEqual(value);
                done();
                resolve();
              });
            });
          });
        }
      });

      describe('push', async () => {

        const paths = ['path1', 'path2/path3', 'path3/path4/path5', 'path4/path5/path6/path7', 'path5/path6/path7/path8/path9'];

        const values = [1, { a: 1 }, [1, 2, 3], { a: [1, 2, 3] }, { a: { b: [1, 2, 3] } }];

        await Promise.all(paths.map(path => {
          return Promise.all(values.map(value => {
            return testPushGet(path, value);
          }));
        }));

        function testPushGet(path, value) {
          return new Promise((resolve, reject) => {
            it(`should push/get value (${JSON.stringify(value)}) at path ${path}`, async done => {
              await firebase.ref(path).remove();
              await firebase.ref(path).push(value);
              await firebase.ref(path).push(value);
              firebase.ref(path).once('value', snapshot => {
                const result = snapshot.val();
                // console.log('RESULT', result);
                expect(_lodash2.default.isPlainObject(result)).toBe(true);
                expect(Object.values(result)).toEqual([value, value]);
                expect(result[Object.keys(result)[0]]).toEqual(value);
                expect(result[Object.keys(result)[1]]).toEqual(value);
                done();
                resolve();
              });
            });
          });
        }
      });

      describe.only('update', async () => {

        const paths = ['path1', 'path2/path3', 'path3/path4/path5', 'path4/path5/path6/path7', 'path5/path6/path7/path8/path9'];

        const values = [[{ a: 1 }, { a: 2 }, { a: 2 }], [{ a: 1 }, { b: 1 }, { a: 1, b: 1 }], [{ a: 1 }, { a: 2, b: 1 }, { a: 2, b: 1 }]];

        await Promise.all(paths.map(path => {
          return Promise.all(values.map(value => {
            return testUpdateGet(path, value);
          }));
        }));

        function testUpdateGet(path, value) {
          return new Promise((resolve, reject) => {
            it(`should push/get value (${JSON.stringify(value)}) at path ${path}`, async done => {
              await firebase.ref(path).remove();
              await firebase.ref(path).set(value[0]);
              await firebase.ref(path).update(value[1]);
              firebase.ref(path).once('value', snapshot => {
                const result = snapshot.val();
                expect(result).toEqual(value[2]);
                done();
                resolve();
              });
            });
          });
        }
      });
    });
  }
});