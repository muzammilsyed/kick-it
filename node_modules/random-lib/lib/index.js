/**
 * @overview A somewhat sound random number generator that tries to give you 
 *  the highest quality randomness it can.
 *
 * @author Nathan Wittstock <nate@milkandtang.com>
 * @copyright 2014 Nathan Wittstock
 * @license MIT - See the included 'LICENSE' for details.
 * @version 1.1.3
 * @extends EventEmitter
 */
'use strict';

var crypto = require('crypto');
var util = require('util');
var events = require('events');
var async = require('async');
var when = require('when');
var debug = require('debug')('rand');

var rand = {};

/**
 * Creates the random number generator.
 * @constructor
 * @since 0.1.0
 *
 * @returns {Generator} the instantiated generator.
 */
exports = module.exports = rand.Generator = function() {
  var self = this;
  
  // If we're ready to spew random numbers or not
  self.ready = false;
  self.initializing = false;
  
  // We use a buffer of entropy for our numbers, and refill it when it empties
  self.bufferSize = (process.env.RAND_BUFFER_SIZE >= 256 ? process.env.RAND_BUFFER_SIZE : 512);
  self.buffer = null;
  self.bufferPosition = 0;
  
  self._fillBuffer();

  return this;
};

// Extends EventEmitter
util.inherits(rand.Generator, events.EventEmitter);

/**
 * Genrate an array of random integers.
 *
 * @since 0.1.0
 * @param {object} options - The options object
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 *
 * @returns {Promise} a promise object
 */
rand.Generator.prototype.randomInts = function(options, next) {
  var self = this;
  
  // if we got a function as our first param, expect no options
  if (typeof options === 'function') {
    next = options;
    options = {};
  }
  if (!options) {
    options = {};
  }
  
  // set defaults if they're unset {min: 0, max: 10, num: 10}
  options.min = (options.min === 0 ? 0 : (options.min || 0));
  options.max = (options.max === 1 ? 1 : (options.max || 10));
  options.num = (options.num === 10 ? 10 : (options.num || 10));
  
  options.ints = true;
  
  if (options.unique && options.max - options.min + 1 < options.num) {
    var deferred = null;
    if (typeof next !== 'function') {
      deferred = when.defer();
    }
    var err = new Error('You asked for more unique ints than your min and max allow');
    process.nextTick(function resolveIntsWithError() {
      if (next) {
        next(err);
        return;
      }
      deferred.reject(err);
    });
    return (deferred ? deferred.promise : null);
  }
  else {
    return self._generate(options, next);
  }
};

/**
 * Callback executed after the requested generation is complete.
 *
 * @since 0.1.0
 * @callback {generateCallback}
 * @param {Error} err - Error if there was one, null if not.
 * @param {array} result - Resulting array of numbers requested.
 */
 
 /**
  * Generate an array of random but unique integers.
  *
  * @since 0.1.2
  * @param {object} options - The options object
  * @param {generateCallback} next - The callback function to call after 
  *  generation.
  *
  * @returns {Promise} a promise object
  */
 rand.Generator.prototype.randomUniqueInts = function(options, next) {
   var self = this;
   
   if (typeof options === 'function') {
     next = options;
     options = {};
   }
   if (!options) {
    options = {};
  }
   
   options.unique = true;
   
   if (options.max - options.min + 1 < options.num) {
     var deferred = null;
     if (typeof next !== 'function') {
       deferred = when.defer();
     }
     var err = new Error('You asked for too many unique ints in the range provided.');
     process.nextTick(function resolveUniqueIntsWithError() {
       if (next) {
         next(err);
         return;
       }
       deferred.reject(err);
     });
     return (deferred ? deferred.promise : null);
   }
   
   return self.randomInts(options, next);
 };

/**
 * Generate an array of random floats.
 *
 * @since 0.1.0
 * @param {object} options - The options object
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 *
 * @returns {Promise} a promise object
 */
rand.Generator.prototype.randomFloats = function(options, next) {
  var self = this;
  
  if (typeof options === 'function') {
    next = options;
    options = {};
  }
  if (!options) {
    options = {};
  }
  
  options.num = (options.num === 10 ? 10 : (options.num || 10));
  
  return self._generate(options, next);
};

/**
 * Generate an array of random but unique floats.
 *
 * @since 0.1.2
 * @param {object} options - The options object
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 *
 * @returns {Promise} a promise object
 */
rand.Generator.prototype.randomUniqueFloats = function(options, next) {
  var self = this;
  
  if (typeof options === 'function') {
    next = options;
    options = {};
  }
  if (!options) {
    options = {};
  }
  
  options.unique = true;
  
  return self.randomFloats(options, next);
};

