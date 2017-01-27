/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\base64_decode', [
      {"name":"data","type":"string"},
      {"name":"strict","type":"bool"}
    ],
    'string', function base64_decode(encodedData) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/base64_decode/
      // original by: Tyler Akins (http://rumkin.com)
      // improved by: Thunder.m
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Aman Gupta
      //    input by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Pellentesque Malesuada
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==')
      //   returns 1: 'Kevin van Zonneveld'
      //   example 2: base64_decode('YQ==')
      //   returns 2: 'a'
      //   example 3: base64_decode('4pyTIMOgIGxhIG1vZGU=')
      //   returns 3: '✓ à la mode'
    
      if (typeof window !== 'undefined') {
        if (typeof window.atob !== 'undefined') {
          return decodeURIComponent(escape(window.atob(encodedData)))
        }
      } else {
        return new Buffer(encodedData, 'base64').toString('utf-8')
      }
    
      var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var o1
      var o2
      var o3
      var h1
      var h2
      var h3
      var h4
      var bits
      var i = 0
      var ac = 0
      var dec = ''
      var tmpArr = []
    
      if (!encodedData) {
        return encodedData
      }
    
      encodedData += ''
    
      do {
        // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(encodedData.charAt(i++))
        h2 = b64.indexOf(encodedData.charAt(i++))
        h3 = b64.indexOf(encodedData.charAt(i++))
        h4 = b64.indexOf(encodedData.charAt(i++))
    
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4
    
        o1 = bits >> 16 & 0xff
        o2 = bits >> 8 & 0xff
        o3 = bits & 0xff
    
        if (h3 === 64) {
          tmpArr[ac++] = String.fromCharCode(o1)
        } else if (h4 === 64) {
          tmpArr[ac++] = String.fromCharCode(o1, o2)
        } else {
          tmpArr[ac++] = String.fromCharCode(o1, o2, o3)
        }
      } while (i < encodedData.length)
    
      dec = tmpArr.join('')
    
      return decodeURIComponent(escape(dec.replace(/\0+$/, '')))
    }
  );

  $php.context.function.declare(
    '\\base64_encode', [
      {"name":"data","type":"string"}
    ],
    'string', function base64_encode(stringToEncode) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/base64_encode/
      // original by: Tyler Akins (http://rumkin.com)
      // improved by: Bayron Guevara
      // improved by: Thunder.m
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Rafał Kukawski (http://blog.kukawski.pl)
      // bugfixed by: Pellentesque Malesuada
      //   example 1: base64_encode('Kevin van Zonneveld')
      //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
      //   example 2: base64_encode('a')
      //   returns 2: 'YQ=='
      //   example 3: base64_encode('✓ à la mode')
      //   returns 3: '4pyTIMOgIGxhIG1vZGU='
    
      if (typeof window !== 'undefined') {
        if (typeof window.btoa !== 'undefined') {
          return window.btoa(unescape(encodeURIComponent(stringToEncode)))
        }
      } else {
        return new Buffer(stringToEncode).toString('base64')
      }
    
      var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var o1
      var o2
      var o3
      var h1
      var h2
      var h3
      var h4
      var bits
      var i = 0
      var ac = 0
      var enc = ''
      var tmpArr = []
    
      if (!stringToEncode) {
        return stringToEncode
      }
    
      stringToEncode = unescape(encodeURIComponent(stringToEncode))
    
      do {
        // pack three octets into four hexets
        o1 = stringToEncode.charCodeAt(i++)
        o2 = stringToEncode.charCodeAt(i++)
        o3 = stringToEncode.charCodeAt(i++)
    
        bits = o1 << 16 | o2 << 8 | o3
    
        h1 = bits >> 18 & 0x3f
        h2 = bits >> 12 & 0x3f
        h3 = bits >> 6 & 0x3f
        h4 = bits & 0x3f
    
        // use hexets to index into b64, and append result to encoded string
        tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
      } while (i < stringToEncode.length)
    
      enc = tmpArr.join('')
    
      var r = stringToEncode.length % 3
    
      return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
    }
  );

  $php.context.function.declare(
    '\\http_build_query', [
      {"name":"query_data","type":"mixed"},
      {"name":"numeric_prefix","type":"string"},
      {"name":"arg_separator","type":"string"},
      {"name":"enc_type","type":"int"}
    ],
    'string', function http_build_query(formdata, numericPrefix, argSeparator) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/http_build_query/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Legaev Andrey
      // improved by: Michael White (http://getsprink.com)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //  revised by: stag019
      //    input by: Dreamer
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
      //      note 1: If the value is null, key and value are skipped in the
      //      note 1: http_build_query of PHP while in locutus they are not.
      //   example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;')
      //   returns 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
      //   example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_')
      //   returns 2: 'myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&php=hypertext+processor&cow=milk'
    
      var urlencode = require('../url/urlencode')
    
      var value
      var key
      var tmp = []
    
      var _httpBuildQueryHelper = function (key, val, argSeparator) {
        var k
        var tmp = []
        if (val === true) {
          val = '1'
        } else if (val === false) {
          val = '0'
        }
        if (val !== null) {
          if (typeof val === 'object') {
            for (k in val) {
              if (val[k] !== null) {
                tmp.push(_httpBuildQueryHelper(key + '[' + k + ']', val[k], argSeparator))
              }
            }
            return tmp.join(argSeparator)
          } else if (typeof val !== 'function') {
            return urlencode(key) + '=' + urlencode(val)
          } else {
            throw new Error('There was an error processing for http_build_query().')
          }
        } else {
          return ''
        }
      }
    
      if (!argSeparator) {
        argSeparator = '&'
      }
      for (key in formdata) {
        value = formdata[key]
        if (numericPrefix && !isNaN(key)) {
          key = String(numericPrefix) + key
        }
        var query = _httpBuildQueryHelper(key, value, argSeparator)
        if (query !== '') {
          tmp.push(query)
        }
      }
    
      return tmp.join(argSeparator)
    }
  );

  $php.context.function.declare(
    '\\parse_url', [
      {"name":"url","type":"string"},
      {"name":"component","type":"int"}
    ],
    'mixed', function parse_url(str, component) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/parse_url/
      //      original by: Steven Levithan (http://blog.stevenlevithan.com)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //         input by: Lorenzo Pisani
      //         input by: Tony
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //           note 1: original by http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
      //           note 1: blog post at http://blog.stevenlevithan.com/archives/parseuri
      //           note 1: demo at http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
      //           note 1: Does not replace invalid characters with '_' as in PHP,
      //           note 1: nor does it return false with
      //           note 1: a seriously malformed URL.
      //           note 1: Besides function name, is essentially the same as parseUri as
      //           note 1: well as our allowing
      //           note 1: an extra slash after the scheme/protocol (to allow file:/// as in PHP)
      //        example 1: parse_url('http://user:pass@host/path?a=v#a')
      //        returns 1: {scheme: 'http', host: 'host', user: 'user', pass: 'pass', path: '/path', query: 'a=v', fragment: 'a'}
      //        example 2: parse_url('http://en.wikipedia.org/wiki/%22@%22_%28album%29')
      //        returns 2: {scheme: 'http', host: 'en.wikipedia.org', path: '/wiki/%22@%22_%28album%29'}
      //        example 3: parse_url('https://host.domain.tld/a@b.c/folder')
      //        returns 3: {scheme: 'https', host: 'host.domain.tld', path: '/a@b.c/folder'}
      //        example 4: parse_url('https://gooduser:secretpassword@www.example.com/a@b.c/folder?foo=bar')
      //        returns 4: { scheme: 'https', host: 'www.example.com', path: '/a@b.c/folder', query: 'foo=bar', user: 'gooduser', pass: 'secretpassword' }
    
      var query
    
      var mode = (typeof require !== 'undefined' ? require('../info/ini_get')('locutus.parse_url.mode') : undefined) || 'php'
    
      var key = [
        'source',
        'scheme',
        'authority',
        'userInfo',
        'user',
        'pass',
        'host',
        'port',
        'relative',
        'path',
        'directory',
        'file',
        'query',
        'fragment'
      ]
    
      // For loose we added one optional slash to post-scheme to catch file:/// (should restrict this)
      var parser = {
        php: new RegExp([
          '(?:([^:\\/?#]+):)?',
          '(?:\\/\\/()(?:(?:()(?:([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?))?',
          '()',
          '(?:(()(?:(?:[^?#\\/]*\\/)*)()(?:[^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'
        ].join('')),
        strict: new RegExp([
          '(?:([^:\\/?#]+):)?',
          '(?:\\/\\/((?:(([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?))?',
          '((((?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)'
        ].join('')),
        loose: new RegExp([
          '(?:(?![^:@]+:[^:@\\/]*@)([^:\\/?#.]+):)?',
          '(?:\\/\\/\\/?)?',
          '((?:(([^:@\\/]*):?([^:@\\/]*))?@)?([^:\\/?#]*)(?::(\\d*))?)',
          '(((\\/(?:[^?#](?![^?#\\/]*\\.[^?#\\/.]+(?:[?#]|$)))*\\/?)?([^?#\\/]*))',
          '(?:\\?([^#]*))?(?:#(.*))?)'
        ].join(''))
      }
    
      var m = parser[mode].exec(str)
      var uri = {}
      var i = 14
    
      while (i--) {
        if (m[i]) {
          uri[key[i]] = m[i]
        }
      }
    
      if (component) {
        return uri[component.replace('PHP_URL_', '').toLowerCase()]
      }
    
      if (mode !== 'php') {
        var name = (typeof require !== 'undefined' ? require('../info/ini_get')('locutus.parse_url.queryKey') : undefined) || 'queryKey'
        parser = /(?:^|&)([^&=]*)=?([^&]*)/g
        uri[name] = {}
        query = uri[key[12]] || ''
        query.replace(parser, function ($0, $1, $2) {
          if ($1) {
            uri[name][$1] = $2
          }
        })
      }
    
      delete uri.source
      return uri
    }
  );

  $php.context.function.declare(
    '\\rawurldecode', [
      {"name":"str","type":"string"}
    ],
    'string', function rawurldecode(str) {
      //       discuss at: http://locutus.io/php/rawurldecode/
      //      original by: Brett Zamir (http://brett-zamir.me)
      //         input by: travc
      //         input by: Brett Zamir (http://brett-zamir.me)
      //         input by: Ratheous
      //         input by: lovio
      //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //           note 1: Please be aware that this function expects to decode
      //           note 1: from UTF-8 encoded strings, as found on
      //           note 1: pages served as UTF-8
      //        example 1: rawurldecode('Kevin+van+Zonneveld%21')
      //        returns 1: 'Kevin+van+Zonneveld!'
      //        example 2: rawurldecode('http%3A%2F%2Fkvz.io%2F')
      //        returns 2: 'http://kvz.io/'
      //        example 3: rawurldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3D')
      //        returns 3: 'http://www.google.nl/search?q=Locutus&ie='
    
      return decodeURIComponent((str + '')
        .replace(/%(?![\da-f]{2})/gi, function () {
          // PHP tolerates poorly formed escape sequences
          return '%25'
        }))
    }
  );

  $php.context.function.declare(
    '\\rawurlencode', [
      {"name":"str","type":"string"}
    ],
    'string', function rawurlencode(str) {
      //       discuss at: http://locutus.io/php/rawurlencode/
      //      original by: Brett Zamir (http://brett-zamir.me)
      //         input by: travc
      //         input by: Brett Zamir (http://brett-zamir.me)
      //         input by: Michael Grier
      //         input by: Ratheous
      //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: Joris
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //           note 1: This reflects PHP 5.3/6.0+ behavior
      //           note 1: Please be aware that this function expects \
      //           note 1: to encode into UTF-8 encoded strings, as found on
      //           note 1: pages served as UTF-8
      //        example 1: rawurlencode('Kevin van Zonneveld!')
      //        returns 1: 'Kevin%20van%20Zonneveld%21'
      //        example 2: rawurlencode('http://kvz.io/')
      //        returns 2: 'http%3A%2F%2Fkvz.io%2F'
      //        example 3: rawurlencode('http://www.google.nl/search?q=Locutus&ie=utf-8')
      //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'
    
      str = (str + '')
    
      // Tilde should be allowed unescaped in future versions of PHP (as reflected below),
      // but if you want to reflect current
      // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
      return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
    }
  );

  $php.context.function.declare(
    '\\urldecode', [
      {"name":"str","type":"string"}
    ],
    'string', function urldecode(str) {
      //       discuss at: http://locutus.io/php/urldecode/
      //      original by: Philip Peterson
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //      improved by: Lars Fischer
      //      improved by: Orlando
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //         input by: AJ
      //         input by: travc
      //         input by: Brett Zamir (http://brett-zamir.me)
      //         input by: Ratheous
      //         input by: e-mike
      //         input by: lovio
      //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Rob
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //           note 1: info on what encoding functions to use from:
      //           note 1: http://xkr.us/articles/javascript/encode-compare/
      //           note 1: Please be aware that this function expects to decode
      //           note 1: from UTF-8 encoded strings, as found on
      //           note 1: pages served as UTF-8
      //        example 1: urldecode('Kevin+van+Zonneveld%21')
      //        returns 1: 'Kevin van Zonneveld!'
      //        example 2: urldecode('http%3A%2F%2Fkvz.io%2F')
      //        returns 2: 'http://kvz.io/'
      //        example 3: urldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a')
      //        returns 3: 'http://www.google.nl/search?q=Locutus&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'
      //        example 4: urldecode('%E5%A5%BD%3_4')
      //        returns 4: '\u597d%3_4'
    
      return decodeURIComponent((str + '')
        .replace(/%(?![\da-f]{2})/gi, function () {
          // PHP tolerates poorly formed escape sequences
          return '%25'
        })
        .replace(/\+/g, '%20'))
    }
  );

  $php.context.function.declare(
    '\\urlencode', [
      {"name":"str","type":"string"}
    ],
    'string', function urlencode(str) {
      //       discuss at: http://locutus.io/php/urlencode/
      //      original by: Philip Peterson
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //      improved by: Lars Fischer
      //         input by: AJ
      //         input by: travc
      //         input by: Brett Zamir (http://brett-zamir.me)
      //         input by: Ratheous
      //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Joris
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //           note 1: This reflects PHP 5.3/6.0+ behavior
      //           note 1: Please be aware that this function
      //           note 1: expects to encode into UTF-8 encoded strings, as found on
      //           note 1: pages served as UTF-8
      //        example 1: urlencode('Kevin van Zonneveld!')
      //        returns 1: 'Kevin+van+Zonneveld%21'
      //        example 2: urlencode('http://kvz.io/')
      //        returns 2: 'http%3A%2F%2Fkvz.io%2F'
      //        example 3: urlencode('http://www.google.nl/search?q=Locutus&ie=utf-8')
      //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'
    
      str = (str + '')
    
      // Tilde should be allowed unescaped in future versions of PHP (as reflected below),
      // but if you want to reflect current
      // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
      return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+')
    }
  );

};