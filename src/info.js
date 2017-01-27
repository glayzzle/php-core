/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\assert_options', [
      {"name":"what","type":"int"},
      {"name":"value","type":"mixed"}
    ],
    'mixed', function assert_options(what, value) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/assert_options/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: assert_options('ASSERT_CALLBACK')
      //   returns 1: null
    
      var iniKey, defaultVal
      switch (what) {
        case 'ASSERT_ACTIVE':
          iniKey = 'assert.active'
          defaultVal = 1
          break
        case 'ASSERT_WARNING':
          iniKey = 'assert.warning'
          defaultVal = 1
          var msg = 'We have not yet implemented warnings for us to throw '
          msg += 'in JavaScript (assert_options())'
          throw new Error(msg)
        case 'ASSERT_BAIL':
          iniKey = 'assert.bail'
          defaultVal = 0
          break
        case 'ASSERT_QUIET_EVAL':
          iniKey = 'assert.quiet_eval'
          defaultVal = 0
          break
        case 'ASSERT_CALLBACK':
          iniKey = 'assert.callback'
          defaultVal = null
          break
        default:
          throw new Error('Improper type for assert_options()')
      }
    
      // I presume this is to be the most recent value, instead of the default value
      var iniVal = (typeof require !== 'undefined' ? require('../info/ini_get')(iniKey) : undefined) || defaultVal
    
      return iniVal
    }
  );

  $php.context.function.declare(
    '\\getenv', [
      {"name":"varname","type":"string"}
    ],
    'string|array|false', function getenv(varname) {
      //  discuss at: http://locutus.io/php/getenv/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: getenv('LC_ALL')
      //   returns 1: false
    
      if (typeof process !== 'undefined' || !process.env || !process.env[varname]) {
        return false
      }
    
      return process.env[varname]
    }
  );

  $php.context.function.declare(
    '\\ini_get', [
      {"name":"varname","type":"string"}
    ],
    'string', function ini_get(varname) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/ini_get/
      // original by: Brett Zamir (http://brett-zamir.me)
      //      note 1: The ini values must be set by ini_set or manually within an ini file
      //   example 1: ini_set('date.timezone', 'Asia/Hong_Kong')
      //   example 1: ini_get('date.timezone')
      //   returns 1: 'Asia/Hong_Kong'
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
      $locutus.php.ini = $locutus.php.ini || {}
    
      if ($locutus.php.ini[varname] && $locutus.php.ini[varname].local_value !== undefined) {
        if ($locutus.php.ini[varname].local_value === null) {
          return ''
        }
        return $locutus.php.ini[varname].local_value
      }
    
      return ''
    }
  );

  $php.context.function.declare(
    '\\ini_set', [
      {"name":"varname","type":"string"},
      {"name":"newvalue","type":"string"}
    ],
    'string', function ini_set(varname, newvalue) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/ini_set/
      // original by: Brett Zamir (http://brett-zamir.me)
      //      note 1: This will not set a global_value or access level for the ini item
      //   example 1: ini_set('date.timezone', 'Asia/Hong_Kong')
      //   example 1: ini_set('date.timezone', 'America/Chicago')
      //   returns 1: 'Asia/Hong_Kong'
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
      $locutus.php.ini = $locutus.php.ini || {}
    
      $locutus.php.ini = $locutus.php.ini || {}
      $locutus.php.ini[varname] = $locutus.php.ini[varname] || {}
    
      var oldval = $locutus.php.ini[varname].local_value
    
      var lowerStr = (newvalue + '').toLowerCase().trim()
      if (newvalue === true || lowerStr === 'on' || lowerStr === '1') {
        newvalue = 'on'
      }
      if (newvalue === false || lowerStr === 'off' || lowerStr === '0') {
        newvalue = 'off'
      }
    
      var _setArr = function (oldval) {
        // Although these are set individually, they are all accumulated
        if (typeof oldval === 'undefined') {
          $locutus.ini[varname].local_value = []
        }
        $locutus.ini[varname].local_value.push(newvalue)
      }
    
      switch (varname) {
        case 'extension':
          _setArr(oldval, newvalue)
          break
        default:
          $locutus.php.ini[varname].local_value = newvalue
          break
      }
    
      return oldval
    }
  );

  $php.context.function.declare(
    '\\set_time_limit', [
      {"name":"seconds","type":"int"}
    ],
    'bool', function set_time_limit(seconds) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/set_time_limit/
      // original by: Brett Zamir (http://brett-zamir.me)
      //        test: skip-all
      //   example 1: set_time_limit(4)
      //   returns 1: undefined
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      setTimeout(function () {
        if (!$locutus.php.timeoutStatus) {
          $locutus.php.timeoutStatus = true
        }
        throw new Error('Maximum execution time exceeded')
      }, seconds * 1000)
    }
  );

  $php.context.function.declare(
    '\\version_compare', [
      {"name":"version1","type":"string"},
      {"name":"version2","type":"string"},
      {"name":"operator","type":"string"}
    ],
    'mixed', function version_compare(v1, v2, operator) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/version_compare/
      //      original by: Philippe Jausions (http://pear.php.net/user/jausions)
      //      original by: Aidan Lister (http://aidanlister.com/)
      // reimplemented by: Kankrelune (http://www.webfaktory.info/)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //      improved by: Scott Baker
      //      improved by: Theriault (https://github.com/Theriault)
      //        example 1: version_compare('8.2.5rc', '8.2.5a')
      //        returns 1: 1
      //        example 2: version_compare('8.2.50', '8.2.52', '<')
      //        returns 2: true
      //        example 3: version_compare('5.3.0-dev', '5.3.0')
      //        returns 3: -1
      //        example 4: version_compare('4.1.0.52','4.01.0.51')
      //        returns 4: 1
    
      // Important: compare must be initialized at 0.
      var i
      var x
      var compare = 0
    
      // vm maps textual PHP versions to negatives so they're less than 0.
      // PHP currently defines these as CASE-SENSITIVE. It is important to
      // leave these as negatives so that they can come before numerical versions
      // and as if no letters were there to begin with.
      // (1alpha is < 1 and < 1.1 but > 1dev1)
      // If a non-numerical value can't be mapped to this table, it receives
      // -7 as its value.
      var vm = {
        'dev': -6,
        'alpha': -5,
        'a': -5,
        'beta': -4,
        'b': -4,
        'RC': -3,
        'rc': -3,
        '#': -2,
        'p': 1,
        'pl': 1
      }
    
      // This function will be called to prepare each version argument.
      // It replaces every _, -, and + with a dot.
      // It surrounds any nonsequence of numbers/dots with dots.
      // It replaces sequences of dots with a single dot.
      //    version_compare('4..0', '4.0') === 0
      // Important: A string of 0 length needs to be converted into a value
      // even less than an unexisting value in vm (-7), hence [-8].
      // It's also important to not strip spaces because of this.
      //   version_compare('', ' ') === 1
      var _prepVersion = function (v) {
        v = ('' + v).replace(/[_\-+]/g, '.')
        v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.')
        return (!v.length ? [-8] : v.split('.'))
      }
      // This converts a version component to a number.
      // Empty component becomes 0.
      // Non-numerical component becomes a negative number.
      // Numerical component becomes itself as an integer.
      var _numVersion = function (v) {
        return !v ? 0 : (isNaN(v) ? vm[v] || -7 : parseInt(v, 10))
      }
    
      v1 = _prepVersion(v1)
      v2 = _prepVersion(v2)
      x = Math.max(v1.length, v2.length)
      for (i = 0; i < x; i++) {
        if (v1[i] === v2[i]) {
          continue
        }
        v1[i] = _numVersion(v1[i])
        v2[i] = _numVersion(v2[i])
        if (v1[i] < v2[i]) {
          compare = -1
          break
        } else if (v1[i] > v2[i]) {
          compare = 1
          break
        }
      }
      if (!operator) {
        return compare
      }
    
      // Important: operator is CASE-SENSITIVE.
      // "No operator" seems to be treated as "<."
      // Any other values seem to make the function return null.
      switch (operator) {
        case '>':
        case 'gt':
          return (compare > 0)
        case '>=':
        case 'ge':
          return (compare >= 0)
        case '<=':
        case 'le':
          return (compare <= 0)
        case '===':
        case '=':
        case 'eq':
          return (compare === 0)
        case '<>':
        case '!==':
        case 'ne':
          return (compare !== 0)
        case '':
        case '<':
        case 'lt':
          return (compare < 0)
        default:
          return null
      }
    }
  );

};