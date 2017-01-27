/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\inet_ntop', [
      {"name":"in_addr","type":"string"}
    ],
    'string', function inet_ntop(a) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/inet_ntop/
      // original by: Theriault (https://github.com/Theriault)
      //   example 1: inet_ntop('\x7F\x00\x00\x01')
      //   returns 1: '127.0.0.1'
      //   _example 2: inet_ntop('\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\1')
      //   _returns 2: '::1'
    
      var i = 0
      var m = ''
      var c = []
    
      a += ''
      if (a.length === 4) {
        // IPv4
        return [
          a.charCodeAt(0),
          a.charCodeAt(1),
          a.charCodeAt(2),
          a.charCodeAt(3)
        ].join('.')
      } else if (a.length === 16) {
        // IPv6
        for (i = 0; i < 16; i++) {
          c.push(((a.charCodeAt(i++) << 8) + a.charCodeAt(i)).toString(16))
        }
        return c.join(':')
          .replace(/((^|:)0(?=:|$))+:?/g, function (t) {
            m = (t.length > m.length) ? t : m
            return t
          })
          .replace(m || ' ', '::')
      } else {
        // Invalid length
        return false
      }
    }
  );

  $php.context.function.declare(
    '\\inet_pton', [
      {"name":"address","type":"string"}
    ],
    'string', function inet_pton(a) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/inet_pton/
      // original by: Theriault (https://github.com/Theriault)
      //   example 1: inet_pton('::')
      //   returns 1: '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0'
      //   example 2: inet_pton('127.0.0.1')
      //   returns 2: '\x7F\x00\x00\x01'
    
      var r
      var m
      var x
      var i
      var j
      var f = String.fromCharCode
    
      // IPv4
      m = a.match(/^(?:\d{1,3}(?:\.|$)){4}/)
      if (m) {
        m = m[0].split('.')
        m = f(m[0]) + f(m[1]) + f(m[2]) + f(m[3])
        // Return if 4 bytes, otherwise false.
        return m.length === 4 ? m : false
      }
      r = /^((?:[\da-f]{1,4}(?::|)){0,8})(::)?((?:[\da-f]{1,4}(?::|)){0,8})$/
    
      // IPv6
      m = a.match(r)
      if (m) {
        // Translate each hexadecimal value.
        for (j = 1; j < 4; j++) {
          // Indice 2 is :: and if no length, continue.
          if (j === 2 || m[j].length === 0) {
            continue
          }
          m[j] = m[j].split(':')
          for (i = 0; i < m[j].length; i++) {
            m[j][i] = parseInt(m[j][i], 16)
            // Would be NaN if it was blank, return false.
            if (isNaN(m[j][i])) {
              // Invalid IP.
              return false
            }
            m[j][i] = f(m[j][i] >> 8) + f(m[j][i] & 0xFF)
          }
          m[j] = m[j].join('')
        }
        x = m[1].length + m[3].length
        if (x === 16) {
          return m[1] + m[3]
        } else if (x < 16 && m[2].length > 0) {
          return m[1] + (new Array(16 - x + 1))
            .join('\x00') + m[3]
        }
      }
    
      // Invalid IP
      return false
    }
  );

  $php.context.function.declare(
    '\\ip2long', [
      {"name":"ip_address","type":"string"}
    ],
    'int', function ip2long(argIP) {
      //  discuss at: http://locutus.io/php/ip2long/
      // original by: Waldo Malqui Silva (http://waldo.malqui.info)
      // improved by: Victor
      //  revised by: fearphage (http://http/my.opera.com/fearphage/)
      //  revised by: Theriault (https://github.com/Theriault)
      //    estarget: es2015
      //   example 1: ip2long('192.0.34.166')
      //   returns 1: 3221234342
      //   example 2: ip2long('0.0xABCDEF')
      //   returns 2: 11259375
      //   example 3: ip2long('255.255.255.256')
      //   returns 3: false
    
      let i = 0
      // PHP allows decimal, octal, and hexadecimal IP components.
      // PHP allows between 1 (e.g. 127) to 4 (e.g 127.0.0.1) components.
    
      const pattern = new RegExp([
        '^([1-9]\\d*|0[0-7]*|0x[\\da-f]+)',
        '(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
        '(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
        '(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?$'
      ].join(''), 'i')
    
      argIP = argIP.match(pattern) // Verify argIP format.
      if (!argIP) {
        // Invalid format.
        return false
      }
      // Reuse argIP variable for component counter.
      argIP[0] = 0
      for (i = 1; i < 5; i += 1) {
        argIP[0] += !!((argIP[i] || '').length)
        argIP[i] = parseInt(argIP[i]) || 0
      }
      // Continue to use argIP for overflow values.
      // PHP does not allow any component to overflow.
      argIP.push(256, 256, 256, 256)
      // Recalculate overflow of last component supplied to make up for missing components.
      argIP[4 + argIP[0]] *= Math.pow(256, 4 - argIP[0])
      if (argIP[1] >= argIP[5] ||
        argIP[2] >= argIP[6] ||
        argIP[3] >= argIP[7] ||
        argIP[4] >= argIP[8]) {
        return false
      }
    
      return argIP[1] * (argIP[0] === 1 || 16777216) +
        argIP[2] * (argIP[0] <= 2 || 65536) +
        argIP[3] * (argIP[0] <= 3 || 256) +
        argIP[4] * 1
    }
  );

  $php.context.function.declare(
    '\\long2ip', [
      {"name":"proper_address","type":"string|int"}
    ],
    'string', function long2ip(ip) {
      //  discuss at: http://locutus.io/php/long2ip/
      // original by: Waldo Malqui Silva (http://waldo.malqui.info)
      //   example 1: long2ip( 3221234342 )
      //   returns 1: '192.0.34.166'
    
      if (!isFinite(ip)) {
        return false
      }
    
      return [ip >>> 24, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.')
    }
  );

  $php.context.function.declare(
    '\\setcookie', [
      {"name":"name","type":"string"},
      {"name":"value","type":"string"},
      {"name":"expire","type":"int"},
      {"name":"path","type":"bool"},
      {"name":"domain","type":"mixed"},
      {"name":"secure","type":"mixed"},
      {"name":"httponly","type":"mixed"}
    ],
    'bool', function setcookie(name, value, expires, path, domain, secure) {
      //  discuss at: http://locutus.io/php/setcookie/
      // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // bugfixed by: Andreas
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: setcookie('author_name', 'Kevin van Zonneveld')
      //   returns 1: true
    
      var setrawcookie = require('../network/setrawcookie')
      return setrawcookie(name, encodeURIComponent(value), expires, path, domain, secure)
    }
  );

  $php.context.function.declare(
    '\\setrawcookie', [
      {"name":"name","type":"string"},
      {"name":"value","type":"string"},
      {"name":"expire","type":"int"},
      {"name":"path","type":"string"},
      {"name":"domain","type":"string"},
      {"name":"secure","type":"bool"},
      {"name":"httponly","type":"bool"}
    ],
    'bool', function setrawcookie(name, value, expires, path, domain, secure) {
      //  discuss at: http://locutus.io/php/setrawcookie/
      // original by: Brett Zamir (http://brett-zamir.me)
      // original by: setcookie
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Michael
      //      note 1: This function requires access to the `window` global and is Browser-only
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: setrawcookie('author_name', 'Kevin van Zonneveld')
      //   returns 1: true
    
      if (typeof window === 'undefined') {
        return true
      }
    
      if (typeof expires === 'string' && (/^\d+$/).test(expires)) {
        expires = parseInt(expires, 10)
      }
    
      if (expires instanceof Date) {
        expires = expires.toUTCString()
      } else if (typeof expires === 'number') {
        expires = (new Date(expires * 1e3)).toUTCString()
      }
    
      var r = [name + '=' + value]
      var i = ''
      var s = {
        expires: expires,
        path: path,
        domain: domain
      }
      for (i in s) {
        if (s.hasOwnProperty(i)) {
          // Exclude items on Object.prototype
          s[i] && r.push(i + '=' + s[i])
        }
      }
    
      if (secure) {
        r.push('secure')
      }
    
      window.document.cookie = r.join(';')
    
      return true
    }
  );

};