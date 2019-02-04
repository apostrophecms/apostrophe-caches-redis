# Changelog

* 2.1.1: `apos.destroy` now closes the Redis connection, for compatibility with
`apostrophe-monitor` and `apostrophe-multisite`. Corrections were made to the
unit tests for promises (the actual implementation code for promises was fine).
`mocha` 5.x is used, addressing reported vulnerabilities from `npm audit`,
although in actuality the vulnerable modules were only used by the test runner. 

* 2.1.0: promise support. The `get`, `set` and `clear` methods of caches now return promises if no callback is given, matching the behavior of Apostrophe's core cache.
