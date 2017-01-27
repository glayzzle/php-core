/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\call_user_func', [
      {"name":"function","type":"callback"},
      {"name":"parameter","type":"mixed"},
      {"name":"_","type":"mixed"}
    ],
    'mixed', function call_user_func(cb, parameters) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/call_user_func/
      // original by: Brett Zamir (http://brett-zamir.me)
      // improved by: Diplom@t (http://difane.com/)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //      note 1: Depends on call_user_func_array which in turn depends on the `cb` that is passed,
      //      note 1: this function can use `eval`.
      //      note 1: The `eval` input is however checked to only allow valid function names,
      //      note 1: So it should not be unsafer than uses without eval (seeing as you can)
      //      note 1: already pass any function to be executed here.
      //   example 1: call_user_func('isNaN', 'a')
      //   returns 1: true
    
      var callUserFuncArray = require('../funchand/call_user_func_array')
      parameters = Array.prototype.slice.call(arguments, 1)
      return callUserFuncArray(cb, parameters)
    }
  );

  $php.context.function.declare(
    '\\call_user_func_array', [
      {"name":"function","type":"callback"},
      {"name":"param_arr","type":"\\array"}
    ],
    'mixed', function call_user_func_array(cb, parameters) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/call_user_func_array/
      // original by: Thiago Mata (http://thiagomata.blog.com)
      //  revised by: Jon Hohle
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Diplom@t (http://difane.com/)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //      note 1: Depending on the `cb` that is passed,
      //      note 1: this function can use `eval` and/or `new Function`.
      //      note 1: The `eval` input is however checked to only allow valid function names,
      //      note 1: So it should not be unsafer than uses without eval (seeing as you can)
      //      note 1: already pass any function to be executed here.
      //   example 1: call_user_func_array('isNaN', ['a'])
      //   returns 1: true
      //   example 2: call_user_func_array('isNaN', [1])
      //   returns 2: false
    
      var $global = (typeof window !== 'undefined' ? window : global)
      var func
      var scope = null
    
      var validJSFunctionNamePattern = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/
    
      if (typeof cb === 'string') {
        if (typeof $global[cb] === 'function') {
          func = $global[cb]
        } else if (cb.match(validJSFunctionNamePattern)) {
          func = (new Function(null, 'return ' + cb)()) // eslint-disable-line no-new-func
        }
      } else if (Object.prototype.toString.call(cb) === '[object Array]') {
        if (typeof cb[0] === 'string') {
          if (cb[0].match(validJSFunctionNamePattern)) {
            func = eval(cb[0] + "['" + cb[1] + "']") // eslint-disable-line no-eval
          }
        } else {
          func = cb[0][cb[1]]
        }
    
        if (typeof cb[0] === 'string') {
          if (typeof $global[cb[0]] === 'function') {
            scope = $global[cb[0]]
          } else if (cb[0].match(validJSFunctionNamePattern)) {
            scope = eval(cb[0]) // eslint-disable-line no-eval
          }
        } else if (typeof cb[0] === 'object') {
          scope = cb[0]
        }
      } else if (typeof cb === 'function') {
        func = cb
      }
    
      if (typeof func !== 'function') {
        throw new Error(func + ' is not a valid function')
      }
    
      return func.apply(scope, parameters)
    }
  );

  $php.context.function.declare(
    '\\create_function', [
      {"name":"args","type":"string"},
      {"name":"code","type":"string"}
    ],
    'string', function create_function(args, code) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/create_function/
      //      original by: Johnny Mast (http://www.phpvrouwen.nl)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //        example 1: var $f = create_function('a, b', 'return (a + b)')
      //        example 1: $f(1, 2)
      //        returns 1: 3
    
      try {
        return Function.apply(null, args.split(',').concat(code))
      } catch (e) {
        return false
      }
    }
  );

  $php.context.function.declare(
    '\\function_exists', [
      {"name":"function_name","type":"string"}
    ],
    'bool', function function_exists(funcName) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/function_exists/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Steve Clay
      // improved by: Legaev Andrey
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: function_exists('isFinite')
      //   returns 1: true
      //        test: skip-1
    
      var $global = (typeof window !== 'undefined' ? window : global)
    
      if (typeof funcName === 'string') {
        funcName = $global[funcName]
      }
    
      return typeof funcName === 'function'
    }
  );

  $php.context.function.declare(
    '\\get_defined_functions', [],
    'array', function get_defined_functions() { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/get_defined_functions/
      // original by: Brett Zamir (http://brett-zamir.me)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //      note 1: Test case 1: If get_defined_functions can find
      //      note 1: itself in the defined functions, it worked :)
      //   example 1: function test_in_array (array, p_val) {for(var i = 0, l = array.length; i < l; i++) {if (array[i] === p_val) return true} return false}
      //   example 1: var $funcs = get_defined_functions()
      //   example 1: var $found = test_in_array($funcs, 'get_defined_functions')
      //   example 1: var $result = $found
      //   returns 1: true
      //        test: skip-1
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      var i = ''
      var arr = []
      var already = {}
    
      for (i in $global) {
        try {
          if (typeof $global[i] === 'function') {
            if (!already[i]) {
              already[i] = 1
              arr.push(i)
            }
          } else if (typeof $global[i] === 'object') {
            for (var j in $global[i]) {
              if (typeof $global[j] === 'function' && $global[j] && !already[j]) {
                already[j] = 1
                arr.push(j)
              }
            }
          }
        } catch (e) {
          // Some objects in Firefox throw exceptions when their
          // properties are accessed (e.g., sessionStorage)
        }
      }
    
      return arr
    }
  );

};