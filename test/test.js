var assert = require('assert');
var _ = require('lodash');
var async = require('async');

describe('Apostrophe cache implementation in redis', function() {
  var apos;
  var cache1;
  var cache2;
  it('initializes apostrophe', function(done) {
    apos = require('apostrophe')({
      testModule: true,
      modules: {
        'apostrophe-caches-redis': {}
      },
      afterListen: function(err) {
        assert(!err);
        return done();
      }
    });
  });
  it('initializes a redis client', function() {
    assert(apos.caches.client);
  });
  it('can return a cache', function() {
    cache1 = apos.caches.get('cache1');
    assert(cache1);
  });
  it('can return a second cache', function() {
    cache2 = apos.caches.get('cache2');
    assert(cache2);
  });
  it('can store 2000 keys in cache 1', function(done) {
    var vals = _.range(0, 2000);
    return async.eachSeries(vals, function(val, callback) {
      return cache1.set(val, val, callback);
    }, function() {
      done();
    });
  });
  it('can store 2000 keys in cache 2', function(done) {
    var vals = _.range(2000, 4000);
    return async.eachSeries(vals, function(val, callback) {
      return cache2.set(val, val, callback);
    }, function() {
      done();
    });
  });
  it('can retrieve key from cache 1', function(done) {
    return cache1.get(1000, function(err, val) {
      assert(!err);
      assert(val === 1000);
      done();
    });
  });
  it('can retrieve key from cache 2', function(done) {
    return cache2.get(3000, function(err, val) {
      assert(!err);
      assert(val === 3000);
      done();
    });
  });
  it('cannot retrieve cache 2 key from key 1 (namespacing)', function(done) {
    return cache1.get(3000, function(err, val) {
      assert(!err);
      assert(!val);
      done();
    });
  });
  it('can clear a cache', function(done) {
    return cache1.clear(function(err) {
      assert(!err);
      done();
    });
  });
  it('cannot fetch a key from a cleared cache', function(done) {
    return cache1.get(1000, function(err, val) {
      assert(!err);
      assert(!val);
      done();
    });
  });
  it('can fetch a key from an uncleared cache', function(done) {
    return cache2.get(3000, function(err, val) {
      assert(!err);
      assert(val === 3000);
      done();
    });
  });
  it('can store a key with a 1-second timeout', function(done) {
    return cache1.set('timeout', 'timeout', 1, function(err) {
      assert(!err);
      done();
    });
  });
  it('can fetch that key within the 1-second timeout', function(done) {
    return cache1.get('timeout', function(err, value) {
      assert(!err);
      assert(value === 'timeout');
      done();
    });
  });
  it('cannot fetch that key after 2 seconds', function(done) {
    this.timeout(5000);
    setTimeout(function() {
      return cache1.get('timeout', function(err, value) {
        assert(!err);
        assert(!value);
        done();
      });
    }, 2000);
  });
});

