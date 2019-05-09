// TODO:
//
// unit tests

var redis = require("redis");
var Promise = require('bluebird');

module.exports = {

  improve: 'apostrophe-caches',

  construct: function(self, options) {
    self.on('apostrophe:destroy', 'closeRedisConnection', function() {
      self.client.stream.removeAllListeners();
      self.client.stream.destroy();
    });
    // Replace the apostrophe-caches implementation of getCollection in a bc way
    self.getCollection = function(callback) {
      var redisOptions = options.redis || {};
      if (!options.prefix) {
        if (options.prefix !== false) {
          // Distinguish sites
          options.prefix = self.apos.shortName + ':';
        }
      }
      self.prefix = options.prefix || '';
      self.client = redis.createClient(redisOptions);
      return setImmediate(callback);
    };

    // Override the ensureIndex method, which is not needed since we are
    // not using mongo collections.
    self.ensureIndexes = function(callback) {
      return callback(null);
    }

    self.constructCache = function(name) {

      return {
        // Fetch an item from the cache. If the item is in the
        // cache, the callback receives (null, item). If the
        // item is not in the cache the callback receives (null).
        // If an error occurs the callback receives (err).
        // If there is no callback a promise is returned.
        get: function(key, callback) {
          if (callback) {
            return body(callback);
          } else {
            return Promise.promisify(body)();
          }
          function body(callback) {
            key = self.prefix + name + ':' + key;
            return self.client.get(key, function(err, json) {
              if (err) {
                return callback(err);
              }
              if (json === null) {
                return callback(null);
              }
              var data;
              try {
                data = JSON.parse(json);
              } catch (e) {
                return callback(e);
              }
              return callback(null, data);
            });
          }
        },

        // Store an item in the cache. `value` may be any JSON-friendly
        // value, including an object. `lifetime` is in seconds.
        //
        // The callback receives (err).
        //
        // You may also call with just three arguments:
        // key, value, callback. In that case there is no hard limit
        // on the lifetime, however NEVER use a cache for PERMANENT
        // storage of data. It might be cleared at any time.
        //
        // If there is no callback a promise is returned.
        set: function(key, value, lifetime, callback) {
          if (arguments.length === 2) {
            lifetime = 0;
            return Promise.promisify(body)();
          } else if (arguments.length === 3) {
            if (typeof(lifetime) === 'function') {
              callback = lifetime;
              lifetime = 0;
              return body(callback);
            } else {
              return Promise.promisify(body)();
            }
          } else {
            return body(callback);
          }
          function body(callback) {
            key = self.prefix + name + ':' + key;
            if (lifetime) {
              return self.client.setex(key, lifetime, JSON.stringify(value), callback);
            } else {
              return self.client.set(key, JSON.stringify(value), callback);
            }
          }
        },

        // Empty the cache. If there is no callback a promise is returned.
        clear: function(callback) {
          if (callback) {
            return body(callback);
          } else {
            return Promise.promisify(body)();
          }
          function body(callback) {
            // This is not as simple as it sounds:
            //
            // https://stackoverflow.com/questions/4006324/how-to-atomically-delete-keys-matching-a-pattern-using-redis
            //
            // I'm avoiding Lua because of comments in that article that it might not play nice
            // with Redis clustering.
            //
            // Use of `keys` is not deprecated as long as it's for a special-purpose, occasional operation,
            // and clearing an entire cache qualifies.
            return self.client.keys(self.prefix + name + ':*', function(err, keys) {
              if (err) {
                return callback(err);
              }
              removeNextBatch();
              function removeNextBatch() {
                if (!keys.length) {
                  return callback(null);
                }
                return self.client.del(keys.slice(0, 1000), function(err) {
                  if (err) {
                    return callback(err);
                  }
                  keys = keys.slice(1000);
                  return removeNextBatch();
                });
              }
            });
          }
        }
      };
    };
  }
};
