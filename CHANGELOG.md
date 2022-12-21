# Changelog

## Unreleased

- Fixed redis vulnerability reported by security scanners. Due to the way Apostrophe constructs keys there was no actual vulnerability in practice..

## 2.1.4 - 2021-10-13

- Fixes a broken documentation link in the README. Thanks to [Antoine Beauvais-Lacasse](https://github.com/beaulac) for the contribution.

## 2.1.3 - 2020-09-09
- Updates `mocha` and `apostrophe` for security vulnerabilities.
- Adds ESLint to the test script.

## 2.1.2
- fixes a bug where `ensureIndexes()` in `apostrophe-caches` was attempting to create new indexes where mongo was not being used.

## 2.1.1:
- `apos.destroy` now closes the Redis connection, for compatibility with
`apostrophe-monitor` and `apostrophe-multisite`. Corrections were made to the
unit tests for promises (the actual implementation code for promises was fine).
`mocha` 5.x is used, addressing reported vulnerabilities from `npm audit`,
although in actuality the vulnerable modules were only used by the test runner.

## 2.1.0:
- promise support. The `get`, `set` and `clear` methods of caches now return promises if no callback is given, matching the behavior of Apostrophe's core cache.
