/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\doubleval', [
      {"name":"var","type":"mixed"}
    ],
    'float', function doubleval(mixedVar) {
      //  discuss at: http://locutus.io/php/doubleval/
      // original by: Brett Zamir (http://brett-zamir.me)
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: doubleval(186)
      //   returns 1: 186.00
    
      var floatval = require('../var/floatval')
    
      return floatval(mixedVar)
    }
  );

  $php.context.function.declare(
    '\\floatval', [
      {"name":"var","type":"mixed"}
    ],
    'float', function floatval(mixedVar) {
      //  discuss at: http://locutus.io/php/floatval/
      // original by: Michael White (http://getsprink.com)
      //      note 1: The native parseFloat() method of JavaScript returns NaN
      //      note 1: when it encounters a string before an int or float value.
      //   example 1: floatval('150.03_page-section')
      //   returns 1: 150.03
      //   example 2: floatval('page: 3')
      //   example 2: floatval('-50 + 8')
      //   returns 2: 0
      //   returns 2: -50
    
      return (parseFloat(mixedVar) || 0)
    }
  );

  $php.context.function.declare(
    '\\gettype', [
      {"name":"var","type":"mixed"}
    ],
    'string', function gettype(mixedVar) {
      //  discuss at: http://locutus.io/php/gettype/
      // original by: Paulo Freitas
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Douglas Crockford (http://javascript.crockford.com)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //    input by: KELAN
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: gettype(1)
      //   returns 1: 'integer'
      //   example 2: gettype(undefined)
      //   returns 2: 'undefined'
      //   example 3: gettype({0: 'Kevin van Zonneveld'})
      //   returns 3: 'object'
      //   example 4: gettype('foo')
      //   returns 4: 'string'
      //   example 5: gettype({0: function () {return false;}})
      //   returns 5: 'object'
      //   example 6: gettype({0: 'test', length: 1, splice: function () {}})
      //   returns 6: 'object'
      //   example 7: gettype(['test'])
      //   returns 7: 'array'
    
      var isFloat = require('../var/is_float')
    
      var s = typeof mixedVar
      var name
      var _getFuncName = function (fn) {
        var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn)
        if (!name) {
          return '(Anonymous)'
        }
        return name[1]
      }
    
      if (s === 'object') {
        if (mixedVar !== null) {
          // From: http://javascript.crockford.com/remedial.html
          // @todo: Break up this lengthy if statement
          if (typeof mixedVar.length === 'number' &&
            !(mixedVar.propertyIsEnumerable('length')) &&
            typeof mixedVar.splice === 'function') {
            s = 'array'
          } else if (mixedVar.constructor && _getFuncName(mixedVar.constructor)) {
            name = _getFuncName(mixedVar.constructor)
            if (name === 'Date') {
              // not in PHP
              s = 'date'
            } else if (name === 'RegExp') {
              // not in PHP
              s = 'regexp'
            } else if (name === 'LOCUTUS_Resource') {
              // Check against our own resource constructor
              s = 'resource'
            }
          }
        } else {
          s = 'null'
        }
      } else if (s === 'number') {
        s = isFloat(mixedVar) ? 'double' : 'integer'
      }
    
      return s
    }
  );

  $php.context.function.declare(
    '\\intval', [
      {"name":"var","type":"mixed"},
      {"name":"base","type":"int"}
    ],
    'int', function intval(mixedVar, base) {
      //  discuss at: http://locutus.io/php/intval/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: stensi
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Rafał Kukawski (http://blog.kukawski.pl)
      //    input by: Matteo
      //   example 1: intval('Kevin van Zonneveld')
      //   returns 1: 0
      //   example 2: intval(4.2)
      //   returns 2: 4
      //   example 3: intval(42, 8)
      //   returns 3: 42
      //   example 4: intval('09')
      //   returns 4: 9
      //   example 5: intval('1e', 16)
      //   returns 5: 30
    
      var tmp
    
      var type = typeof mixedVar
    
      if (type === 'boolean') {
        return +mixedVar
      } else if (type === 'string') {
        tmp = parseInt(mixedVar, base || 10)
        return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp
      } else if (type === 'number' && isFinite(mixedVar)) {
        return mixedVar | 0
      } else {
        return 0
      }
    }
  );

  $php.context.function.declare(
    '\\is_array', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_array(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_array/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Legaev Andrey
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Nathan Sepulveda
      // improved by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Cord
      // bugfixed by: Manish
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      note 1: In Locutus, javascript objects are like php associative arrays,
      //      note 1: thus JavaScript objects will also
      //      note 1: return true in this function (except for objects which inherit properties,
      //      note 1: being thus used as objects),
      //      note 1: unless you do ini_set('locutus.objectsAsArrays', 0),
      //      note 1: in which case only genuine JavaScript arrays
      //      note 1: will return true
      //   example 1: is_array(['Kevin', 'van', 'Zonneveld'])
      //   returns 1: true
      //   example 2: is_array('Kevin van Zonneveld')
      //   returns 2: false
      //   example 3: is_array({0: 'Kevin', 1: 'van', 2: 'Zonneveld'})
      //   returns 3: true
      //   example 4: ini_set('locutus.objectsAsArrays', 0)
      //   example 4: is_array({0: 'Kevin', 1: 'van', 2: 'Zonneveld'})
      //   returns 4: false
      //   example 5: is_array(function tmp_a (){ this.name = 'Kevin' })
      //   returns 5: false
    
      var _getFuncName = function (fn) {
        var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn)
        if (!name) {
          return '(Anonymous)'
        }
        return name[1]
      }
      var _isArray = function (mixedVar) {
        // return Object.prototype.toString.call(mixedVar) === '[object Array]';
        // The above works, but let's do the even more stringent approach:
        // (since Object.prototype.toString could be overridden)
        // Null, Not an object, no length property so couldn't be an Array (or String)
        if (!mixedVar || typeof mixedVar !== 'object' || typeof mixedVar.length !== 'number') {
          return false
        }
        var len = mixedVar.length
        mixedVar[mixedVar.length] = 'bogus'
        // The only way I can think of to get around this (or where there would be trouble)
        // would be to have an object defined
        // with a custom "length" getter which changed behavior on each call
        // (or a setter to mess up the following below) or a custom
        // setter for numeric properties, but even that would need to listen for
        // specific indexes; but there should be no false negatives
        // and such a false positive would need to rely on later JavaScript
        // innovations like __defineSetter__
        if (len !== mixedVar.length) {
          // We know it's an array since length auto-changed with the addition of a
          // numeric property at its length end, so safely get rid of our bogus element
          mixedVar.length -= 1
          return true
        }
        // Get rid of the property we added onto a non-array object; only possible
        // side-effect is if the user adds back the property later, it will iterate
        // this property in the older order placement in IE (an order which should not
        // be depended on anyways)
        delete mixedVar[mixedVar.length]
        return false
      }
    
      if (!mixedVar || typeof mixedVar !== 'object') {
        return false
      }
    
      var isArray = _isArray(mixedVar)
    
      if (isArray) {
        return true
      }
    
      var iniVal = (typeof require !== 'undefined' ? require('../info/ini_get')('locutus.objectsAsArrays') : undefined) || 'on'
      if (iniVal === 'on') {
        var asString = Object.prototype.toString.call(mixedVar)
        var asFunc = _getFuncName(mixedVar.constructor)
    
        if (asString === '[object Object]' && asFunc === 'Object') {
          // Most likely a literal and intended as assoc. array
          return true
        }
      }
    
      return false
    }
  );

  $php.context.function.declare(
    '\\is_bool', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_bool(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_bool/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: CoursesWeb (http://www.coursesweb.net/)
      //   example 1: is_bool(false)
      //   returns 1: true
      //   example 2: is_bool(0)
      //   returns 2: false
    
      return (mixedVar === true || mixedVar === false) // Faster (in FF) than type checking
    }
  );

  $php.context.function.declare(
    '\\is_callable', [
      {"name":"name","type":"callback|callable"},
      {"name":"syntax_only","type":"bool"},
      {"name":"callable_name","type":"string"}
    ],
    'mixed', function is_callable(mixedVar, syntaxOnly, callableName) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_callable/
      // original by: Brett Zamir (http://brett-zamir.me)
      //    input by: François
      // improved by: Brett Zamir (http://brett-zamir.me)
      //      note 1: The variable callableName cannot work as a string variable passed by
      //      note 1: reference as in PHP (since JavaScript does not support passing
      //      note 1: strings by reference), but instead will take the name of
      //      note 1: a global variable and set that instead.
      //      note 1: When used on an object, depends on a constructor property
      //      note 1: being kept on the object prototype
      //      note 2: Depending on the `callableName` that is passed, this function can use eval.
      //      note 2: The eval input is however checked to only allow valid function names,
      //      note 2: So it should not be unsafer than uses without eval (seeing as you can)
      //      note 2: already pass any function to be executed here.
      //   example 1: is_callable('is_callable')
      //   returns 1: true
      //   example 2: is_callable('bogusFunction', true)
      //   returns 2: true // gives true because does not do strict checking
      //   example 3: function SomeClass () {}
      //   example 3: SomeClass.prototype.someMethod = function (){}
      //   example 3: var testObj = new SomeClass()
      //   example 3: is_callable([testObj, 'someMethod'], true, 'myVar')
      //   example 3: var $result = myVar
      //   returns 3: 'SomeClass::someMethod'
      //   example 4: is_callable(function () {})
      //   returns 4: true
    
      var $global = (typeof window !== 'undefined' ? window : global)
    
      var validJSFunctionNamePattern = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/
    
      var name = ''
      var obj = {}
      var method = ''
      var validFunctionName = false
    
      var getFuncName = function (fn) {
        var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn)
        if (!name) {
          return '(Anonymous)'
        }
        return name[1]
      }
    
      if (typeof mixedVar === 'string') {
        obj = $global
        method = mixedVar
        name = mixedVar
        validFunctionName = !!name.match(validJSFunctionNamePattern)
      } else if (typeof mixedVar === 'function') {
        return true
      } else if (Object.prototype.toString.call(mixedVar) === '[object Array]' &&
        mixedVar.length === 2 &&
        typeof mixedVar[0] === 'object' &&
        typeof mixedVar[1] === 'string') {
        obj = mixedVar[0]
        method = mixedVar[1]
        name = (obj.constructor && getFuncName(obj.constructor)) + '::' + method
      } else {
        return false
      }
    
      if (syntaxOnly || typeof obj[method] === 'function') {
        if (callableName) {
          $global[callableName] = name
        }
        return true
      }
    
      // validFunctionName avoids exploits
      if (validFunctionName && typeof eval(method) === 'function') { // eslint-disable-line no-eval
        if (callableName) {
          $global[callableName] = name
        }
        return true
      }
    
      return false
    }
  );

  $php.context.function.declare(
    '\\is_double', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_double(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_double/
      // original by: Paulo Freitas
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: is_double(186.31)
      //   returns 1: true
    
      var _isFloat = require('../var/is_float')
      return _isFloat(mixedVar)
    }
  );

  $php.context.function.declare(
    '\\is_float', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_float(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_float/
      // original by: Paulo Freitas
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // improved by: WebDevHobo (http://webdevhobo.blogspot.com/)
      // improved by: Rafał Kukawski (http://blog.kukawski.pl)
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: is_float(186.31)
      //   returns 1: true
    
      return +mixedVar === mixedVar && (!isFinite(mixedVar) || !!(mixedVar % 1))
    }
  );

  $php.context.function.declare(
    '\\is_int', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_int(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_int/
      // original by: Alex
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: WebDevHobo (http://webdevhobo.blogspot.com/)
      // improved by: Rafał Kukawski (http://blog.kukawski.pl)
      //  revised by: Matt Bradley
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: is_int(23)
      //   returns 1: true
      //   example 2: is_int('23')
      //   returns 2: false
      //   example 3: is_int(23.5)
      //   returns 3: false
      //   example 4: is_int(true)
      //   returns 4: false
    
      return mixedVar === +mixedVar && isFinite(mixedVar) && !(mixedVar % 1)
    }
  );

  $php.context.function.declare(
    '\\is_integer', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_integer(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_integer/
      // original by: Paulo Freitas
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: is_integer(186.31)
      //   returns 1: false
      //   example 2: is_integer(12)
      //   returns 2: true
    
      var _isInt = require('../var/is_int')
      return _isInt(mixedVar)
    }
  );

  $php.context.function.declare(
    '\\is_long', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_long(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_long/
      // original by: Paulo Freitas
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: is_long(186.31)
      //   returns 1: true
    
      var _isFloat = require('../var/is_float')
      return _isFloat(mixedVar)
    }
  );

  $php.context.function.declare(
    '\\is_null', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_null(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_null/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: is_null('23')
      //   returns 1: false
      //   example 2: is_null(null)
      //   returns 2: true
    
      return (mixedVar === null)
    }
  );

  $php.context.function.declare(
    '\\is_numeric', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_numeric(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_numeric/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: David
      // improved by: taith
      // bugfixed by: Tim de Koning
      // bugfixed by: WebDevHobo (http://webdevhobo.blogspot.com/)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Denis Chenu (http://shnoulle.net)
      //   example 1: is_numeric(186.31)
      //   returns 1: true
      //   example 2: is_numeric('Kevin van Zonneveld')
      //   returns 2: false
      //   example 3: is_numeric(' +186.31e2')
      //   returns 3: true
      //   example 4: is_numeric('')
      //   returns 4: false
      //   example 5: is_numeric([])
      //   returns 5: false
      //   example 6: is_numeric('1 ')
      //   returns 6: false
    
      var whitespace = [
        ' ',
        '\n',
        '\r',
        '\t',
        '\f',
        '\x0b',
        '\xa0',
        '\u2000',
        '\u2001',
        '\u2002',
        '\u2003',
        '\u2004',
        '\u2005',
        '\u2006',
        '\u2007',
        '\u2008',
        '\u2009',
        '\u200a',
        '\u200b',
        '\u2028',
        '\u2029',
        '\u3000'
      ].join('')
    
      // @todo: Break this up using many single conditions with early returns
      return (typeof mixedVar === 'number' ||
        (typeof mixedVar === 'string' &&
        whitespace.indexOf(mixedVar.slice(-1)) === -1)) &&
        mixedVar !== '' &&
        !isNaN(mixedVar)
    }
  );

  $php.context.function.declare(
    '\\is_object', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_object(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_object/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Legaev Andrey
      // improved by: Michael White (http://getsprink.com)
      //   example 1: is_object('23')
      //   returns 1: false
      //   example 2: is_object({foo: 'bar'})
      //   returns 2: true
      //   example 3: is_object(null)
      //   returns 3: false
    
      if (Object.prototype.toString.call(mixedVar) === '[object Array]') {
        return false
      }
      return mixedVar !== null && typeof mixedVar === 'object'
    }
  );

  $php.context.function.declare(
    '\\is_real', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_real(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_real/
      // original by: Brett Zamir (http://brett-zamir.me)
      //      note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
      //      note 1: it different from the PHP implementation. We can't fix this unfortunately.
      //   example 1: is_real(186.31)
      //   returns 1: true
    
      var _isFloat = require('../var/is_float')
      return _isFloat(mixedVar)
    }
  );

  $php.context.function.declare(
    '\\is_scalar', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_scalar(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_scalar/
      // original by: Paulo Freitas
      //   example 1: is_scalar(186.31)
      //   returns 1: true
      //   example 2: is_scalar({0: 'Kevin van Zonneveld'})
      //   returns 2: false
    
      return (/boolean|number|string/).test(typeof mixedVar)
    }
  );

  $php.context.function.declare(
    '\\is_string', [
      {"name":"var","type":"mixed"}
    ],
    'bool', function is_string(mixedVar) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_string/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: is_string('23')
      //   returns 1: true
      //   example 2: is_string(23.5)
      //   returns 2: false
    
      return (typeof mixedVar === 'string')
    }
  );

  $php.context.function.declare(
    '\\print_r', [
      {"name":"expression","type":"mixed"},
      {"name":"return","type":"bool"}
    ],
    'mixed', function print_r(array, returnVal) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/print_r/
      // original by: Michael White (http://getsprink.com)
      // improved by: Ben Bryan
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Brett Zamir (http://brett-zamir.me)
      //   example 1: print_r(1, true)
      //   returns 1: '1'
    
      var echo = require('../strings/echo')
    
      var output = ''
      var padChar = ' '
      var padVal = 4
    
      var _repeatChar = function (len, padChar) {
        var str = ''
        for (var i = 0; i < len; i++) {
          str += padChar
        }
        return str
      }
      var _formatArray = function (obj, curDepth, padVal, padChar) {
        if (curDepth > 0) {
          curDepth++
        }
    
        var basePad = _repeatChar(padVal * curDepth, padChar)
        var thickPad = _repeatChar(padVal * (curDepth + 1), padChar)
        var str = ''
    
        if (typeof obj === 'object' &&
          obj !== null &&
          obj.constructor) {
          str += 'Array\n' + basePad + '(\n'
          for (var key in obj) {
            if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
              str += thickPad
              str += '['
              str += key
              str += '] => '
              str += _formatArray(obj[key], curDepth + 1, padVal, padChar)
            } else {
              str += thickPad
              str += '['
              str += key
              str += '] => '
              str += obj[key]
              str += '\n'
            }
          }
          str += basePad + ')\n'
        } else if (obj === null || obj === undefined) {
          str = ''
        } else {
          // for our "resource" class
          str = obj.toString()
        }
    
        return str
      }
    
      output = _formatArray(array, 0, padVal, padChar)
    
      if (returnVal !== true) {
        echo(output)
        return true
      }
      return output
    }
  );

  $php.context.function.declare(
    '\\serialize', [
      {"name":"value","type":"mixed"}
    ],
    'mixed', function serialize(mixedValue) {
      //  discuss at: http://locutus.io/php/serialize/
      // original by: Arpad Ray (mailto:arpad@php.net)
      // improved by: Dino
      // improved by: Le Torbi (http://www.letorbi.de/)
      // improved by: Kevin van Zonneveld (http://kvz.io/)
      // bugfixed by: Andrej Pavlovic
      // bugfixed by: Garagoth
      // bugfixed by: Russell Walker (http://www.nbill.co.uk/)
      // bugfixed by: Jamie Beck (http://www.terabit.ca/)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io/)
      // bugfixed by: Ben (http://benblume.co.uk/)
      // bugfixed by: Codestar (http://codestarlive.com/)
      //    input by: DtTvB (http://dt.in.th/2008-09-16.string-length-in-bytes.html)
      //    input by: Martin (http://www.erlenwiese.de/)
      //      note 1: We feel the main purpose of this function should be to ease
      //      note 1: the transport of data between php & js
      //      note 1: Aiming for PHP-compatibility, we have to translate objects to arrays
      //   example 1: serialize(['Kevin', 'van', 'Zonneveld'])
      //   returns 1: 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
      //   example 2: serialize({firstName: 'Kevin', midName: 'van'})
      //   returns 2: 'a:2:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";}'
    
      var val, key, okey
      var ktype = ''
      var vals = ''
      var count = 0
    
      var _utf8Size = function (str) {
        var size = 0
        var i = 0
        var l = str.length
        var code = ''
        for (i = 0; i < l; i++) {
          code = str.charCodeAt(i)
          if (code < 0x0080) {
            size += 1
          } else if (code < 0x0800) {
            size += 2
          } else {
            size += 3
          }
        }
        return size
      }
    
      var _getType = function (inp) {
        var match
        var key
        var cons
        var types
        var type = typeof inp
    
        if (type === 'object' && !inp) {
          return 'null'
        }
    
        if (type === 'object') {
          if (!inp.constructor) {
            return 'object'
          }
          cons = inp.constructor.toString()
          match = cons.match(/(\w+)\(/)
          if (match) {
            cons = match[1].toLowerCase()
          }
          types = ['boolean', 'number', 'string', 'array']
          for (key in types) {
            if (cons === types[key]) {
              type = types[key]
              break
            }
          }
        }
        return type
      }
    
      var type = _getType(mixedValue)
    
      switch (type) {
        case 'function':
          val = ''
          break
        case 'boolean':
          val = 'b:' + (mixedValue ? '1' : '0')
          break
        case 'number':
          val = (Math.round(mixedValue) === mixedValue ? 'i' : 'd') + ':' + mixedValue
          break
        case 'string':
          val = 's:' + _utf8Size(mixedValue) + ':"' + mixedValue + '"'
          break
        case 'array':
        case 'object':
          val = 'a'
          /*
          if (type === 'object') {
            var objname = mixedValue.constructor.toString().match(/(\w+)\(\)/);
            if (objname === undefined) {
              return;
            }
            objname[1] = serialize(objname[1]);
            val = 'O' + objname[1].substring(1, objname[1].length - 1);
          }
          */
    
          for (key in mixedValue) {
            if (mixedValue.hasOwnProperty(key)) {
              ktype = _getType(mixedValue[key])
              if (ktype === 'function') {
                continue
              }
    
              okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key)
              vals += serialize(okey) + serialize(mixedValue[key])
              count++
            }
          }
          val += ':' + count + ':{' + vals + '}'
          break
        case 'undefined':
        default:
          // Fall-through
          // if the JS object has a property which contains a null value,
          // the string cannot be unserialized by PHP
          val = 'N'
          break
      }
      if (type !== 'object' && type !== 'array') {
        val += ';'
      }
    
      return val
    }
  );

  $php.context.function.declare(
    '\\strval', [
      {"name":"var","type":"mixed"}
    ],
    'mixed', function strval(str) {
      //  discuss at: http://locutus.io/php/strval/
      // original by: Brett Zamir (http://brett-zamir.me)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: strval({red: 1, green: 2, blue: 3, white: 4})
      //   returns 1: 'Object'
    
      var gettype = require('../var/gettype')
      var type = ''
    
      if (str === null) {
        return ''
      }
    
      type = gettype(str)
    
      // Comment out the entire switch if you want JS-like
      // behavior instead of PHP behavior
      switch (type) {
        case 'boolean':
          if (str === true) {
            return '1'
          }
          return ''
        case 'array':
          return 'Array'
        case 'object':
          return 'Object'
      }
    
      return str
    }
  );

  $php.context.function.declare(
    '\\unserialize', [
      {"name":"str","type":"string"},
      {"name":"options","type":"\\array"}
    ],
    'mixed', function unserialize(data) {
      //  discuss at: http://locutus.io/php/unserialize/
      // original by: Arpad Ray (mailto:arpad@php.net)
      // improved by: Pedro Tainha (http://www.pedrotainha.com)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Chris
      // improved by: James
      // improved by: Le Torbi
      // improved by: Eli Skeggs
      // bugfixed by: dptr1988
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: philippsimon (https://github.com/philippsimon/)
      //  revised by: d3x
      //    input by: Brett Zamir (http://brett-zamir.me)
      //    input by: Martin (http://www.erlenwiese.de/)
      //    input by: kilops
      //    input by: Jaroslaw Czarniak
      //    input by: lovasoa (https://github.com/lovasoa/)
      //      note 1: We feel the main purpose of this function should be
      //      note 1: to ease the transport of data between php & js
      //      note 1: Aiming for PHP-compatibility, we have to translate objects to arrays
      //   example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}')
      //   returns 1: ['Kevin', 'van', 'Zonneveld']
      //   example 2: unserialize('a:2:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";}')
      //   returns 2: {firstName: 'Kevin', midName: 'van'}
      //   example 3: unserialize('a:3:{s:2:"ü";s:2:"ü";s:3:"四";s:3:"四";s:4:"𠜎";s:4:"𠜎";}')
      //   returns 3: {'ü': 'ü', '四': '四', '𠜎': '𠜎'}
    
      var $global = (typeof window !== 'undefined' ? window : global)
    
      var utf8Overhead = function (str) {
        var s = str.length
        for (var i = str.length - 1; i >= 0; i--) {
          var code = str.charCodeAt(i)
          if (code > 0x7f && code <= 0x7ff) {
            s++
          } else if (code > 0x7ff && code <= 0xffff) {
            s += 2
          }
          // trail surrogate
          if (code >= 0xDC00 && code <= 0xDFFF) {
            i--
          }
        }
        return s - 1
      }
      var error = function (type,
        msg, filename, line) {
        throw new $global[type](msg, filename, line)
      }
      var readUntil = function (data, offset, stopchr) {
        var i = 2
        var buf = []
        var chr = data.slice(offset, offset + 1)
    
        while (chr !== stopchr) {
          if ((i + offset) > data.length) {
            error('Error', 'Invalid')
          }
          buf.push(chr)
          chr = data.slice(offset + (i - 1), offset + i)
          i += 1
        }
        return [buf.length, buf.join('')]
      }
      var readChrs = function (data, offset, length) {
        var i, chr, buf
    
        buf = []
        for (i = 0; i < length; i++) {
          chr = data.slice(offset + (i - 1), offset + i)
          buf.push(chr)
          length -= utf8Overhead(chr)
        }
        return [buf.length, buf.join('')]
      }
      function _unserialize (data, offset) {
        var dtype
        var dataoffset
        var keyandchrs
        var keys
        var contig
        var length
        var array
        var readdata
        var readData
        var ccount
        var stringlength
        var i
        var key
        var kprops
        var kchrs
        var vprops
        var vchrs
        var value
        var chrs = 0
        var typeconvert = function (x) {
          return x
        }
    
        if (!offset) {
          offset = 0
        }
        dtype = (data.slice(offset, offset + 1)).toLowerCase()
    
        dataoffset = offset + 2
    
        switch (dtype) {
          case 'i':
            typeconvert = function (x) {
              return parseInt(x, 10)
            }
            readData = readUntil(data, dataoffset, ';')
            chrs = readData[0]
            readdata = readData[1]
            dataoffset += chrs + 1
            break
          case 'b':
            typeconvert = function (x) {
              return parseInt(x, 10) !== 0
            }
            readData = readUntil(data, dataoffset, ';')
            chrs = readData[0]
            readdata = readData[1]
            dataoffset += chrs + 1
            break
          case 'd':
            typeconvert = function (x) {
              return parseFloat(x)
            }
            readData = readUntil(data, dataoffset, ';')
            chrs = readData[0]
            readdata = readData[1]
            dataoffset += chrs + 1
            break
          case 'n':
            readdata = null
            break
          case 's':
            ccount = readUntil(data, dataoffset, ':')
            chrs = ccount[0]
            stringlength = ccount[1]
            dataoffset += chrs + 2
    
            readData = readChrs(data, dataoffset + 1, parseInt(stringlength, 10))
            chrs = readData[0]
            readdata = readData[1]
            dataoffset += chrs + 2
            if (chrs !== parseInt(stringlength, 10) && chrs !== readdata.length) {
              error('SyntaxError', 'String length mismatch')
            }
            break
          case 'a':
            readdata = {}
    
            keyandchrs = readUntil(data, dataoffset, ':')
            chrs = keyandchrs[0]
            keys = keyandchrs[1]
            dataoffset += chrs + 2
    
            length = parseInt(keys, 10)
            contig = true
    
            for (i = 0; i < length; i++) {
              kprops = _unserialize(data, dataoffset)
              kchrs = kprops[1]
              key = kprops[2]
              dataoffset += kchrs
    
              vprops = _unserialize(data, dataoffset)
              vchrs = vprops[1]
              value = vprops[2]
              dataoffset += vchrs
    
              if (key !== i) {
                contig = false
              }
    
              readdata[key] = value
            }
    
            if (contig) {
              array = new Array(length)
              for (i = 0; i < length; i++) {
                array[i] = readdata[i]
              }
              readdata = array
            }
    
            dataoffset += 1
            break
          default:
            error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype)
            break
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)]
      }
    
      return _unserialize((data + ''), 0)[2]
    }
  );

  $php.context.function.declare(
    '\\var_dump', [
      {"name":"expression","type":"mixed"},
      {"name":"_","type":"mixed"}
    ],
    'void', function var_dump() { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/var_dump/
      // original by: Brett Zamir (http://brett-zamir.me)
      // improved by: Zahlii
      // improved by: Brett Zamir (http://brett-zamir.me)
      //      note 1: For returning a string, use var_export() with the second argument set to true
      //        test: skip-all
      //   example 1: var_dump(1)
      //   returns 1: 'int(1)'
    
      var echo = require('../strings/echo')
      var output = ''
      var padChar = ' '
      var padVal = 4
      var lgth = 0
      var i = 0
    
      var _getFuncName = function (fn) {
        var name = (/\W*function\s+([\w\$]+)\s*\(/)
          .exec(fn)
        if (!name) {
          return '(Anonymous)'
        }
        return name[1]
      }
    
      var _repeatChar = function (len, padChar) {
        var str = ''
        for (var i = 0; i < len; i++) {
          str += padChar
        }
        return str
      }
      var _getInnerVal = function (val, thickPad) {
        var ret = ''
        if (val === null) {
          ret = 'NULL'
        } else if (typeof val === 'boolean') {
          ret = 'bool(' + val + ')'
        } else if (typeof val === 'string') {
          ret = 'string(' + val.length + ') "' + val + '"'
        } else if (typeof val === 'number') {
          if (parseFloat(val) === parseInt(val, 10)) {
            ret = 'int(' + val + ')'
          } else {
            ret = 'float(' + val + ')'
          }
        } else if (typeof val === 'undefined') {
          // The remaining are not PHP behavior because these values
          // only exist in this exact form in JavaScript
          ret = 'undefined'
        } else if (typeof val === 'function') {
          var funcLines = val.toString()
            .split('\n')
          ret = ''
          for (var i = 0, fll = funcLines.length; i < fll; i++) {
            ret += (i !== 0 ? '\n' + thickPad : '') + funcLines[i]
          }
        } else if (val instanceof Date) {
          ret = 'Date(' + val + ')'
        } else if (val instanceof RegExp) {
          ret = 'RegExp(' + val + ')'
        } else if (val.nodeName) {
          // Different than PHP's DOMElement
          switch (val.nodeType) {
            case 1:
              if (typeof val.namespaceURI === 'undefined' ||
                val.namespaceURI === 'http://www.w3.org/1999/xhtml') {
              // Undefined namespace could be plain XML, but namespaceURI not widely supported
                ret = 'HTMLElement("' + val.nodeName + '")'
              } else {
                ret = 'XML Element("' + val.nodeName + '")'
              }
              break
            case 2:
              ret = 'ATTRIBUTE_NODE(' + val.nodeName + ')'
              break
            case 3:
              ret = 'TEXT_NODE(' + val.nodeValue + ')'
              break
            case 4:
              ret = 'CDATA_SECTION_NODE(' + val.nodeValue + ')'
              break
            case 5:
              ret = 'ENTITY_REFERENCE_NODE'
              break
            case 6:
              ret = 'ENTITY_NODE'
              break
            case 7:
              ret = 'PROCESSING_INSTRUCTION_NODE(' + val.nodeName + ':' + val.nodeValue + ')'
              break
            case 8:
              ret = 'COMMENT_NODE(' + val.nodeValue + ')'
              break
            case 9:
              ret = 'DOCUMENT_NODE'
              break
            case 10:
              ret = 'DOCUMENT_TYPE_NODE'
              break
            case 11:
              ret = 'DOCUMENT_FRAGMENT_NODE'
              break
            case 12:
              ret = 'NOTATION_NODE'
              break
          }
        }
        return ret
      }
    
      var _formatArray = function (obj, curDepth, padVal, padChar) {
        if (curDepth > 0) {
          curDepth++
        }
    
        var basePad = _repeatChar(padVal * (curDepth - 1), padChar)
        var thickPad = _repeatChar(padVal * (curDepth + 1), padChar)
        var str = ''
        var val = ''
    
        if (typeof obj === 'object' && obj !== null) {
          if (obj.constructor && _getFuncName(obj.constructor) === 'LOCUTUS_Resource') {
            return obj.var_dump()
          }
          lgth = 0
          for (var someProp in obj) {
            if (obj.hasOwnProperty(someProp)) {
              lgth++
            }
          }
          str += 'array(' + lgth + ') {\n'
          for (var key in obj) {
            var objVal = obj[key]
            if (typeof objVal === 'object' &&
              objVal !== null &&
              !(objVal instanceof Date) &&
              !(objVal instanceof RegExp) &&
              !objVal.nodeName) {
              str += thickPad
              str += '['
              str += key
              str += '] =>\n'
              str += thickPad
              str += _formatArray(objVal, curDepth + 1, padVal, padChar)
            } else {
              val = _getInnerVal(objVal, thickPad)
              str += thickPad
              str += '['
              str += key
              str += '] =>\n'
              str += thickPad
              str += val
              str += '\n'
            }
          }
          str += basePad + '}\n'
        } else {
          str = _getInnerVal(obj, thickPad)
        }
        return str
      }
    
      output = _formatArray(arguments[0], 0, padVal, padChar)
      for (i = 1; i < arguments.length; i++) {
        output += '\n' + _formatArray(arguments[i], 0, padVal, padChar)
      }
    
      echo(output)
    
      // Not how PHP does it, but helps us test:
      return output
    }
  );

  $php.context.function.declare(
    '\\var_export', [
      {"name":"expression","type":"mixed"},
      {"name":"return","type":"bool"}
    ],
    'mixed', function var_export(mixedExpression, boolReturn) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/var_export/
      // original by: Philip Peterson
      // improved by: johnrembo
      // improved by: Brett Zamir (http://brett-zamir.me)
      //    input by: Brian Tafoya (http://www.premasolutions.com/)
      //    input by: Hans Henrik (http://hanshenrik.tk/)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: var_export(null)
      //   returns 1: null
      //   example 2: var_export({0: 'Kevin', 1: 'van', 2: 'Zonneveld'}, true)
      //   returns 2: "array (\n  0 => 'Kevin',\n  1 => 'van',\n  2 => 'Zonneveld'\n)"
      //   example 3: var data = 'Kevin'
      //   example 3: var_export(data, true)
      //   returns 3: "'Kevin'"
    
      var echo = require('../strings/echo')
      var retstr = ''
      var iret = ''
      var value
      var cnt = 0
      var x = []
      var i = 0
      var funcParts = []
      // We use the last argument (not part of PHP) to pass in
      // our indentation level
      var idtLevel = arguments[2] || 2
      var innerIndent = ''
      var outerIndent = ''
      var getFuncName = function (fn) {
        var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn)
        if (!name) {
          return '(Anonymous)'
        }
        return name[1]
      }
    
      var _makeIndent = function (idtLevel) {
        return (new Array(idtLevel + 1))
          .join(' ')
      }
      var __getType = function (inp) {
        var i = 0
        var match
        var types
        var cons
        var type = typeof inp
        if (type === 'object' && (inp && inp.constructor) &&
          getFuncName(inp.constructor) === 'LOCUTUS_Resource') {
          return 'resource'
        }
        if (type === 'function') {
          return 'function'
        }
        if (type === 'object' && !inp) {
          // Should this be just null?
          return 'null'
        }
        if (type === 'object') {
          if (!inp.constructor) {
            return 'object'
          }
          cons = inp.constructor.toString()
          match = cons.match(/(\w+)\(/)
          if (match) {
            cons = match[1].toLowerCase()
          }
          types = ['boolean', 'number', 'string', 'array']
          for (i = 0; i < types.length; i++) {
            if (cons === types[i]) {
              type = types[i]
              break
            }
          }
        }
        return type
      }
      var type = __getType(mixedExpression)
    
      if (type === null) {
        retstr = 'NULL'
      } else if (type === 'array' || type === 'object') {
        outerIndent = _makeIndent(idtLevel - 2)
        innerIndent = _makeIndent(idtLevel)
        for (i in mixedExpression) {
          value = var_export(mixedExpression[i], 1, idtLevel + 2)
          value = typeof value === 'string' ? value.replace(/</g, '&lt;')
            .replace(/>/g, '&gt;') : value
          x[cnt++] = innerIndent + i + ' => ' +
            (__getType(mixedExpression[i]) === 'array' ? '\n' : '') + value
        }
        iret = x.join(',\n')
        retstr = outerIndent + 'array (\n' + iret + '\n' + outerIndent + ')'
      } else if (type === 'function') {
        funcParts = mixedExpression.toString().match(/function .*?\((.*?)\) \{([\s\S]*)\}/)
    
        // For lambda functions, var_export() outputs such as the following:
        // '\000lambda_1'. Since it will probably not be a common use to
        // expect this (unhelpful) form, we'll use another PHP-exportable
        // construct, create_function() (though dollar signs must be on the
        // variables in JavaScript); if using instead in JavaScript and you
        // are using the namespaced version, note that create_function() will
        // not be available as a global
        retstr = "create_function ('" + funcParts[1] + "', '" +
          funcParts[2].replace(new RegExp("'", 'g'), "\\'") + "')"
      } else if (type === 'resource') {
        // Resources treated as null for var_export
        retstr = 'NULL'
      } else {
        retstr = typeof mixedExpression !== 'string' ? mixedExpression
          : "'" + mixedExpression.replace(/(["'])/g, '\\$1').replace(/\0/g, '\\0') + "'"
      }
    
      if (!boolReturn) {
        echo(retstr)
        return null
      }
    
      return retstr
    }
  );

};