/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\escapeshellarg', [
      {"name":"arg","type":"string"}
    ],
    'string', function escapeshellarg(arg) {
      //  discuss at: http://locutus.io/php/escapeshellarg/
      // original by: Felix Geisendoerfer (http://www.debuggable.com/felix)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: escapeshellarg("kevin's birthday")
      //   returns 1: "'kevin\\'s birthday'"
    
      var ret = ''
    
      ret = arg.replace(/[^\\]'/g, function (m, i, s) {
        return m.slice(0, 1) + '\\\''
      })
    
      return "'" + ret + "'"
    }
  );

};