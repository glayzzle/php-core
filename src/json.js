/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\json_decode', [
      {"name":"json","type":"string"},
      {"name":"assoc","type":"bool"},
      {"name":"depth","type":"int"},
      {"name":"options","type":"int"}
    ],
    'mixed', function json_decode(strJson) { // eslint-disable-line camelcase
      //       discuss at: http://phpjs.org/functions/json_decode/
      //      original by: Public Domain (http://www.json.org/json2.js)
      // reimplemented by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      //      improved by: T.J. Leahy
      //      improved by: Michael White
      //           note 1: If node or the browser does not offer JSON.parse,
      //           note 1: this function falls backslash
      //           note 1: to its own implementation using eval, and hence should be considered unsafe
      //        example 1: json_decode('[ 1 ]')
      //        returns 1: [1]
    
      /*
        http://www.JSON.org/json2.js
        2008-11-19
        Public Domain.
        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        See http://www.JSON.org/js.html
      */
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      var json = $global.JSON
      if (typeof json === 'object' && typeof json.parse === 'function') {
        try {
          return json.parse(strJson)
        } catch (err) {
          if (!(err instanceof SyntaxError)) {
            throw new Error('Unexpected error type in json_decode()')
          }
    
          // usable by json_last_error()
          $locutus.php.last_error_json = 4
          return null
        }
      }
    
      var chars = [
        '\u0000',
        '\u00ad',
        '\u0600-\u0604',
        '\u070f',
        '\u17b4',
        '\u17b5',
        '\u200c-\u200f',
        '\u2028-\u202f',
        '\u2060-\u206f',
        '\ufeff',
        '\ufff0-\uffff'
      ].join('')
      var cx = new RegExp('[' + chars + ']', 'g')
      var j
      var text = strJson
    
      // Parsing happens in four stages. In the first stage, we replace certain
      // Unicode characters with escape sequences. JavaScript handles many characters
      // incorrectly, either silently deleting them, or treating them as line endings.
      cx.lastIndex = 0
      if (cx.test(text)) {
        text = text.replace(cx, function (a) {
          return '\\u' + ('0000' + a.charCodeAt(0)
            .toString(16))
            .slice(-4)
        })
      }
    
      // In the second stage, we run the text against regular expressions that look
      // for non-JSON patterns. We are especially concerned with '()' and 'new'
      // because they can cause invocation, and '=' because it can cause mutation.
      // But just to be safe, we want to reject all unexpected forms.
      // We split the second stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
      // replace all simple value tokens with ']' characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or ']' or
      // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
    
      var m = (/^[\],:{}\s]*$/)
        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
    
      if (m) {
        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.
        j = eval('(' + text + ')') // eslint-disable-line no-eval
        return j
      }
    
      // usable by json_last_error()
      $locutus.php.last_error_json = 4
      return null
    }
  );

  $php.context.function.declare(
    '\\json_encode', [
      {"name":"value","type":"mixed"},
      {"name":"options","type":"int"},
      {"name":"depth","type":"int"}
    ],
    'string', function json_encode(mixedVal) { // eslint-disable-line camelcase
      //       discuss at: http://phpjs.org/functions/json_encode/
      //      original by: Public Domain (http://www.json.org/json2.js)
      // reimplemented by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      //      improved by: Michael White
      //         input by: felix
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //        example 1: json_encode('Kevin')
      //        returns 1: '"Kevin"'
    
      /*
        http://www.JSON.org/json2.js
        2008-11-19
        Public Domain.
        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        See http://www.JSON.org/js.html
      */
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      var json = $global.JSON
      var retVal
      try {
        if (typeof json === 'object' && typeof json.stringify === 'function') {
          // Errors will not be caught here if our own equivalent to resource
          retVal = json.stringify(mixedVal)
          if (retVal === undefined) {
            throw new SyntaxError('json_encode')
          }
          return retVal
        }
    
        var value = mixedVal
    
        var quote = function (string) {
          var escapeChars = [
            '\u0000-\u001f',
            '\u007f-\u009f',
            '\u00ad',
            '\u0600-\u0604',
            '\u070f',
            '\u17b4',
            '\u17b5',
            '\u200c-\u200f',
            '\u2028-\u202f',
            '\u2060-\u206f',
            '\ufeff',
            '\ufff0-\uffff'
          ].join('')
          var escapable = new RegExp('[\\"' + escapeChars + ']', 'g')
          var meta = {
            // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
          }
    
          escapable.lastIndex = 0
          return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a]
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0)
              .toString(16))
              .slice(-4)
          }) + '"' : '"' + string + '"'
        }
    
        var _str = function (key, holder) {
          var gap = ''
          var indent = '    '
          // The loop counter.
          var i = 0
          // The member key.
          var k = ''
          // The member value.
          var v = ''
          var length = 0
          var mind = gap
          var partial = []
          var value = holder[key]
    
          // If the value has a toJSON method, call it to obtain a replacement value.
          if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key)
          }
    
          // What happens next depends on the value's type.
          switch (typeof value) {
            case 'string':
              return quote(value)
    
            case 'number':
              // JSON numbers must be finite. Encode non-finite numbers as null.
              return isFinite(value) ? String(value) : 'null'
    
            case 'boolean':
            case 'null':
              // If the value is a boolean or null, convert it to a string. Note:
              // typeof null does not produce 'null'. The case is included here in
              // the remote chance that this gets fixed someday.
              return String(value)
    
            case 'object':
              // If the type is 'object', we might be dealing with an object or an array or
              // null.
              // Due to a specification blunder in ECMAScript, typeof null is 'object',
              // so watch out for that case.
              if (!value) {
                return 'null'
              }
    
              // Make an array to hold the partial results of stringifying this object value.
              gap += indent
              partial = []
    
              // Is the value an array?
              if (Object.prototype.toString.apply(value) === '[object Array]') {
                // The value is an array. Stringify every element. Use null as a placeholder
                // for non-JSON values.
                length = value.length
                for (i = 0; i < length; i += 1) {
                  partial[i] = _str(i, value) || 'null'
                }
    
                // Join all of the elements together, separated with commas, and wrap them in
                // brackets.
                v = partial.length === 0 ? '[]' : gap
                  ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                  : '[' + partial.join(',') + ']'
                gap = mind
                return v
              }
    
              // Iterate through all of the keys in the object.
              for (k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                  v = _str(k, value)
                  if (v) {
                    partial.push(quote(k) + (gap ? ': ' : ':') + v)
                  }
                }
              }
    
              // Join all of the member texts together, separated with commas,
              // and wrap them in braces.
              v = partial.length === 0 ? '{}' : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}'
              gap = mind
              return v
            case 'undefined':
            case 'function':
            default:
              throw new SyntaxError('json_encode')
          }
        }
    
        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.
        return _str('', {
          '': value
        })
      } catch (err) {
        // @todo: ensure error handling above throws a SyntaxError in all cases where it could
        // (i.e., when the JSON global is not available and there is an error)
        if (!(err instanceof SyntaxError)) {
          throw new Error('Unexpected error type in json_encode()')
        }
        // usable by json_last_error()
        $locutus.php.last_error_json = 4
        return null
      }
    }
  );

  $php.context.function.declare(
    '\\json_last_error', [],
    'int', function json_last_error() { // eslint-disable-line camelcase
      //  discuss at: http://phpjs.org/functions/json_last_error/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: json_last_error()
      //   returns 1: 0
    
      // JSON_ERROR_NONE = 0
      // max depth limit to be removed per PHP comments in json.c (not possible in JS?):
      // JSON_ERROR_DEPTH = 1
      // internal use? also not documented:
      // JSON_ERROR_STATE_MISMATCH = 2
      // [\u0000-\u0008\u000B-\u000C\u000E-\u001F] if used directly within json_decode():
      // JSON_ERROR_CTRL_CHAR = 3
      // but JSON functions auto-escape these, so error not possible in JavaScript
      // JSON_ERROR_SYNTAX = 4
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      return $locutus.php && $locutus.php.last_error_json ? $locutus.php.last_error_json : 0
    }
  );

};