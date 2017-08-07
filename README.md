This module enhances `apostrophe-caches`, the standard caching mechanism of Apostrophe, to use Redis rather than MongoDB.

To use it, first npm install it in your project:

```
npm install --save apostrophe-caches-redis
```

Then configure your modules like this:

```javascript
    'apostrophe-caches-redis': {
      // *NO* OPTIONS HERE
    },
    'apostrophe-caches': {
      // OPTIONS GO HERE - we are actually "improving" this standard module
      redis: {
        // options for the redis npm module go here
      }
    }
```

As usual with Redis, if you specify no options, it will connect to Redis on your local machine.

See the [redis npm module documentation](https://www.npmjs.com/package/redis) for more information about the options available under the `redis` property. Note that the `prefix` option defaults to the `shortname` of your project. This allows more than one Apostrophe site to easily share a Redis database. If you do not want any prefix in Redis, you can set `prefix` explicitly to `false`.

**Very important:** your Redis-specific options go in the configuration for `apostrophe-caches`, NOT `apostrophe-caches-redis`. This module enhances the capabilities of `apostrophe-caches`, and the rest of Apostrophe just sees `apostrophe-caches` as usual. See the source for a great example of how to ship similar improvements for other core Apostrophe modules.

## Sessions in Redis

You can do that too, and it greatly reduces the load on MongoDB. You don't need this module for that. See [storing sessions in Redis](http://apostrophecms.org/docs/tutorials/howtos/storing-sessions-in-redis.html).
