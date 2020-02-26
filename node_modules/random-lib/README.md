# random-lib v1.1.3

[![Build Status](https://travis-ci.org/fardog/node-random-lib.svg)](https://travis-ci.org/fardog/node-random-lib) [![Dependency Status](https://gemnasium.com/fardog/node-random-lib.svg)](https://gemnasium.com/fardog/node-random-lib)

A library that wraps the [node.js](http://nodejs.org) crypto functions to create random floats and bounded integers with ease. Supports both a callback-based API and [Promises/A+](http://promisesaplus.com/).

> **Warning:** I am not a cryptographer, or any sort of random number expert. An audit would be greatly appreciated.

> **Note:** Browser support (using Browserify) is currently experimental.

## Installation

To install the module for use in your projects:

```bash
npm install random-lib
```

## Usage

```js
var randomLib = require('random-lib');
var rand = new randomLib();

// get 10 random integers
rand.randomInts(function(err, results) {
	console.log(results); // [ 1, 1, 8, 10, 1, 4, 1, 6, 0, 8 ]
});

// or, with promises
rand.randomInts().then(function(results) {
	console.log(results); // [ 2, 8, 4, 0, 2, 0, 7, 7, 8, 9 ]
});
```

Options are accepted, but are different if you're asking for floats or integers.

### Options

Options are passed via an object; what's shown below are the defaults, and nothing is required.

```js

// for integers; what's shown are the defaults.
var options = {
	num: 10, // number of ints to receive
	min: 0, // minimum bound (inclusive)
	max: 10, // maximum bound (inclusive)
};
rand.randomInts(options, function(err, results) {
	console.log(results); // [0, 8, 5, 1, 3, 9, 10, 5, 4, 9]
});

//for floats; what's shown are the defaults.
var options = {
	num: 10 // number of floats to receive
}
rand.randomFloats(options, function(err, results) {
	console.log(results);
});
```

### API

#### randomInts([options], [callback (err, results)]) 

Get an array of random integers.

#### randomUniqueInts([options], [callback (err, results)])

Get an array of random unique integers.

#### randomInt([options], [callback (err, results)])

Convenience function to get a single random integer.

#### randomFloats([options], [callback (err, results)])

Get an array of random floats between 0 and 1.

#### randomUniqueFloats([options], [callback (err, results)])

Get an array of random unique floats between 0 and 1.

#### randomFloat([options], [callback (err, results)])

Convenience function to get a single random float between 0 and 1.


#### Notes

- The entropy buffer—what's returned from node's `crypto.randomBytes()`—is filled with entropy as soon as the constructor is called (on `new`).
- Generation of new entropy will occur automatically whenever the buffer becomes empty.

## Environment Variables

- **RAND_ALLOW_PRNG**
Set this environment variable to allow fallback to Node's `crypto.pseudoRandomBytes()` function if we fail to get entropy from `crypto.randomBytes()`. This decreases the quality of the random numbers, but will stop us from throwing an error.

- **RAND_BUFFER_SIZE**
How many bytes of entropy we create in a single go. Internally, we create a buffer of entropy and then use it until it's exhausted, then refill the buffer. A small buffer exhausts more quickly, but generates faster and uses less memory. Default is 512 bytes. This value cannot be less than 256 bytes.

## Known Issues

- Browser support (using Browserify) is currently experimental. There is no timeframe for when this will be fully implemented.

## Contributing

Feel free to send pull requests! I'm not picky, but would like the following:

1. Write tests for any new features, and do not break existing tests.
2. Be sure to point out any changes that break API.

## History

- **v1.1.3**  
Officially supports node 0.11.

- **v1.1.2**  
Updates dependencies and adds dependency badge.

- **v1.1.0**  
Only return Promises when callbacks aren't used.

- **v1.0.1**  
Anonymous functions are now named, internal documentation updates, new tests, and updated dependencies.

- **v1.0.0**  
The API now supports Promises.

- **v0.1.5**  
Tests browser support. Adds [testling](https://ci.testling.com/) for automated tests.

- **v0.1.4**  
Avoids [releasing Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony) on errors.

- **v0.1.3**  
Bug fixes.

- **v0.1.2**  
Adds `randomUniqueInts` and `randomUniqueFloats` for arrays with unique numbers.

- **v0.1.1**  
Remove peerDependencies.

- **v0.1.0**  
Initial release.

## The MIT License (MIT)

Copyright (c) 2014 Nathan Wittstock

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
