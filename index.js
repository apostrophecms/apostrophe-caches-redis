// TODO:
//
// unit tests

var redis = require("redis");

module.exports = {

  improve: 'apostrophe-caches',

  construct: function(self, options) {
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

    self.constructCache = function(name) {

      return {
        get: function(key, callback) {
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
        },

        set: function(key, value, lifetime, callback) {
          if (!callback) {
            callback = lifetime;
            lifetime = 0;
          }
          key = self.prefix + name + ':' + key;
          if (lifetime) {
            return self.client.setex(key, lifetime, JSON.stringify(value), callback);
          } else {
            return self.client.set(key, JSON.stringify(value), callback);
          }
        },

        clear: function(callback) {
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
      };
    };
  }
};

