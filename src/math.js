/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\abs', [
      {"name":"number","type":"mixed"}
    ],
    'number', function abs(mixedNumber) {
      //  discuss at: http://locutus.io/php/abs/
      // original by: Waldo Malqui Silva (http://waldo.malqui.info)
      // improved by: Karol Kowalski
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      //   example 1: abs(4.2)
      //   returns 1: 4.2
      //   example 2: abs(-4.2)
      //   returns 2: 4.2
      //   example 3: abs(-5)
      //   returns 3: 5
      //   example 4: abs('_argos')
      //   returns 4: 0
    
      return Math.abs(mixedNumber) || 0
    }
  );

  $php.context.function.declare(
    '\\acos', [
      {"name":"arg","type":"float"}
    ],
    'float', function acos(arg) {
      //  discuss at: http://locutus.io/php/acos/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //      note 1: Sorry about the crippled test. Needed because precision differs accross platforms.
      //   example 1: (acos(0.3) + '').substr(0, 17)
      //   returns 1: "1.266103672779499"
    
      return Math.acos(arg)
    }
  );

  $php.context.function.declare(
    '\\acosh', [
      {"name":"arg","type":"float"}
    ],
    'float', function acosh(arg) {
      //  discuss at: http://locutus.io/php/acosh/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: acosh(8723321.4)
      //   returns 1: 16.674657798418625
    
      return Math.log(arg + Math.sqrt(arg * arg - 1))
    }
  );

  $php.context.function.declare(
    '\\asin', [
      {"name":"arg","type":"float"}
    ],
    'float', function asin(arg) {
      //  discuss at: http://locutus.io/php/asin/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //      note 1: Sorry about the crippled test. Needed because precision differs accross platforms.
      //   example 1: (asin(0.3) + '').substr(0, 17)
      //   returns 1: "0.304692654015397"
    
      return Math.asin(arg)
    }
  );

  $php.context.function.declare(
    '\\asinh', [
      {"name":"arg","type":"float"}
    ],
    'float', function asinh(arg) {
      //  discuss at: http://locutus.io/php/asinh/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: asinh(8723321.4)
      //   returns 1: 16.67465779841863
    
      return Math.log(arg + Math.sqrt(arg * arg + 1))
    }
  );

  $php.context.function.declare(
    '\\atan', [
      {"name":"arg","type":"float"}
    ],
    'float', function atan(arg) {
      //  discuss at: http://locutus.io/php/atan/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: atan(8723321.4)
      //   returns 1: 1.5707962121596615
    
      return Math.atan(arg)
    }
  );

  $php.context.function.declare(
    '\\atan2', [
      {"name":"y","type":"float"},
      {"name":"x","type":"float"}
    ],
    'float', function atan2(y, x) {
      //  discuss at: http://locutus.io/php/atan2/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: atan2(1, 1)
      //   returns 1: 0.7853981633974483
    
      return Math.atan2(y, x)
    }
  );

  $php.context.function.declare(
    '\\atanh', [
      {"name":"arg","type":"float"}
    ],
    'float', function atanh(arg) {
      //  discuss at: http://locutus.io/php/atanh/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: atanh(0.3)
      //   returns 1: 0.3095196042031118
    
      return 0.5 * Math.log((1 + arg) / (1 - arg))
    }
  );

  $php.context.function.declare(
    '\\base_convert', [
      {"name":"number","type":"string"},
      {"name":"frombase","type":"int"},
      {"name":"tobase","type":"int"}
    ],
    'string', function base_convert(number, frombase, tobase) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/base_convert/
      // original by: Philippe Baumann
      // improved by: Rafał Kukawski (http://blog.kukawski.pl)
      //   example 1: base_convert('A37334', 16, 2)
      //   returns 1: '101000110111001100110100'
    
      return parseInt(number + '', frombase | 0)
        .toString(tobase | 0)
    }
  );

  $php.context.function.declare(
    '\\bindec', [
      {"name":"binary_string","type":"string"}
    ],
    'number', function bindec(binaryString) {
      //  discuss at: http://locutus.io/php/bindec/
      // original by: Philippe Baumann
      //   example 1: bindec('110011')
      //   returns 1: 51
      //   example 2: bindec('000110011')
      //   returns 2: 51
      //   example 3: bindec('111')
      //   returns 3: 7
    
      binaryString = (binaryString + '').replace(/[^01]/gi, '')
    
      return parseInt(binaryString, 2)
    }
  );

  $php.context.function.declare(
    '\\ceil', [
      {"name":"value","type":"float"}
    ],
    'float', function ceil(value) {
      //  discuss at: http://locutus.io/php/ceil/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: ceil(8723321.4)
      //   returns 1: 8723322
    
      return Math.ceil(value)
    }
  );

  $php.context.function.declare(
    '\\cos', [
      {"name":"arg","type":"float"}
    ],
    'float', function cos(arg) {
      //  discuss at: http://locutus.io/php/cos/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: Math.ceil(cos(8723321.4) * 10000000)
      //   returns 1: -1812718
    
      return Math.cos(arg)
    }
  );

  $php.context.function.declare(
    '\\cosh', [
      {"name":"arg","type":"float"}
    ],
    'float', function cosh(arg) {
      //  discuss at: http://locutus.io/php/cosh/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: cosh(-0.18127180117607017)
      //   returns 1: 1.0164747716114113
    
      return (Math.exp(arg) + Math.exp(-arg)) / 2
    }
  );

  $php.context.function.declare(
    '\\decbin', [
      {"name":"number","type":"int"}
    ],
    'string', function decbin(number) {
      //  discuss at: http://locutus.io/php/decbin/
      // original by: Enrique Gonzalez
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
      //    input by: pilus
      //    input by: nord_ua
      //   example 1: decbin(12)
      //   returns 1: '1100'
      //   example 2: decbin(26)
      //   returns 2: '11010'
      //   example 3: decbin('26')
      //   returns 3: '11010'
    
      if (number < 0) {
        number = 0xFFFFFFFF + number + 1
      }
      return parseInt(number, 10)
        .toString(2)
    }
  );

  $php.context.function.declare(
    '\\dechex', [
      {"name":"number","type":"int"}
    ],
    'string', function dechex(number) {
      //  discuss at: http://locutus.io/php/dechex/
      // original by: Philippe Baumann
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
      //    input by: pilus
      //   example 1: dechex(10)
      //   returns 1: 'a'
      //   example 2: dechex(47)
      //   returns 2: '2f'
      //   example 3: dechex(-1415723993)
      //   returns 3: 'ab9dc427'
    
      if (number < 0) {
        number = 0xFFFFFFFF + number + 1
      }
      return parseInt(number, 10)
        .toString(16)
    }
  );

  $php.context.function.declare(
    '\\decoct', [
      {"name":"number","type":"int"}
    ],
    'string', function decoct(number) {
      //  discuss at: http://locutus.io/php/decoct/
      // original by: Enrique Gonzalez
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
      //    input by: pilus
      //   example 1: decoct(15)
      //   returns 1: '17'
      //   example 2: decoct(264)
      //   returns 2: '410'
    
      if (number < 0) {
        number = 0xFFFFFFFF + number + 1
      }
      return parseInt(number, 10)
        .toString(8)
    }
  );

  $php.context.function.declare(
    '\\deg2rad', [
      {"name":"number","type":"float"}
    ],
    'float', function deg2rad(angle) {
      //  discuss at: http://locutus.io/php/deg2rad/
      // original by: Enrique Gonzalez
      // improved by: Thomas Grainger (http://graingert.co.uk)
      //   example 1: deg2rad(45)
      //   returns 1: 0.7853981633974483
    
      return angle * 0.017453292519943295 // (angle / 180) * Math.PI;
    }
  );

  $php.context.function.declare(
    '\\exp', [
      {"name":"arg","type":"float"}
    ],
    'float', function exp(arg) {
      //  discuss at: http://locutus.io/php/exp/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: exp(0.3)
      //   returns 1: 1.3498588075760032
    
      return Math.exp(arg)
    }
  );

  $php.context.function.declare(
    '\\expm1', [
      {"name":"arg","type":"float"}
    ],
    'float', function expm1(x) {
      //  discuss at: http://locutus.io/php/expm1/
      // original by: Brett Zamir (http://brett-zamir.me)
      // improved by: Robert Eisele (http://www.xarg.org/)
      //      note 1: Precision 'n' can be adjusted as desired
      //   example 1: expm1(1e-15)
      //   returns 1: 1.0000000000000007e-15
    
      return (x < 1e-5 && x > -1e-5)
        ? x + 0.5 * x * x
        : Math.exp(x) - 1
    }
  );

  $php.context.function.declare(
    '\\floor', [
      {"name":"value","type":"float"}
    ],
    'float', function floor(value) {
      //  discuss at: http://locutus.io/php/floor/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: floor(8723321.4)
      //   returns 1: 8723321
    
      return Math.floor(value)
    }
  );

  $php.context.function.declare(
    '\\fmod', [
      {"name":"x","type":"float"},
      {"name":"y","type":"float"}
    ],
    'float', function fmod(x, y) {
      //  discuss at: http://locutus.io/php/fmod/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //    input by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: fmod(5.7, 1.3)
      //   returns 1: 0.5
    
      var tmp
      var tmp2
      var p = 0
      var pY = 0
      var l = 0.0
      var l2 = 0.0
    
      tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/)
      p = parseInt(tmp[2], 10) - (tmp[1] + '').length
      tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/)
      pY = parseInt(tmp[2], 10) - (tmp[1] + '').length
    
      if (pY > p) {
        p = pY
      }
    
      tmp2 = (x % y)
    
      if (p < -100 || p > 20) {
        // toFixed will give an out of bound error so we fix it like this:
        l = Math.round(Math.log(tmp2) / Math.log(10))
        l2 = Math.pow(10, l)
    
        return (tmp2 / l2).toFixed(l - p) * l2
      } else {
        return parseFloat(tmp2.toFixed(-p))
      }
    }
  );

  $php.context.function.declare(
    '\\getrandmax', [],
    'int', function getrandmax() {
      //  discuss at: http://locutus.io/php/getrandmax/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: getrandmax()
      //   returns 1: 2147483647
    
      return 2147483647
    }
  );

  $php.context.function.declare(
    '\\hexdec', [
      {"name":"hex_string","type":"string"}
    ],
    'number', function hexdec(hexString) {
      //  discuss at: http://locutus.io/php/hexdec/
      // original by: Philippe Baumann
      //   example 1: hexdec('that')
      //   returns 1: 10
      //   example 2: hexdec('a0')
      //   returns 2: 160
    
      hexString = (hexString + '').replace(/[^a-f0-9]/gi, '')
      return parseInt(hexString, 16)
    }
  );

  $php.context.function.declare(
    '\\hypot', [
      {"name":"x","type":"float"},
      {"name":"y","type":"float"}
    ],
    'float', function hypot(x, y) {
      //  discuss at: http://locutus.io/php/hypot/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      // imprived by: Robert Eisele (http://www.xarg.org/)
      //   example 1: hypot(3, 4)
      //   returns 1: 5
      //   example 2: hypot([], 'a')
      //   returns 2: null
    
      x = Math.abs(x)
      y = Math.abs(y)
    
      var t = Math.min(x, y)
      x = Math.max(x, y)
      t = t / x
    
      return x * Math.sqrt(1 + t * t) || null
    }
  );

  $php.context.function.declare(
    '\\is_finite', [
      {"name":"val","type":"float"}
    ],
    'bool', function is_finite(val) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_finite/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: is_finite(Infinity)
      //   returns 1: false
      //   example 2: is_finite(-Infinity)
      //   returns 2: false
      //   example 3: is_finite(0)
      //   returns 3: true
    
      var warningType = ''
    
      if (val === Infinity || val === -Infinity) {
        return false
      }
    
      // Some warnings for maximum PHP compatibility
      if (typeof val === 'object') {
        warningType = (Object.prototype.toString.call(val) === '[object Array]' ? 'array' : 'object')
      } else if (typeof val === 'string' && !val.match(/^[\+\-]?\d/)) {
        // simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
        warningType = 'string'
      }
      if (warningType) {
        var msg = 'Warning: is_finite() expects parameter 1 to be double, ' + warningType + ' given'
        throw new Error(msg)
      }
    
      return true
    }
  );

  $php.context.function.declare(
    '\\is_infinite', [
      {"name":"val","type":"float"}
    ],
    'bool', function is_infinite(val) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_infinite/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: is_infinite(Infinity)
      //   returns 1: true
      //   example 2: is_infinite(-Infinity)
      //   returns 2: true
      //   example 3: is_infinite(0)
      //   returns 3: false
    
      var warningType = ''
    
      if (val === Infinity || val === -Infinity) {
        return true
      }
    
      // Some warnings for maximum PHP compatibility
      if (typeof val === 'object') {
        warningType = (Object.prototype.toString.call(val) === '[object Array]' ? 'array' : 'object')
      } else if (typeof val === 'string' && !val.match(/^[\+\-]?\d/)) {
        // simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
        warningType = 'string'
      }
      if (warningType) {
        var msg = 'Warning: is_infinite() expects parameter 1 to be double, ' + warningType + ' given'
        throw new Error(msg)
      }
    
      return false
    }
  );

  $php.context.function.declare(
    '\\is_nan', [
      {"name":"val","type":"float"}
    ],
    'bool', function is_nan(val) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/is_nan/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //    input by: Robin
      //   example 1: is_nan(NaN)
      //   returns 1: true
      //   example 2: is_nan(0)
      //   returns 2: false
    
      var warningType = ''
    
      if (typeof val === 'number' && isNaN(val)) {
        return true
      }
    
      // Some errors for maximum PHP compatibility
      if (typeof val === 'object') {
        warningType = (Object.prototype.toString.call(val) === '[object Array]' ? 'array' : 'object')
      } else if (typeof val === 'string' && !val.match(/^[\+\-]?\d/)) {
        // simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
        warningType = 'string'
      }
      if (warningType) {
        throw new Error('Warning: is_nan() expects parameter 1 to be double, ' + warningType + ' given')
      }
    
      return false
    }
  );

  $php.context.function.declare(
    '\\lcg_value', [],
    'float', function lcg_value() { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/lcg_value/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: var $rnd = lcg_value()
      //   example 1: var $result = $rnd >= 0 && $rnd <= 1
      //   returns 1: true
    
      return Math.random()
    }
  );

  $php.context.function.declare(
    '\\log', [
      {"name":"arg","type":"float"},
      {"name":"base","type":"float"}
    ],
    'float', function log(arg, base) {
      //  discuss at: http://locutus.io/php/log/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: log(8723321.4, 7)
      //   returns 1: 8.212871815082147
    
      return (typeof base === 'undefined')
        ? Math.log(arg)
        : Math.log(arg) / Math.log(base)
    }
  );

  $php.context.function.declare(
    '\\log10', [
      {"name":"arg","type":"float"}
    ],
    'float', function log10(arg) {
      //  discuss at: http://locutus.io/php/log10/
      // original by: Philip Peterson
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Tod Gentille
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: log10(10)
      //   returns 1: 1
      //   example 2: log10(1)
      //   returns 2: 0
    
      return Math.log(arg) / 2.302585092994046 // Math.LN10
    }
  );

  $php.context.function.declare(
    '\\log1p', [
      {"name":"number","type":"float"}
    ],
    'float', function log1p(x) {
      //  discuss at: http://locutus.io/php/log1p/
      // original by: Brett Zamir (http://brett-zamir.me)
      // improved by: Robert Eisele (http://www.xarg.org/)
      //      note 1: Precision 'n' can be adjusted as desired
      //   example 1: log1p(1e-15)
      //   returns 1: 9.999999999999995e-16
    
      var ret = 0
      // degree of precision
      var n = 50
    
      if (x <= -1) {
        // JavaScript style would be to return Number.NEGATIVE_INFINITY
        return '-INF'
      }
      if (x < 0 || x > 1) {
        return Math.log(1 + x)
      }
      for (var i = 1; i < n; i++) {
        ret += Math.pow(-x, i) / i
      }
    
      return -ret
    }
  );

  $php.context.function.declare(
    '\\max', [
      {"name":"value1","type":"\\array"},
      {"name":"value2","type":"mixed"},
      {"name":"values","type":"mixed"}
    ],
    'mixed', function max() {
      //  discuss at: http://locutus.io/php/max/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //  revised by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Jack
      //      note 1: Long code cause we're aiming for maximum PHP compatibility
      //   example 1: max(1, 3, 5, 6, 7)
      //   returns 1: 7
      //   example 2: max([2, 4, 5])
      //   returns 2: 5
      //   example 3: max(0, 'hello')
      //   returns 3: 0
      //   example 4: max('hello', 0)
      //   returns 4: 'hello'
      //   example 5: max(-1, 'hello')
      //   returns 5: 'hello'
      //   example 6: max([2, 4, 8], [2, 5, 7])
      //   returns 6: [2, 5, 7]
    
      var ar
      var retVal
      var i = 0
      var n = 0
      var argv = arguments
      var argc = argv.length
      var _obj2Array = function (obj) {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
          return obj
        } else {
          var ar = []
          for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
              ar.push(obj[i])
            }
          }
          return ar
        }
      }
      var _compare = function (current, next) {
        var i = 0
        var n = 0
        var tmp = 0
        var nl = 0
        var cl = 0
    
        if (current === next) {
          return 0
        } else if (typeof current === 'object') {
          if (typeof next === 'object') {
            current = _obj2Array(current)
            next = _obj2Array(next)
            cl = current.length
            nl = next.length
            if (nl > cl) {
              return 1
            } else if (nl < cl) {
              return -1
            }
            for (i = 0, n = cl; i < n; ++i) {
              tmp = _compare(current[i], next[i])
              if (tmp === 1) {
                return 1
              } else if (tmp === -1) {
                return -1
              }
            }
            return 0
          }
          return -1
        } else if (typeof next === 'object') {
          return 1
        } else if (isNaN(next) && !isNaN(current)) {
          if (current === 0) {
            return 0
          }
          return (current < 0 ? 1 : -1)
        } else if (isNaN(current) && !isNaN(next)) {
          if (next === 0) {
            return 0
          }
          return (next > 0 ? 1 : -1)
        }
    
        if (next === current) {
          return 0
        }
    
        return (next > current ? 1 : -1)
      }
    
      if (argc === 0) {
        throw new Error('At least one value should be passed to max()')
      } else if (argc === 1) {
        if (typeof argv[0] === 'object') {
          ar = _obj2Array(argv[0])
        } else {
          throw new Error('Wrong parameter count for max()')
        }
        if (ar.length === 0) {
          throw new Error('Array must contain at least one element for max()')
        }
      } else {
        ar = argv
      }
    
      retVal = ar[0]
      for (i = 1, n = ar.length; i < n; ++i) {
        if (_compare(retVal, ar[i]) === 1) {
          retVal = ar[i]
        }
      }
    
      return retVal
    }
  );

  $php.context.function.declare(
    '\\min', [
      {"name":"value1","type":"\\array"},
      {"name":"value2","type":"mixed"},
      {"name":"values","type":"mixed"}
    ],
    'mixed', function min() {
      //  discuss at: http://locutus.io/php/min/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //  revised by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Jack
      //      note 1: Long code cause we're aiming for maximum PHP compatibility
      //   example 1: min(1, 3, 5, 6, 7)
      //   returns 1: 1
      //   example 2: min([2, 4, 5])
      //   returns 2: 2
      //   example 3: min(0, 'hello')
      //   returns 3: 0
      //   example 4: min('hello', 0)
      //   returns 4: 'hello'
      //   example 5: min(-1, 'hello')
      //   returns 5: -1
      //   example 6: min([2, 4, 8], [2, 5, 7])
      //   returns 6: [2, 4, 8]
    
      var ar
      var retVal
      var i = 0
      var n = 0
      var argv = arguments
      var argc = argv.length
      var _obj2Array = function (obj) {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
          return obj
        }
        var ar = []
        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            ar.push(obj[i])
          }
        }
        return ar
      }
    
      var _compare = function (current, next) {
        var i = 0
        var n = 0
        var tmp = 0
        var nl = 0
        var cl = 0
    
        if (current === next) {
          return 0
        } else if (typeof current === 'object') {
          if (typeof next === 'object') {
            current = _obj2Array(current)
            next = _obj2Array(next)
            cl = current.length
            nl = next.length
            if (nl > cl) {
              return 1
            } else if (nl < cl) {
              return -1
            }
            for (i = 0, n = cl; i < n; ++i) {
              tmp = _compare(current[i], next[i])
              if (tmp === 1) {
                return 1
              } else if (tmp === -1) {
                return -1
              }
            }
            return 0
          }
          return -1
        } else if (typeof next === 'object') {
          return 1
        } else if (isNaN(next) && !isNaN(current)) {
          if (current === 0) {
            return 0
          }
          return (current < 0 ? 1 : -1)
        } else if (isNaN(current) && !isNaN(next)) {
          if (next === 0) {
            return 0
          }
          return (next > 0 ? 1 : -1)
        }
    
        if (next === current) {
          return 0
        }
    
        return (next > current ? 1 : -1)
      }
    
      if (argc === 0) {
        throw new Error('At least one value should be passed to min()')
      } else if (argc === 1) {
        if (typeof argv[0] === 'object') {
          ar = _obj2Array(argv[0])
        } else {
          throw new Error('Wrong parameter count for min()')
        }
    
        if (ar.length === 0) {
          throw new Error('Array must contain at least one element for min()')
        }
      } else {
        ar = argv
      }
    
      retVal = ar[0]
    
      for (i = 1, n = ar.length; i < n; ++i) {
        if (_compare(retVal, ar[i]) === -1) {
          retVal = ar[i]
        }
      }
    
      return retVal
    }
  );

  $php.context.function.declare(
    '\\mt_getrandmax', [],
    'int', function mt_getrandmax() { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/mt_getrandmax/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: mt_getrandmax()
      //   returns 1: 2147483647
    
      return 2147483647
    }
  );

  $php.context.function.declare(
    '\\mt_rand', [
      {"name":"min"},
      {"name":"max"}
    ],
    'int', function mt_rand(min, max) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/mt_rand/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //    input by: Kongo
      //   example 1: mt_rand(1, 1)
      //   returns 1: 1
    
      var argc = arguments.length
      if (argc === 0) {
        min = 0
        max = 2147483647
      } else if (argc === 1) {
        throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given')
      } else {
        min = parseInt(min, 10)
        max = parseInt(max, 10)
      }
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  );

  $php.context.function.declare(
    '\\octdec', [
      {"name":"octal_string","type":"string"}
    ],
    'number', function octdec(octString) {
      //  discuss at: http://locutus.io/php/octdec/
      // original by: Philippe Baumann
      //   example 1: octdec('77')
      //   returns 1: 63
    
      octString = (octString + '').replace(/[^0-7]/gi, '')
      return parseInt(octString, 8)
    }
  );

  $php.context.function.declare(
    '\\pi', [],
    'float', function pi() {
      //  discuss at: http://locutus.io/php/pi/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: dude
      //   example 1: pi(8723321.4)
      //   returns 1: 3.141592653589793
    
      return 3.141592653589793 // Math.PI
    }
  );

  $php.context.function.declare(
    '\\pow', [
      {"name":"base","type":"number"},
      {"name":"exp","type":"number"}
    ],
    'number', function pow(base, exp) {
      //  discuss at: http://locutus.io/php/pow/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: pow(8723321.4, 7)
      //   returns 1: 3.8439091680778995e+48
    
      return Math.pow(base, exp)
    }
  );

  $php.context.function.declare(
    '\\rad2deg', [
      {"name":"number","type":"float"}
    ],
    'float', function rad2deg(angle) {
      //  discuss at: http://locutus.io/php/rad2deg/
      // original by: Enrique Gonzalez
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: rad2deg(3.141592653589793)
      //   returns 1: 180
    
      return angle * 57.29577951308232 // angle / Math.PI * 180
    }
  );

  $php.context.function.declare(
    '\\rand', [
      {"name":"min"},
      {"name":"max"}
    ],
    'int', function rand(min, max) {
      //  discuss at: http://locutus.io/php/rand/
      // original by: Leslie Hoare
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //      note 1: See the commented out code below for a version which
      //      note 1: will work with our experimental (though probably unnecessary)
      //      note 1: srand() function)
      //   example 1: rand(1, 1)
      //   returns 1: 1
    
      var argc = arguments.length
      if (argc === 0) {
        min = 0
        max = 2147483647
      } else if (argc === 1) {
        throw new Error('Warning: rand() expects exactly 2 parameters, 1 given')
      }
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  );

  $php.context.function.declare(
    '\\round', [
      {"name":"val","type":"mixed"},
      {"name":"precision","type":"mixed"},
      {"name":"mode","type":"mixed"}
    ],
    'mixed', function round(value, precision, mode) {
      //  discuss at: http://locutus.io/php/round/
      // original by: Philip Peterson
      //  revised by: Onno Marsman (https://twitter.com/onnomarsman)
      //  revised by: T.Wild
      //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
      //    input by: Greenseed
      //    input by: meo
      //    input by: William
      //    input by: Josep Sanz (http://www.ws3.es/)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      note 1: Great work. Ideas for improvement:
      //      note 1: - code more compliant with developer guidelines
      //      note 1: - for implementing PHP constant arguments look at
      //      note 1: the pathinfo() function, it offers the greatest
      //      note 1: flexibility & compatibility possible
      //   example 1: round(1241757, -3)
      //   returns 1: 1242000
      //   example 2: round(3.6)
      //   returns 2: 4
      //   example 3: round(2.835, 2)
      //   returns 3: 2.84
      //   example 4: round(1.1749999999999, 2)
      //   returns 4: 1.17
      //   example 5: round(58551.799999999996, 2)
      //   returns 5: 58551.8
    
      var m, f, isHalf, sgn // helper variables
      // making sure precision is integer
      precision |= 0
      m = Math.pow(10, precision)
      value *= m
      // sign of the number
      sgn = (value > 0) | -(value < 0)
      isHalf = value % 1 === 0.5 * sgn
      f = Math.floor(value)
    
      if (isHalf) {
        switch (mode) {
          case 'PHP_ROUND_HALF_DOWN':
          // rounds .5 toward zero
            value = f + (sgn < 0)
            break
          case 'PHP_ROUND_HALF_EVEN':
          // rouds .5 towards the next even integer
            value = f + (f % 2 * sgn)
            break
          case 'PHP_ROUND_HALF_ODD':
          // rounds .5 towards the next odd integer
            value = f + !(f % 2)
            break
          default:
          // rounds .5 away from zero
            value = f + (sgn > 0)
        }
      }
    
      return (isHalf ? value : Math.round(value)) / m
    }
  );

  $php.context.function.declare(
    '\\sin', [
      {"name":"arg","type":"float"}
    ],
    'float', function sin(arg) {
      //  discuss at: http://locutus.io/php/sin/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: Math.ceil(sin(8723321.4) * 10000000)
      //   returns 1: -9834330
    
      return Math.sin(arg)
    }
  );

  $php.context.function.declare(
    '\\sinh', [
      {"name":"arg","type":"float"}
    ],
    'float', function sinh(arg) {
      //  discuss at: http://locutus.io/php/sinh/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: sinh(-0.9834330348825909)
      //   returns 1: -1.1497971402636502
    
      return (Math.exp(arg) - Math.exp(-arg)) / 2
    }
  );

  $php.context.function.declare(
    '\\sqrt', [
      {"name":"arg","type":"float"}
    ],
    'float', function sqrt(arg) {
      //  discuss at: http://locutus.io/php/sqrt/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: sqrt(8723321.4)
      //   returns 1: 2953.5269424875746
    
      return Math.sqrt(arg)
    }
  );

  $php.context.function.declare(
    '\\tan', [
      {"name":"arg","type":"float"}
    ],
    'float', function tan(arg) {
      //  discuss at: http://locutus.io/php/tan/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: Math.ceil(tan(8723321.4) * 10000000)
      //   returns 1: 54251849
    
      return Math.tan(arg)
    }
  );

  $php.context.function.declare(
    '\\tanh', [
      {"name":"arg","type":"float"}
    ],
    'float', function tanh(arg) {
      //  discuss at: http://locutus.io/php/tanh/
      // original by: Onno Marsman (https://twitter.com/onnomarsman)
      // imprived by: Robert Eisele (http://www.xarg.org/)
      //   example 1: tanh(5.4251848798444815)
      //   returns 1: 0.9999612058841574
    
      return 1 - 2 / (Math.exp(2 * arg) + 1)
    }
  );

};