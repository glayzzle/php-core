/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\basename', [
      {"name":"path","type":"string"},
      {"name":"suffix","type":"string"}
    ],
    'string', function basename(path, suffix) {
      //  discuss at: http://locutus.io/php/basename/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Ash Searle (http://hexmen.com/blog/)
      // improved by: Lincoln Ramsay
      // improved by: djmix
      // improved by: Dmitry Gorelenkov
      //   example 1: basename('/www/site/home.htm', '.htm')
      //   returns 1: 'home'
      //   example 2: basename('ecra.php?p=1')
      //   returns 2: 'ecra.php?p=1'
      //   example 3: basename('/some/path/')
      //   returns 3: 'path'
      //   example 4: basename('/some/path_ext.ext/','.ext')
      //   returns 4: 'path_ext'
    
      var b = path
      var lastChar = b.charAt(b.length - 1)
    
      if (lastChar === '/' || lastChar === '\\') {
        b = b.slice(0, -1)
      }
    
      b = b.replace(/^.*[\/\\]/g, '')
    
      if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
        b = b.substr(0, b.length - suffix.length)
      }
    
      return b
    }
  );

  $php.context.function.declare(
    '\\dirname', [
      {"name":"path","type":"string"},
      {"name":"levels","type":"int"}
    ],
    'string', function dirname(path) {
      //  discuss at: http://locutus.io/php/dirname/
      // original by: Ozh
      // improved by: XoraX (http://www.xorax.info)
      //   example 1: dirname('/etc/passwd')
      //   returns 1: '/etc'
      //   example 2: dirname('c:/Temp/x')
      //   returns 2: 'c:/Temp'
      //   example 3: dirname('/dir/test/')
      //   returns 3: '/dir'
    
      return path.replace(/\\/g, '/')
        .replace(/\/[^\/]*\/?$/, '')
    }
  );

  $php.context.function.declare(
    '\\file_get_contents', [
      {"name":"filename","type":"string"},
      {"name":"flags","type":"int"},
      {"name":"context","type":"resource"},
      {"name":"offset","type":"mixed"},
      {"name":"maxlen","type":"mixed"}
    ],
    'mixed', function file_get_contents(url, flags, context, offset, maxLen) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/file_get_contents/
      //      original by: Legaev Andrey
      //         input by: Jani Hartikainen
      //         input by: Raphael (Ao) RUDLER
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      // reimplemented by: Kevin van Zonneveld (http://kvz.io)
      //           note 1: This used to work in the browser via blocking ajax
      //           note 1: requests in 1.3.2 and earlier
      //           note 1: but then people started using that for real app,
      //           note 1: so we deprecated this behavior,
      //           note 1: so this function is now Node-only
      //        example 1: var $buf = file_get_contents('test/never-change.txt')
      //        example 1: var $result = $buf.indexOf('hash') !== -1
      //        returns 1: true
    
      var fs = require('fs')
    
      return fs.readFileSync(url, 'utf-8')
    }
  );

  $php.context.function.declare(
    '\\pathinfo', [
      {"name":"path","type":"string"},
      {"name":"options","type":"int"}
    ],
    'mixed', function pathinfo(path, options) {
      //  discuss at: http://locutus.io/php/pathinfo/
      // original by: Nate
      //  revised by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Dmitry Gorelenkov
      //    input by: Timo
      //      note 1: Inspired by actual PHP source: php5-5.2.6/ext/standard/string.c line #1559
      //      note 1: The way the bitwise arguments are handled allows for greater flexibility
      //      note 1: & compatability. We might even standardize this
      //      note 1: code and use a similar approach for
      //      note 1: other bitwise PHP functions
      //      note 1: Locutus tries very hard to stay away from a core.js
      //      note 1: file with global dependencies, because we like
      //      note 1: that you can just take a couple of functions and be on your way.
      //      note 1: But by way we implemented this function,
      //      note 1: if you want you can still declare the PATHINFO_*
      //      note 1: yourself, and then you can use:
      //      note 1: pathinfo('/www/index.html', PATHINFO_BASENAME | PATHINFO_EXTENSION);
      //      note 1: which makes it fully compliant with PHP syntax.
      //   example 1: pathinfo('/www/htdocs/index.html', 1)
      //   returns 1: '/www/htdocs'
      //   example 2: pathinfo('/www/htdocs/index.html', 'PATHINFO_BASENAME')
      //   returns 2: 'index.html'
      //   example 3: pathinfo('/www/htdocs/index.html', 'PATHINFO_EXTENSION')
      //   returns 3: 'html'
      //   example 4: pathinfo('/www/htdocs/index.html', 'PATHINFO_FILENAME')
      //   returns 4: 'index'
      //   example 5: pathinfo('/www/htdocs/index.html', 2 | 4)
      //   returns 5: {basename: 'index.html', extension: 'html'}
      //   example 6: pathinfo('/www/htdocs/index.html', 'PATHINFO_ALL')
      //   returns 6: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
      //   example 7: pathinfo('/www/htdocs/index.html')
      //   returns 7: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
    
      var basename = require('../filesystem/basename')
      var opt = ''
      var realOpt = ''
      var optName = ''
      var optTemp = 0
      var tmpArr = {}
      var cnt = 0
      var i = 0
      var haveBasename = false
      var haveExtension = false
      var haveFilename = false
    
      // Input defaulting & sanitation
      if (!path) {
        return false
      }
      if (!options) {
        options = 'PATHINFO_ALL'
      }
    
      // Initialize binary arguments. Both the string & integer (constant) input is
      // allowed
      var OPTS = {
        'PATHINFO_DIRNAME': 1,
        'PATHINFO_BASENAME': 2,
        'PATHINFO_EXTENSION': 4,
        'PATHINFO_FILENAME': 8,
        'PATHINFO_ALL': 0
      }
      // PATHINFO_ALL sums up all previously defined PATHINFOs (could just pre-calculate)
      for (optName in OPTS) {
        if (OPTS.hasOwnProperty(optName)) {
          OPTS.PATHINFO_ALL = OPTS.PATHINFO_ALL | OPTS[optName]
        }
      }
      if (typeof options !== 'number') {
        // Allow for a single string or an array of string flags
        options = [].concat(options)
        for (i = 0; i < options.length; i++) {
          // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
          if (OPTS[options[i]]) {
            optTemp = optTemp | OPTS[options[i]]
          }
        }
        options = optTemp
      }
    
      // Internal Functions
      var _getExt = function (path) {
        var str = path + ''
        var dotP = str.lastIndexOf('.') + 1
        return !dotP ? false : dotP !== str.length ? str.substr(dotP) : ''
      }
    
      // Gather path infos
      if (options & OPTS.PATHINFO_DIRNAME) {
        var dirName = path
          .replace(/\\/g, '/')
          .replace(/\/[^\/]*\/?$/, '') // dirname
        tmpArr.dirname = dirName === path ? '.' : dirName
      }
    
      if (options & OPTS.PATHINFO_BASENAME) {
        if (haveBasename === false) {
          haveBasename = basename(path)
        }
        tmpArr.basename = haveBasename
      }
    
      if (options & OPTS.PATHINFO_EXTENSION) {
        if (haveBasename === false) {
          haveBasename = basename(path)
        }
        if (haveExtension === false) {
          haveExtension = _getExt(haveBasename)
        }
        if (haveExtension !== false) {
          tmpArr.extension = haveExtension
        }
      }
    
      if (options & OPTS.PATHINFO_FILENAME) {
        if (haveBasename === false) {
          haveBasename = basename(path)
        }
        if (haveExtension === false) {
          haveExtension = _getExt(haveBasename)
        }
        if (haveFilename === false) {
          haveFilename = haveBasename.slice(0, haveBasename.length - (haveExtension
            ? haveExtension.length + 1
            : haveExtension === false
              ? 0
              : 1
            )
          )
        }
    
        tmpArr.filename = haveFilename
      }
    
      // If array contains only 1 element: return string
      cnt = 0
      for (opt in tmpArr) {
        if (tmpArr.hasOwnProperty(opt)) {
          cnt++
          realOpt = opt
        }
      }
      if (cnt === 1) {
        return tmpArr[realOpt]
      }
    
      // Return full-blown array
      return tmpArr
    }
  );

  $php.context.function.declare(
    '\\realpath', [
      {"name":"path","type":"string"}
    ],
    'string', function realpath(path) {
      //  discuss at: http://locutus.io/php/realpath/
      // original by: mk.keck
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //      note 1: Returned path is an url like e.g. 'http://yourhost.tld/path/'
      //   example 1: realpath('some/dir/.././_supporters/pj_test_supportfile_1.htm')
      //   returns 1: 'some/_supporters/pj_test_supportfile_1.htm'
    
      if (typeof window === 'undefined') {
        var nodePath = require('path')
        return nodePath.normalize(path)
      }
    
      var p = 0
      var arr = [] // Save the root, if not given
      var r = this.window.location.href // Avoid input failures
    
      // Check if there's a port in path (like 'http://')
      path = (path + '').replace('\\', '/')
      if (path.indexOf('://') !== -1) {
        p = 1
      }
    
      // Ok, there's not a port in path, so let's take the root
      if (!p) {
        path = r.substring(0, r.lastIndexOf('/') + 1) + path
      }
    
      // Explode the given path into it's parts
      arr = path.split('/') // The path is an array now
      path = [] // Foreach part make a check
      for (var k in arr) { // This is'nt really interesting
        if (arr[k] === '.') {
          continue
        }
        // This reduces the realpath
        if (arr[k] === '..') {
          /* But only if there more than 3 parts in the path-array.
           * The first three parts are for the uri */
          if (path.length > 3) {
            path.pop()
          }
        } else {
          // This adds parts to the realpath
          // But only if the part is not empty or the uri
          // (the first three parts ar needed) was not
          // saved
          if ((path.length < 2) || (arr[k] !== '')) {
            path.push(arr[k])
          }
        }
      }
    
      // Returns the absloute path as a string
      return path.join('/')
    }
  );

};