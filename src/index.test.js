const mongodb = require('mongo-mock');
mongodb.max_delay = 0;
// const MongoClient = mongodb.MongoClient;
import { MongoClient } from 'mongodb';
import FireMongo from './index';
const fireMongo = FireMongo(MongoClient, 'mongodb://163.172.170.96:27122/firemongo');

describe('firemongo', () => {

  beforeAll(async () => {
    await fireMongo.child('node').remove();
  });

  describe('set', () => {

    it('should set/get simple value at single path', async (done) => {
      await fireMongo.ref('settest1').set(1);
      fireMongo.ref('settest1').once('value', snapshot => {
        expect(snapshot.val()).toBe(1);
        done();
      });
    });

    it('should set/get object at single path', async (done) => {
      await fireMongo.ref('settest2').set({ a: 1 });
      fireMongo.ref('settest2').once('value', snapshot => {
        expect(snapshot.val()).toEqual({ a: 1 });
        done();
      });
    });

    it('should set/get array at single path', async (done) => {
      await fireMongo.ref('settest3').set([1, 2, 3]);
      fireMongo.ref('settest3').once('value', snapshot => {
        expect(snapshot.val()).toEqual({ '0': 1, '1': 2, '2': 3 });
        done();
      });
    });

    it('should set/get simple value at multi level path', async (done) => {
      await fireMongo.ref('settest/path1').set(1);
      fireMongo.ref('settest/path1').once('value', snapshot => {
        expect(snapshot.val()).toBe(1);
        done();
      });
    });

    it('should set/get object at multi level path', async (done) => {
      await fireMongo.ref('settest/path2').set({a: 1});
      fireMongo.ref('settest/path2').once('value', snapshot => {
        expect(snapshot.val()).toEqual({ a: 1 });
        done();
      });
    });

    it('should set/get array at multi level path', async (done) => {
      await fireMongo.ref('settest/path3').set([1,2,3]);
      fireMongo.ref('settest/path3').once('value', snapshot => {
        expect(snapshot.val()).toEqual({ '0': 1, '1': 2, '2': 3 });
        done();
      });
    });
  });

  describe('push', () => {

    it('should push/get simple value at single path', async (done) => {
      await fireMongo.ref('pushtest1').push(7);
      fireMongo.ref('pushtest1').once('value', snapshot => {
        const result = Object.values(snapshot.val());
        expect(result.length).toBe(1);
        expect(result[0]).toBe(7);
        done();
      });
    });

    it('should push/get object at single path', async (done) => {
      await fireMongo.ref('pushtest2').push({ a: 1 });
      fireMongo.ref('pushtest2').once('value', snapshot => {
        const result = Object.values(snapshot.val());
        expect(result.length).toBe(1);
        expect(result[0]).toEqual({ a: 1 });
        done();
      });
    });

    it('should push/get simple value at multi level path', async (done) => {
      await fireMongo.ref('pushtest/path1').push(7);
      fireMongo.ref('pushtest/path1').once('value', snapshot => {
        const result = Object.values(snapshot.val());
        expect(result.length).toBe(1);
        expect(result[0]).toBe(7);
        done();
      });
    });

    it('should push/get object at multi level path', async (done) => {
      await fireMongo.ref('pushtest/path2').push({ a: 1 });
      fireMongo.ref('pushtest/path2').once('value', snapshot => {
        const result = Object.values(snapshot.val());
        expect(result.length).toBe(1);
        expect(result[0]).toEqual({ a: 1 });
        done();
      });
    });

  });
});