/**
 * Convenience function to generate a single random integer.
 *
 * @since 0.1.0
 * @param {object} options - The options object
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 *
 * @returns {Promise} a promise object
 */
rand.Generator.prototype.randomInt = function(options, next) {
  var self = this;
  
  if (typeof options === 'function') {
    next = options;
    options = {};
  }
  if (!options) {
    options = {};
  }
  
  options.num = 1;
  options.single = true;
  
  return self.randomInts(options, next);
};

/**
 * Convenience function to generate a single random float.
 *
 * @since 0.1.0
 * @param {object} options - The options object
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 *
 * @returns {Promise} a promise object
 */
rand.Generator.prototype.randomFloat = function(options, next) {
  var self = this;
  
  if (typeof options === 'function') {
    next = options;
    options = {};
  }
  if (!options) {
    options = {};
  }
  
  options.num = 1;
  options.single = true;
  
  return self.randomFloats(options, next);
};

/**
 * The internal generation function, that actually generates the random numbers.
 *
 * @since 0.1.0
 * @param {object} options - The options object
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 *
 * @returns {Promise} a promise object
 */
rand.Generator.prototype._generate = function(options, next) {
  var self = this;
  
  debug('random called');

  var deferred = options.deferred || (typeof next !== 'function' ? when.defer() : null);

  if (!self.ready) {
    // if we aren't ready, we need to wait for the ready signal, and then fire only once
    var generate = function onReadyEvent(gen) {
      self.removeListener('ready', generate);
      debug('got ready, running');
      options.deferred = deferred;
      gen._generate(options, next);
    };
    self.on('ready', generate);

    if (!self.initializing) {
      self._fillBuffer();
    }
  }
  else {
    var numbers = [];
    async.doWhilst(function generateNumber(callback) {
      // we need to get 7 bytes of entropy if we don't have it, flush buffer
      if (self.buffer.length - self.bufferPosition < 7) {
        self.ready = false;
        self._fillBuffer(callback);
      }
      else {
        var random = self._floatFromBuffer();

        if (options.ints) {
          random = options.min + Math.floor(random * (options.max - options.min + 1));
        }

        if (options.unique && numbers.indexOf(random) > -1) {
          callback();
        }
        else {
          numbers.push(random);
          callback();
        }
      }
    }, function postCheckGeneration() {
      return numbers.length < options.num;
    }, function resolveGeneration(err) {
      if (options.single) {
        numbers = numbers[0];
      }

      if (typeof next === 'function') {
        next(err, numbers);
      }
      else if (err && deferred) {
        deferred.reject(err);
      }
      else {
        deferred.resolve(numbers);
      }
    });
  }

  return (deferred ? deferred.promise : null);
};

/**
 * Generates a random float from the existing buffer of entropy.
 *
 * @since 0.1.0
 *
 * @returns {float} the generated float.
 */
rand.Generator.prototype._floatFromBuffer = function() {
  var self = this;
  
  // this mess of math comes from http://stackoverflow.com/questions/15753019/floating-point-number-from-crypto-randombytes-in-javascript
  self.bufferPosition += 7;
  //(((((((a6 % 32)/32 + a5)/256 + a4)/256 + a3)/256 + a2)/256 + a1)/256 + a0)/256
  var random = (((((((
    self.buffer[self.bufferPosition-7] % 32)/32 +
    self.buffer[self.bufferPosition-6])/256 +
    self.buffer[self.bufferPosition-5])/256 +
    self.buffer[self.bufferPosition-4])/256 +
    self.buffer[self.bufferPosition-3])/256 +
    self.buffer[self.bufferPosition-2])/256 +
    self.buffer[self.bufferPosition-1])/256;
    
  return random;
};

/**
 * Fills the buffer with random bytes.
 *
 * @since 0.1.0
 * @param {callback} next - The callback function to call after filling the buffer.
*/
rand.Generator.prototype._fillBuffer = function(next) {
  var self = this;
  
  debug('filling buffer');
  self.initializing = true;
  self.ready = false;
  crypto.randomBytes(self.bufferSize, function postBufferFill(err, buf) {
    if (err) {
      // if we allow less good entropy, do it. otherwise, puke.
      if (process.env.RAND_ALLOW_PRNG) {
        buf = crypto.pseudoRandomBytes(self.bufferSize);
      }
      else {
        if (typeof next === 'function') {
          next(err);
        }
        return;
      }
    }
    
    debug('buffer filled');
    self.buffer = buf;
    self.bufferPosition = 0;
    self.ready = true;
    self.initializing = false;
    self.emit('ready', self);
    
    if(typeof next === 'function') {
      next(err);
    }
  });
};
