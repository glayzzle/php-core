/*!
 * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)
 * @authors http://locutus.io/authors
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  $php.context.function.declare(
    '\\addcslashes', [
      {"name":"str","type":"string"},
      {"name":"charlist","type":"string"}
    ],
    'string', function addcslashes(str, charlist) {
      //  discuss at: http://locutus.io/php/addcslashes/
      // original by: Brett Zamir (http://brett-zamir.me)
      //      note 1: We show double backslashes in the return value example
      //      note 1: code below because a JavaScript string will not
      //      note 1: render them as backslashes otherwise
      //   example 1: addcslashes('foo[ ]', 'A..z'); // Escape all ASCII within capital A to lower z range, including square brackets
      //   returns 1: "\\f\\o\\o\\[ \\]"
      //   example 2: addcslashes("zoo['.']", 'z..A'); // Only escape z, period, and A here since not a lower-to-higher range
      //   returns 2: "\\zoo['\\.']"
      //   _example 3: addcslashes("@a\u0000\u0010\u00A9", "\0..\37!@\177..\377"); // Escape as octals those specified and less than 32 (0x20) or greater than 126 (0x7E), but not otherwise
      //   _returns 3: '\\@a\\000\\020\\302\\251'
      //   _example 4: addcslashes("\u0020\u007E", "\40..\175"); // Those between 32 (0x20 or 040) and 126 (0x7E or 0176) decimal value will be backslashed if specified (not octalized)
      //   _returns 4: '\\ ~'
      //   _example 5: addcslashes("\r\u0007\n", '\0..\37'); // Recognize C escape sequences if specified
      //   _returns 5: "\\r\\a\\n"
      //   _example 6: addcslashes("\r\u0007\n", '\0'); // Do not recognize C escape sequences if not specified
      //   _returns 6: "\r\u0007\n"
    
      var target = ''
      var chrs = []
      var i = 0
      var j = 0
      var c = ''
      var next = ''
      var rangeBegin = ''
      var rangeEnd = ''
      var chr = ''
      var begin = 0
      var end = 0
      var octalLength = 0
      var postOctalPos = 0
      var cca = 0
      var escHexGrp = []
      var encoded = ''
      var percentHex = /%([\dA-Fa-f]+)/g
    
      var _pad = function (n, c) {
        if ((n = n + '').length < c) {
          return new Array(++c - n.length).join('0') + n
        }
        return n
      }
    
      for (i = 0; i < charlist.length; i++) {
        c = charlist.charAt(i)
        next = charlist.charAt(i + 1)
        if (c === '\\' && next && (/\d/).test(next)) {
          // Octal
          rangeBegin = charlist.slice(i + 1).match(/^\d+/)[0]
          octalLength = rangeBegin.length
          postOctalPos = i + octalLength + 1
          if (charlist.charAt(postOctalPos) + charlist.charAt(postOctalPos + 1) === '..') {
            // Octal begins range
            begin = rangeBegin.charCodeAt(0)
            if ((/\\\d/).test(charlist.charAt(postOctalPos + 2) + charlist.charAt(postOctalPos + 3))) {
              // Range ends with octal
              rangeEnd = charlist.slice(postOctalPos + 3).match(/^\d+/)[0]
              // Skip range end backslash
              i += 1
            } else if (charlist.charAt(postOctalPos + 2)) {
              // Range ends with character
              rangeEnd = charlist.charAt(postOctalPos + 2)
            } else {
              throw new Error('Range with no end point')
            }
            end = rangeEnd.charCodeAt(0)
            if (end > begin) {
              // Treat as a range
              for (j = begin; j <= end; j++) {
                chrs.push(String.fromCharCode(j))
              }
            } else {
              // Supposed to treat period, begin and end as individual characters only, not a range
              chrs.push('.', rangeBegin, rangeEnd)
            }
            // Skip dots and range end (already skipped range end backslash if present)
            i += rangeEnd.length + 2
          } else {
            // Octal is by itself
            chr = String.fromCharCode(parseInt(rangeBegin, 8))
            chrs.push(chr)
          }
          // Skip range begin
          i += octalLength
        } else if (next + charlist.charAt(i + 2) === '..') {
          // Character begins range
          rangeBegin = c
          begin = rangeBegin.charCodeAt(0)
          if ((/\\\d/).test(charlist.charAt(i + 3) + charlist.charAt(i + 4))) {
            // Range ends with octal
            rangeEnd = charlist.slice(i + 4).match(/^\d+/)[0]
            // Skip range end backslash
            i += 1
          } else if (charlist.charAt(i + 3)) {
            // Range ends with character
            rangeEnd = charlist.charAt(i + 3)
          } else {
            throw new Error('Range with no end point')
          }
          end = rangeEnd.charCodeAt(0)
          if (end > begin) {
            // Treat as a range
            for (j = begin; j <= end; j++) {
              chrs.push(String.fromCharCode(j))
            }
          } else {
            // Supposed to treat period, begin and end as individual characters only, not a range
            chrs.push('.', rangeBegin, rangeEnd)
          }
          // Skip dots and range end (already skipped range end backslash if present)
          i += rangeEnd.length + 2
        } else {
          // Character is by itself
          chrs.push(c)
        }
      }
    
      for (i = 0; i < str.length; i++) {
        c = str.charAt(i)
        if (chrs.indexOf(c) !== -1) {
          target += '\\'
          cca = c.charCodeAt(0)
          if (cca < 32 || cca > 126) {
            // Needs special escaping
            switch (c) {
              case '\n':
                target += 'n'
                break
              case '\t':
                target += 't'
                break
              case '\u000D':
                target += 'r'
                break
              case '\u0007':
                target += 'a'
                break
              case '\v':
                target += 'v'
                break
              case '\b':
                target += 'b'
                break
              case '\f':
                target += 'f'
                break
              default:
                // target += _pad(cca.toString(8), 3);break; // Sufficient for UTF-16
                encoded = encodeURIComponent(c)
    
                // 3-length-padded UTF-8 octets
                if ((escHexGrp = percentHex.exec(encoded)) !== null) {
                  // already added a slash above:
                  target += _pad(parseInt(escHexGrp[1], 16).toString(8), 3)
                }
                while ((escHexGrp = percentHex.exec(encoded)) !== null) {
                  target += '\\' + _pad(parseInt(escHexGrp[1], 16).toString(8), 3)
                }
                break
            }
          } else {
            // Perform regular backslashed escaping
            target += c
          }
        } else {
          // Just add the character unescaped
          target += c
        }
      }
    
      return target
    }
  );

  $php.context.function.declare(
    '\\addslashes', [
      {"name":"str","type":"string"}
    ],
    'string', function addslashes(str) {
      //  discuss at: http://locutus.io/php/addslashes/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Ates Goral (http://magnetiq.com)
      // improved by: marrtins
      // improved by: Nate
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
      //    input by: Denny Wardhana
      //   example 1: addslashes("kevin's birthday")
      //   returns 1: "kevin\\'s birthday"
    
      return (str + '')
        .replace(/[\\"']/g, '\\$&')
        .replace(/\u0000/g, '\\0')
    }
  );

  $php.context.function.declare(
    '\\bin2hex', [
      {"name":"str","type":"string"}
    ],
    'string', function bin2hex(s) {
      //  discuss at: http://locutus.io/php/bin2hex/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Linuxworld
      // improved by: ntoniazzi (http://locutus.io/php/bin2hex:361#comment_177616)
      //   example 1: bin2hex('Kev')
      //   returns 1: '4b6576'
      //   example 2: bin2hex(String.fromCharCode(0x00))
      //   returns 2: '00'
    
      var i
      var l
      var o = ''
      var n
    
      s += ''
    
      for (i = 0, l = s.length; i < l; i++) {
        n = s.charCodeAt(i)
          .toString(16)
        o += n.length < 2 ? '0' + n : n
      }
    
      return o
    }
  );

  $php.context.function.declare(
    '\\chop', [
      {"name":"str","type":"mixed"},
      {"name":"character_mask","type":"mixed"}
    ],
    'mixed', function chop(str, charlist) {
      //  discuss at: http://locutus.io/php/chop/
      // original by: Paulo Freitas
      //   example 1: chop('    Kevin van Zonneveld    ')
      //   returns 1: '    Kevin van Zonneveld'
    
      var rtrim = require('../strings/rtrim')
      return rtrim(str, charlist)
    }
  );

  $php.context.function.declare(
    '\\chr', [
      {"name":"ascii","type":"int"}
    ],
    'string', function chr(codePt) {
      //  discuss at: http://locutus.io/php/chr/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: chr(75) === 'K'
      //   example 1: chr(65536) === '\uD800\uDC00'
      //   returns 1: true
      //   returns 1: true
    
      if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
        //   enough for the UTF-16 encoding (JavaScript internal use), to
        //   require representation with two surrogates (reserved non-characters
        //   used for building other characters; the first is "high" and the next "low")
        codePt -= 0x10000
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF))
      }
      return String.fromCharCode(codePt)
    }
  );

  $php.context.function.declare(
    '\\chunk_split', [
      {"name":"body","type":"string"},
      {"name":"chunklen","type":"int"},
      {"name":"end","type":"string"}
    ],
    'string', function chunk_split(body, chunklen, end) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/chunk_split/
      // original by: Paulo Freitas
      //    input by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Theriault (https://github.com/Theriault)
      //   example 1: chunk_split('Hello world!', 1, '*')
      //   returns 1: 'H*e*l*l*o* *w*o*r*l*d*!*'
      //   example 2: chunk_split('Hello world!', 10, '*')
      //   returns 2: 'Hello worl*d!*'
    
      chunklen = parseInt(chunklen, 10) || 76
      end = end || '\r\n'
    
      if (chunklen < 1) {
        return false
      }
    
      return body.match(new RegExp('.{0,' + chunklen + '}', 'g'))
        .join(end)
    }
  );

  $php.context.function.declare(
    '\\convert_cyr_string', [
      {"name":"str","type":"string"},
      {"name":"from","type":"string"},
      {"name":"to","type":"string"}
    ],
    'string', function convert_cyr_string(str, from, to) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/convert_cyr_string/
      // original by: Brett Zamir (http://brett-zamir.me)
      //      note 1: Assumes and converts to Unicode strings with character
      //      note 1: code equivalents of the same numbers as in the from or
      //      note 1: target character set; Note that neither the input or output
      //      note 1: should be treated as actual Unicode, since the PHP function
      //      note 1: this is original by does not either
      //      note 1: One could easily represent (or convert the results) of a
      //      note 1: string form as arrays of code points instead but since JavaScript
      //      note 1: currently has no clear binary data type, we chose to use strings
      //      note 1: as in PHP
      //   example 1: convert_cyr_string(String.fromCharCode(214), 'k', 'w').charCodeAt(0) === 230; // Char. 214 of KOI8-R gives equivalent number value 230 in win1251
      //   returns 1: true
    
      var _cyrWin1251 = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        46,
        154,
        174,
        190,
        46,
        159,
        189,
        46,
        46,
        179,
        191,
        180,
        157,
        46,
        46,
        156,
        183,
        46,
        46,
        182,
        166,
        173,
        46,
        46,
        158,
        163,
        152,
        164,
        155,
        46,
        46,
        46,
        167,
        225,
        226,
        247,
        231,
        228,
        229,
        246,
        250,
        233,
        234,
        235,
        236,
        237,
        238,
        239,
        240,
        242,
        243,
        244,
        245,
        230,
        232,
        227,
        254,
        251,
        253,
        255,
        249,
        248,
        252,
        224,
        241,
        193,
        194,
        215,
        199,
        196,
        197,
        214,
        218,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        210,
        211,
        212,
        213,
        198,
        200,
        195,
        222,
        219,
        221,
        223,
        217,
        216,
        220,
        192,
        209,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        184,
        186,
        32,
        179,
        191,
        32,
        32,
        32,
        32,
        32,
        180,
        162,
        32,
        32,
        32,
        32,
        168,
        170,
        32,
        178,
        175,
        32,
        32,
        32,
        32,
        32,
        165,
        161,
        169,
        254,
        224,
        225,
        246,
        228,
        229,
        244,
        227,
        245,
        232,
        233,
        234,
        235,
        236,
        237,
        238,
        239,
        255,
        240,
        241,
        242,
        243,
        230,
        226,
        252,
        251,
        231,
        248,
        253,
        249,
        247,
        250,
        222,
        192,
        193,
        214,
        196,
        197,
        212,
        195,
        213,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        223,
        208,
        209,
        210,
        211,
        198,
        194,
        220,
        219,
        199,
        216,
        221,
        217,
        215,
        218
      ]
      var _cyrCp866 = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        225,
        226,
        247,
        231,
        228,
        229,
        246,
        250,
        233,
        234,
        235,
        236,
        237,
        238,
        239,
        240,
        242,
        243,
        244,
        245,
        230,
        232,
        227,
        254,
        251,
        253,
        255,
        249,
        248,
        252,
        224,
        241,
        193,
        194,
        215,
        199,
        196,
        197,
        214,
        218,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        35,
        35,
        35,
        124,
        124,
        124,
        124,
        43,
        43,
        124,
        124,
        43,
        43,
        43,
        43,
        43,
        43,
        45,
        45,
        124,
        45,
        43,
        124,
        124,
        43,
        43,
        45,
        45,
        124,
        45,
        43,
        45,
        45,
        45,
        45,
        43,
        43,
        43,
        43,
        43,
        43,
        43,
        43,
        35,
        35,
        124,
        124,
        35,
        210,
        211,
        212,
        213,
        198,
        200,
        195,
        222,
        219,
        221,
        223,
        217,
        216,
        220,
        192,
        209,
        179,
        163,
        180,
        164,
        183,
        167,
        190,
        174,
        32,
        149,
        158,
        32,
        152,
        159,
        148,
        154,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        205,
        186,
        213,
        241,
        243,
        201,
        32,
        245,
        187,
        212,
        211,
        200,
        190,
        32,
        247,
        198,
        199,
        204,
        181,
        240,
        242,
        185,
        32,
        244,
        203,
        207,
        208,
        202,
        216,
        32,
        246,
        32,
        238,
        160,
        161,
        230,
        164,
        165,
        228,
        163,
        229,
        168,
        169,
        170,
        171,
        172,
        173,
        174,
        175,
        239,
        224,
        225,
        226,
        227,
        166,
        162,
        236,
        235,
        167,
        232,
        237,
        233,
        231,
        234,
        158,
        128,
        129,
        150,
        132,
        133,
        148,
        131,
        149,
        136,
        137,
        138,
        139,
        140,
        141,
        142,
        143,
        159,
        144,
        145,
        146,
        147,
        134,
        130,
        156,
        155,
        135,
        152,
        157,
        153,
        151,
        154
      ]
      var _cyrIso88595 = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        179,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        225,
        226,
        247,
        231,
        228,
        229,
        246,
        250,
        233,
        234,
        235,
        236,
        237,
        238,
        239,
        240,
        242,
        243,
        244,
        245,
        230,
        232,
        227,
        254,
        251,
        253,
        255,
        249,
        248,
        252,
        224,
        241,
        193,
        194,
        215,
        199,
        196,
        197,
        214,
        218,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        210,
        211,
        212,
        213,
        198,
        200,
        195,
        222,
        219,
        221,
        223,
        217,
        216,
        220,
        192,
        209,
        32,
        163,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        241,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        161,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        32,
        238,
        208,
        209,
        230,
        212,
        213,
        228,
        211,
        229,
        216,
        217,
        218,
        219,
        220,
        221,
        222,
        223,
        239,
        224,
        225,
        226,
        227,
        214,
        210,
        236,
        235,
        215,
        232,
        237,
        233,
        231,
        234,
        206,
        176,
        177,
        198,
        180,
        181,
        196,
        179,
        197,
        184,
        185,
        186,
        187,
        188,
        189,
        190,
        191,
        207,
        192,
        193,
        194,
        195,
        182,
        178,
        204,
        203,
        183,
        200,
        205,
        201,
        199,
        202
      ]
      var _cyrMac = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        225,
        226,
        247,
        231,
        228,
        229,
        246,
        250,
        233,
        234,
        235,
        236,
        237,
        238,
        239,
        240,
        242,
        243,
        244,
        245,
        230,
        232,
        227,
        254,
        251,
        253,
        255,
        249,
        248,
        252,
        224,
        241,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        174,
        175,
        176,
        177,
        178,
        179,
        180,
        181,
        182,
        183,
        184,
        185,
        186,
        187,
        188,
        189,
        190,
        191,
        128,
        129,
        130,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        139,
        140,
        141,
        142,
        143,
        144,
        145,
        146,
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        155,
        156,
        179,
        163,
        209,
        193,
        194,
        215,
        199,
        196,
        197,
        214,
        218,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        210,
        211,
        212,
        213,
        198,
        200,
        195,
        222,
        219,
        221,
        223,
        217,
        216,
        220,
        192,
    
        255,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
    
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        192,
        193,
        194,
        195,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        210,
        211,
        212,
        213,
        214,
        215,
        216,
        217,
        218,
        219,
        220,
        221,
        222,
        223,
        160,
        161,
        162,
        222,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        174,
        175,
        176,
        177,
        178,
        221,
        180,
        181,
        182,
        183,
        184,
        185,
        186,
        187,
        188,
        189,
        190,
        191,
        254,
        224,
        225,
        246,
        228,
        229,
        244,
        227,
        245,
        232,
        233,
        234,
        235,
        236,
        237,
        238,
        239,
        223,
        240,
        241,
    
        242,
        243,
        230,
        226,
        252,
        251,
        231,
        248,
        253,
        249,
        247,
        250,
        158,
        128,
        129,
        150,
        132,
        133,
        148,
        131,
        149,
        136,
        137,
        138,
        139,
        140,
        141,
        142,
        143,
        159,
        144,
        145,
        146,
        147,
        134,
        130,
        156,
        155,
        135,
        152,
        157,
        153,
        151,
        154
      ]
    
      var fromTable = null
      var toTable = null
      var tmp
      var i = 0
      var retStr = ''
    
      switch (from.toUpperCase()) {
        case 'W':
          fromTable = _cyrWin1251
          break
        case 'A':
        case 'D':
          fromTable = _cyrCp866
          break
        case 'I':
          fromTable = _cyrIso88595
          break
        case 'M':
          fromTable = _cyrMac
          break
        case 'K':
          break
        default:
          // Can we throw a warning instead? That would be more in line with PHP
          throw new Error('Unknown source charset: ' + fromTable)
      }
    
      switch (to.toUpperCase()) {
        case 'W':
          toTable = _cyrWin1251
          break
        case 'A':
        case 'D':
          toTable = _cyrCp866
          break
        case 'I':
          toTable = _cyrIso88595
          break
        case 'M':
          toTable = _cyrMac
          break
        case 'K':
          break
        default:
          // Can we throw a warning instead? That would be more in line with PHP
          throw new Error('Unknown destination charset: ' + toTable)
      }
    
      if (!str) {
        return str
      }
    
      for (i = 0; i < str.length; i++) {
        tmp = (fromTable === null)
          ? str.charAt(i)
          : String.fromCharCode(fromTable[str.charAt(i).charCodeAt(0)])
    
        retStr += (toTable === null)
          ? tmp
          : String.fromCharCode(toTable[tmp.charCodeAt(0) + 256])
      }
    
      return retStr
    }
  );

  $php.context.function.declare(
    '\\convert_uuencode', [
      {"name":"data","type":"string"}
    ],
    'string', function convert_uuencode(str) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/convert_uuencode/
      //      original by: Ole Vrijenhoek
      //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      // reimplemented by: Ole Vrijenhoek
      //        example 1: convert_uuencode("test\ntext text\r\n")
      //        returns 1: "0=&5S=`IT97AT('1E>'0-\"@\n`\n"
    
      var isScalar = require('../var/is_scalar')
    
      var chr = function (c) {
        return String.fromCharCode(c)
      }
    
      if (!str || str === '') {
        return chr(0)
      } else if (!isScalar(str)) {
        return false
      }
    
      var c = 0
      var u = 0
      var i = 0
      var a = 0
      var encoded = ''
      var tmp1 = ''
      var tmp2 = ''
      var bytes = {}
    
      // divide string into chunks of 45 characters
      var chunk = function () {
        bytes = str.substr(u, 45).split('')
        for (i in bytes) {
          bytes[i] = bytes[i].charCodeAt(0)
        }
        return bytes.length || 0
      }
    
      while ((c = chunk()) !== 0) {
        u += 45
    
        // New line encoded data starts with number of bytes encoded.
        encoded += chr(c + 32)
    
        // Convert each char in bytes[] to a byte
        for (i in bytes) {
          tmp1 = bytes[i].toString(2)
          while (tmp1.length < 8) {
            tmp1 = '0' + tmp1
          }
          tmp2 += tmp1
        }
    
        while (tmp2.length % 6) {
          tmp2 = tmp2 + '0'
        }
    
        for (i = 0; i <= (tmp2.length / 6) - 1; i++) {
          tmp1 = tmp2.substr(a, 6)
          if (tmp1 === '000000') {
            encoded += chr(96)
          } else {
            encoded += chr(parseInt(tmp1, 2) + 32)
          }
          a += 6
        }
        a = 0
        tmp2 = ''
        encoded += '\n'
      }
    
      // Add termination characters
      encoded += chr(96) + '\n'
    
      return encoded
    }
  );

  $php.context.function.declare(
    '\\count_chars', [
      {"name":"string","type":"string"},
      {"name":"mode","type":"int"}
    ],
    'mixed', function count_chars(str, mode) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/count_chars/
      // original by: Ates Goral (http://magnetiq.com)
      // improved by: Jack
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Brett Zamir (http://brett-zamir.me)
      //  revised by: Theriault (https://github.com/Theriault)
      //   example 1: count_chars("Hello World!", 3)
      //   returns 1: " !HWdelor"
      //   example 2: count_chars("Hello World!", 1)
      //   returns 2: {32:1,33:1,72:1,87:1,100:1,101:1,108:3,111:2,114:1}
    
      var result = {}
      var resultArr = []
      var i
    
      str = ('' + str)
        .split('')
        .sort()
        .join('')
        .match(/(.)\1*/g)
    
      if ((mode & 1) === 0) {
        for (i = 0; i !== 256; i++) {
          result[i] = 0
        }
      }
    
      if (mode === 2 || mode === 4) {
        for (i = 0; i !== str.length; i += 1) {
          delete result[str[i].charCodeAt(0)]
        }
        for (i in result) {
          result[i] = (mode === 4) ? String.fromCharCode(i) : 0
        }
      } else if (mode === 3) {
        for (i = 0; i !== str.length; i += 1) {
          result[i] = str[i].slice(0, 1)
        }
      } else {
        for (i = 0; i !== str.length; i += 1) {
          result[str[i].charCodeAt(0)] = str[i].length
        }
      }
      if (mode < 3) {
        return result
      }
    
      for (i in result) {
        resultArr.push(result[i])
      }
    
      return resultArr.join('')
    }
  );

  $php.context.function.declare(
    '\\crc32', [
      {"name":"str","type":"string"}
    ],
    'int', function crc32(str) {
      //  discuss at: http://locutus.io/php/crc32/
      // original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // improved by: T0bsn
      //   example 1: crc32('Kevin van Zonneveld')
      //   returns 1: 1249991249
    
      var utf8Encode = require('../xml/utf8_encode')
      str = utf8Encode(str)
      var table = [
        '00000000',
        '77073096',
        'EE0E612C',
        '990951BA',
        '076DC419',
        '706AF48F',
        'E963A535',
        '9E6495A3',
        '0EDB8832',
        '79DCB8A4',
        'E0D5E91E',
        '97D2D988',
        '09B64C2B',
        '7EB17CBD',
        'E7B82D07',
        '90BF1D91',
        '1DB71064',
        '6AB020F2',
        'F3B97148',
        '84BE41DE',
        '1ADAD47D',
        '6DDDE4EB',
        'F4D4B551',
        '83D385C7',
        '136C9856',
        '646BA8C0',
        'FD62F97A',
        '8A65C9EC',
        '14015C4F',
        '63066CD9',
        'FA0F3D63',
        '8D080DF5',
        '3B6E20C8',
        '4C69105E',
        'D56041E4',
        'A2677172',
        '3C03E4D1',
        '4B04D447',
        'D20D85FD',
        'A50AB56B',
        '35B5A8FA',
        '42B2986C',
        'DBBBC9D6',
        'ACBCF940',
        '32D86CE3',
        '45DF5C75',
        'DCD60DCF',
        'ABD13D59',
        '26D930AC',
        '51DE003A',
        'C8D75180',
        'BFD06116',
        '21B4F4B5',
        '56B3C423',
        'CFBA9599',
        'B8BDA50F',
        '2802B89E',
        '5F058808',
        'C60CD9B2',
        'B10BE924',
        '2F6F7C87',
        '58684C11',
        'C1611DAB',
        'B6662D3D',
        '76DC4190',
        '01DB7106',
        '98D220BC',
        'EFD5102A',
        '71B18589',
        '06B6B51F',
        '9FBFE4A5',
        'E8B8D433',
        '7807C9A2',
        '0F00F934',
        '9609A88E',
        'E10E9818',
        '7F6A0DBB',
        '086D3D2D',
        '91646C97',
        'E6635C01',
        '6B6B51F4',
        '1C6C6162',
        '856530D8',
        'F262004E',
        '6C0695ED',
        '1B01A57B',
        '8208F4C1',
        'F50FC457',
        '65B0D9C6',
        '12B7E950',
        '8BBEB8EA',
        'FCB9887C',
        '62DD1DDF',
        '15DA2D49',
        '8CD37CF3',
        'FBD44C65',
        '4DB26158',
        '3AB551CE',
        'A3BC0074',
        'D4BB30E2',
        '4ADFA541',
        '3DD895D7',
        'A4D1C46D',
        'D3D6F4FB',
        '4369E96A',
        '346ED9FC',
        'AD678846',
        'DA60B8D0',
        '44042D73',
        '33031DE5',
        'AA0A4C5F',
        'DD0D7CC9',
        '5005713C',
        '270241AA',
        'BE0B1010',
        'C90C2086',
        '5768B525',
        '206F85B3',
        'B966D409',
        'CE61E49F',
        '5EDEF90E',
        '29D9C998',
        'B0D09822',
        'C7D7A8B4',
        '59B33D17',
        '2EB40D81',
        'B7BD5C3B',
        'C0BA6CAD',
        'EDB88320',
        '9ABFB3B6',
        '03B6E20C',
        '74B1D29A',
        'EAD54739',
        '9DD277AF',
        '04DB2615',
        '73DC1683',
        'E3630B12',
        '94643B84',
        '0D6D6A3E',
        '7A6A5AA8',
        'E40ECF0B',
        '9309FF9D',
        '0A00AE27',
        '7D079EB1',
        'F00F9344',
        '8708A3D2',
        '1E01F268',
        '6906C2FE',
        'F762575D',
        '806567CB',
        '196C3671',
        '6E6B06E7',
        'FED41B76',
        '89D32BE0',
        '10DA7A5A',
        '67DD4ACC',
        'F9B9DF6F',
        '8EBEEFF9',
        '17B7BE43',
        '60B08ED5',
        'D6D6A3E8',
        'A1D1937E',
        '38D8C2C4',
        '4FDFF252',
        'D1BB67F1',
        'A6BC5767',
        '3FB506DD',
        '48B2364B',
        'D80D2BDA',
        'AF0A1B4C',
        '36034AF6',
        '41047A60',
        'DF60EFC3',
        'A867DF55',
        '316E8EEF',
        '4669BE79',
        'CB61B38C',
        'BC66831A',
        '256FD2A0',
        '5268E236',
        'CC0C7795',
        'BB0B4703',
        '220216B9',
        '5505262F',
        'C5BA3BBE',
        'B2BD0B28',
        '2BB45A92',
        '5CB36A04',
        'C2D7FFA7',
        'B5D0CF31',
        '2CD99E8B',
        '5BDEAE1D',
        '9B64C2B0',
        'EC63F226',
        '756AA39C',
        '026D930A',
        '9C0906A9',
        'EB0E363F',
        '72076785',
        '05005713',
        '95BF4A82',
        'E2B87A14',
        '7BB12BAE',
        '0CB61B38',
        '92D28E9B',
        'E5D5BE0D',
        '7CDCEFB7',
        '0BDBDF21',
        '86D3D2D4',
        'F1D4E242',
        '68DDB3F8',
        '1FDA836E',
        '81BE16CD',
        'F6B9265B',
        '6FB077E1',
        '18B74777',
        '88085AE6',
        'FF0F6A70',
        '66063BCA',
        '11010B5C',
        '8F659EFF',
        'F862AE69',
        '616BFFD3',
        '166CCF45',
        'A00AE278',
        'D70DD2EE',
        '4E048354',
        '3903B3C2',
        'A7672661',
        'D06016F7',
        '4969474D',
        '3E6E77DB',
        'AED16A4A',
        'D9D65ADC',
        '40DF0B66',
        '37D83BF0',
        'A9BCAE53',
        'DEBB9EC5',
        '47B2CF7F',
        '30B5FFE9',
        'BDBDF21C',
        'CABAC28A',
        '53B39330',
        '24B4A3A6',
        'BAD03605',
        'CDD70693',
        '54DE5729',
        '23D967BF',
        'B3667A2E',
        'C4614AB8',
        '5D681B02',
        '2A6F2B94',
        'B40BBE37',
        'C30C8EA1',
        '5A05DF1B',
        '2D02EF8D'
      ].join(' ')
      // @todo: ^-- Now that `table` is an array, maybe we can use that directly using slices,
      // instead of converting it to a string and substringing
    
      var crc = 0
      var x = 0
      var y = 0
    
      crc = crc ^ (-1)
      for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF
        x = '0x' + table.substr(y * 9, 8)
        crc = (crc >>> 8) ^ x
      }
    
      return crc ^ (-1)
    }
  );

  $php.context.function.declare(
    '\\explode', [
      {"name":"delimiter","type":"string"},
      {"name":"string","type":"string"},
      {"name":"limit","type":"int"}
    ],
    'array', function explode(delimiter, string, limit) {
      //  discuss at: http://locutus.io/php/explode/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: explode(' ', 'Kevin van Zonneveld')
      //   returns 1: [ 'Kevin', 'van', 'Zonneveld' ]
    
      if (arguments.length < 2 ||
        typeof delimiter === 'undefined' ||
        typeof string === 'undefined') {
        return null
      }
      if (delimiter === '' ||
        delimiter === false ||
        delimiter === null) {
        return false
      }
      if (typeof delimiter === 'function' ||
        typeof delimiter === 'object' ||
        typeof string === 'function' ||
        typeof string === 'object') {
        return {
          0: ''
        }
      }
      if (delimiter === true) {
        delimiter = '1'
      }
    
      // Here we go...
      delimiter += ''
      string += ''
    
      var s = string.split(delimiter)
    
      if (typeof limit === 'undefined') return s
    
      // Support for limit
      if (limit === 0) limit = 1
    
      // Positive limit
      if (limit > 0) {
        if (limit >= s.length) {
          return s
        }
        return s
          .slice(0, limit - 1)
          .concat([s.slice(limit - 1)
            .join(delimiter)
          ])
      }
    
      // Negative limit
      if (-limit >= s.length) {
        return []
      }
    
      s.splice(s.length + limit)
      return s
    }
  );

  $php.context.function.declare(
    '\\get_html_translation_table', [
      {"name":"table","type":"int"},
      {"name":"quote_style","type":"int"}
    ],
    'array', function get_html_translation_table(table, quoteStyle) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/get_html_translation_table/
      // original by: Philip Peterson
      //  revised by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: noname
      // bugfixed by: Alex
      // bugfixed by: Marco
      // bugfixed by: madipta
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: T.Wild
      // improved by: KELAN
      // improved by: Brett Zamir (http://brett-zamir.me)
      //    input by: Frank Forte
      //    input by: Ratheous
      //      note 1: It has been decided that we're not going to add global
      //      note 1: dependencies to Locutus, meaning the constants are not
      //      note 1: real constants, but strings instead. Integers are also supported if someone
      //      note 1: chooses to create the constants themselves.
      //   example 1: get_html_translation_table('HTML_SPECIALCHARS')
      //   returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
    
      var entities = {}
      var hashMap = {}
      var decimal
      var constMappingTable = {}
      var constMappingQuoteStyle = {}
      var useTable = {}
      var useQuoteStyle = {}
    
      // Translate arguments
      constMappingTable[0] = 'HTML_SPECIALCHARS'
      constMappingTable[1] = 'HTML_ENTITIES'
      constMappingQuoteStyle[0] = 'ENT_NOQUOTES'
      constMappingQuoteStyle[2] = 'ENT_COMPAT'
      constMappingQuoteStyle[3] = 'ENT_QUOTES'
    
      useTable = !isNaN(table)
        ? constMappingTable[table]
        : table
          ? table.toUpperCase()
          : 'HTML_SPECIALCHARS'
    
      useQuoteStyle = !isNaN(quoteStyle)
        ? constMappingQuoteStyle[quoteStyle]
        : quoteStyle
          ? quoteStyle.toUpperCase()
          : 'ENT_COMPAT'
    
      if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error('Table: ' + useTable + ' not supported')
      }
    
      entities['38'] = '&amp;'
      if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;'
        entities['161'] = '&iexcl;'
        entities['162'] = '&cent;'
        entities['163'] = '&pound;'
        entities['164'] = '&curren;'
        entities['165'] = '&yen;'
        entities['166'] = '&brvbar;'
        entities['167'] = '&sect;'
        entities['168'] = '&uml;'
        entities['169'] = '&copy;'
        entities['170'] = '&ordf;'
        entities['171'] = '&laquo;'
        entities['172'] = '&not;'
        entities['173'] = '&shy;'
        entities['174'] = '&reg;'
        entities['175'] = '&macr;'
        entities['176'] = '&deg;'
        entities['177'] = '&plusmn;'
        entities['178'] = '&sup2;'
        entities['179'] = '&sup3;'
        entities['180'] = '&acute;'
        entities['181'] = '&micro;'
        entities['182'] = '&para;'
        entities['183'] = '&middot;'
        entities['184'] = '&cedil;'
        entities['185'] = '&sup1;'
        entities['186'] = '&ordm;'
        entities['187'] = '&raquo;'
        entities['188'] = '&frac14;'
        entities['189'] = '&frac12;'
        entities['190'] = '&frac34;'
        entities['191'] = '&iquest;'
        entities['192'] = '&Agrave;'
        entities['193'] = '&Aacute;'
        entities['194'] = '&Acirc;'
        entities['195'] = '&Atilde;'
        entities['196'] = '&Auml;'
        entities['197'] = '&Aring;'
        entities['198'] = '&AElig;'
        entities['199'] = '&Ccedil;'
        entities['200'] = '&Egrave;'
        entities['201'] = '&Eacute;'
        entities['202'] = '&Ecirc;'
        entities['203'] = '&Euml;'
        entities['204'] = '&Igrave;'
        entities['205'] = '&Iacute;'
        entities['206'] = '&Icirc;'
        entities['207'] = '&Iuml;'
        entities['208'] = '&ETH;'
        entities['209'] = '&Ntilde;'
        entities['210'] = '&Ograve;'
        entities['211'] = '&Oacute;'
        entities['212'] = '&Ocirc;'
        entities['213'] = '&Otilde;'
        entities['214'] = '&Ouml;'
        entities['215'] = '&times;'
        entities['216'] = '&Oslash;'
        entities['217'] = '&Ugrave;'
        entities['218'] = '&Uacute;'
        entities['219'] = '&Ucirc;'
        entities['220'] = '&Uuml;'
        entities['221'] = '&Yacute;'
        entities['222'] = '&THORN;'
        entities['223'] = '&szlig;'
        entities['224'] = '&agrave;'
        entities['225'] = '&aacute;'
        entities['226'] = '&acirc;'
        entities['227'] = '&atilde;'
        entities['228'] = '&auml;'
        entities['229'] = '&aring;'
        entities['230'] = '&aelig;'
        entities['231'] = '&ccedil;'
        entities['232'] = '&egrave;'
        entities['233'] = '&eacute;'
        entities['234'] = '&ecirc;'
        entities['235'] = '&euml;'
        entities['236'] = '&igrave;'
        entities['237'] = '&iacute;'
        entities['238'] = '&icirc;'
        entities['239'] = '&iuml;'
        entities['240'] = '&eth;'
        entities['241'] = '&ntilde;'
        entities['242'] = '&ograve;'
        entities['243'] = '&oacute;'
        entities['244'] = '&ocirc;'
        entities['245'] = '&otilde;'
        entities['246'] = '&ouml;'
        entities['247'] = '&divide;'
        entities['248'] = '&oslash;'
        entities['249'] = '&ugrave;'
        entities['250'] = '&uacute;'
        entities['251'] = '&ucirc;'
        entities['252'] = '&uuml;'
        entities['253'] = '&yacute;'
        entities['254'] = '&thorn;'
        entities['255'] = '&yuml;'
      }
    
      if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;'
      }
      if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;'
      }
      entities['60'] = '&lt;'
      entities['62'] = '&gt;'
    
      // ascii decimals to real symbols
      for (decimal in entities) {
        if (entities.hasOwnProperty(decimal)) {
          hashMap[String.fromCharCode(decimal)] = entities[decimal]
        }
      }
    
      return hashMap
    }
  );

  $php.context.function.declare(
    '\\html_entity_decode', [
      {"name":"string","type":"string"},
      {"name":"quote_style","type":"int"},
      {"name":"charset","type":"string"}
    ],
    'string', function html_entity_decode(string, quoteStyle) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/html_entity_decode/
      // original by: john (http://www.jd-tech.net)
      //    input by: ger
      //    input by: Ratheous
      //    input by: Nick Kolosov (http://sammy.ru)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: marc andreu
      //  revised by: Kevin van Zonneveld (http://kvz.io)
      //  revised by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Fox
      //   example 1: html_entity_decode('Kevin &amp; van Zonneveld')
      //   returns 1: 'Kevin & van Zonneveld'
      //   example 2: html_entity_decode('&amp;lt;')
      //   returns 2: '&lt;'
    
      var getHtmlTranslationTable = require('../strings/get_html_translation_table')
      var tmpStr = ''
      var entity = ''
      var symbol = ''
      tmpStr = string.toString()
    
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
      if (hashMap === false) {
        return false
      }
    
      // @todo: &amp; problem
      // http://locutus.io/php/get_html_translation_table:416#comment_97660
      delete (hashMap['&'])
      hashMap['&'] = '&amp;'
    
      for (symbol in hashMap) {
        entity = hashMap[symbol]
        tmpStr = tmpStr.split(entity).join(symbol)
      }
      tmpStr = tmpStr.split('&#039;').join("'")
    
      return tmpStr
    }
  );

  $php.context.function.declare(
    '\\htmlentities', [
      {"name":"string","type":"string"},
      {"name":"quote_style","type":"int"},
      {"name":"charset","type":"string"},
      {"name":"double_encode","type":"bool"}
    ],
    'string', function htmlentities(string, quoteStyle, charset, doubleEncode) {
      //  discuss at: http://locutus.io/php/htmlentities/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //  revised by: Kevin van Zonneveld (http://kvz.io)
      //  revised by: Kevin van Zonneveld (http://kvz.io)
      // improved by: nobbler
      // improved by: Jack
      // improved by: Rafał Kukawski (http://blog.kukawski.pl)
      // improved by: Dj (http://locutus.io/php/htmlentities:425#comment_134018)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //    input by: Ratheous
      //      note 1: function is compatible with PHP 5.2 and older
      //   example 1: htmlentities('Kevin & van Zonneveld')
      //   returns 1: 'Kevin &amp; van Zonneveld'
      //   example 2: htmlentities("foo'bar","ENT_QUOTES")
      //   returns 2: 'foo&#039;bar'
    
      var getHtmlTranslationTable = require('../strings/get_html_translation_table')
      var hashMap = getHtmlTranslationTable('HTML_ENTITIES', quoteStyle)
    
      string = string === null ? '' : string + ''
    
      if (!hashMap) {
        return false
      }
    
      if (quoteStyle && quoteStyle === 'ENT_QUOTES') {
        hashMap["'"] = '&#039;'
      }
    
      doubleEncode = doubleEncode === null || !!doubleEncode
    
      var regex = new RegExp('&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[' +
        Object.keys(hashMap)
        .join('')
        // replace regexp special chars
        .replace(/([()[\]{}\-.*+?^$|\/\\])/g, '\\$1') + ']',
        'g')
    
      return string.replace(regex, function (ent) {
        if (ent.length > 1) {
          return doubleEncode ? hashMap['&'] + ent.substr(1) : ent
        }
    
        return hashMap[ent]
      })
    }
  );

  $php.context.function.declare(
    '\\htmlspecialchars', [
      {"name":"string","type":"string"},
      {"name":"flags","type":"int"},
      {"name":"encoding","type":"string"},
      {"name":"double_encode","type":"mixed"}
    ],
    'mixed', function htmlspecialchars(string, quoteStyle, charset, doubleEncode) {
      //       discuss at: http://locutus.io/php/htmlspecialchars/
      //      original by: Mirek Slugen
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Nathan
      //      bugfixed by: Arno
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //       revised by: Kevin van Zonneveld (http://kvz.io)
      //         input by: Ratheous
      //         input by: Mailfaker (http://www.weedem.fr/)
      //         input by: felix
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //           note 1: charset argument not supported
      //        example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES')
      //        returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
      //        example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES'])
      //        returns 2: 'ab"c&#039;d'
      //        example 3: htmlspecialchars('my "&entity;" is still here', null, null, false)
      //        returns 3: 'my &quot;&entity;&quot; is still here'
    
      var optTemp = 0
      var i = 0
      var noquotes = false
      if (typeof quoteStyle === 'undefined' || quoteStyle === null) {
        quoteStyle = 2
      }
      string = string || ''
      string = string.toString()
    
      if (doubleEncode !== false) {
        // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;')
      }
    
      string = string
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    
      var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
      }
      if (quoteStyle === 0) {
        noquotes = true
      }
      if (typeof quoteStyle !== 'number') {
        // Allow for a single string or an array of string flags
        quoteStyle = [].concat(quoteStyle)
        for (i = 0; i < quoteStyle.length; i++) {
          // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
          if (OPTS[quoteStyle[i]] === 0) {
            noquotes = true
          } else if (OPTS[quoteStyle[i]]) {
            optTemp = optTemp | OPTS[quoteStyle[i]]
          }
        }
        quoteStyle = optTemp
      }
      if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;')
      }
      if (!noquotes) {
        string = string.replace(/"/g, '&quot;')
      }
    
      return string
    }
  );

  $php.context.function.declare(
    '\\htmlspecialchars_decode', [
      {"name":"string","type":"string"},
      {"name":"quote_style","type":"int"}
    ],
    'string', function htmlspecialchars_decode(string, quoteStyle) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/htmlspecialchars_decode/
      //      original by: Mirek Slugen
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Mateusz "loonquawl" Zalega
      //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //         input by: ReverseSyntax
      //         input by: Slawomir Kaniecki
      //         input by: Scott Cariss
      //         input by: Francois
      //         input by: Ratheous
      //         input by: Mailfaker (http://www.weedem.fr/)
      //       revised by: Kevin van Zonneveld (http://kvz.io)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES')
      //        returns 1: '<p>this -> &quot;</p>'
      //        example 2: htmlspecialchars_decode("&amp;quot;")
      //        returns 2: '&quot;'
    
      var optTemp = 0
      var i = 0
      var noquotes = false
    
      if (typeof quoteStyle === 'undefined') {
        quoteStyle = 2
      }
      string = string.toString()
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
      var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
      }
      if (quoteStyle === 0) {
        noquotes = true
      }
      if (typeof quoteStyle !== 'number') {
        // Allow for a single string or an array of string flags
        quoteStyle = [].concat(quoteStyle)
        for (i = 0; i < quoteStyle.length; i++) {
          // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
          if (OPTS[quoteStyle[i]] === 0) {
            noquotes = true
          } else if (OPTS[quoteStyle[i]]) {
            optTemp = optTemp | OPTS[quoteStyle[i]]
          }
        }
        quoteStyle = optTemp
      }
      if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
        // PHP doesn't currently escape if more than one 0, but it should:
        string = string.replace(/&#0*39;/g, "'")
        // This would also be useful here, but not a part of PHP:
        // string = string.replace(/&apos;|&#x0*27;/g, "'");
      }
      if (!noquotes) {
        string = string.replace(/&quot;/g, '"')
      }
      // Put this in last place to avoid escape being double-decoded
      string = string.replace(/&amp;/g, '&')
    
      return string
    }
  );

  $php.context.function.declare(
    '\\implode', [
      {"name":"glue","type":"string"},
      {"name":"pieces","type":"\\array"}
    ],
    'string', function implode(glue, pieces) {
      //  discuss at: http://locutus.io/php/implode/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Waldo Malqui Silva (http://waldo.malqui.info)
      // improved by: Itsacon (http://www.itsacon.net/)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: implode(' ', ['Kevin', 'van', 'Zonneveld'])
      //   returns 1: 'Kevin van Zonneveld'
      //   example 2: implode(' ', {first:'Kevin', last: 'van Zonneveld'})
      //   returns 2: 'Kevin van Zonneveld'
    
      var i = ''
      var retVal = ''
      var tGlue = ''
    
      if (arguments.length === 1) {
        pieces = glue
        glue = ''
      }
    
      if (typeof pieces === 'object') {
        if (Object.prototype.toString.call(pieces) === '[object Array]') {
          return pieces.join(glue)
        }
        for (i in pieces) {
          retVal += tGlue + pieces[i]
          tGlue = glue
        }
        return retVal
      }
    
      return pieces
    }
  );

  $php.context.function.declare(
    '\\join', [
      {"name":"glue","type":"string"},
      {"name":"pieces","type":"array"}
    ],
    'string', function join(glue, pieces) {
      //  discuss at: http://locutus.io/php/join/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: join(' ', ['Kevin', 'van', 'Zonneveld'])
      //   returns 1: 'Kevin van Zonneveld'
    
      var implode = require('../strings/implode')
      return implode(glue, pieces)
    }
  );

  $php.context.function.declare(
    '\\lcfirst', [
      {"name":"str","type":"mixed"}
    ],
    'mixed', function lcfirst(str) {
      //  discuss at: http://locutus.io/php/lcfirst/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: lcfirst('Kevin Van Zonneveld')
      //   returns 1: 'kevin Van Zonneveld'
    
      str += ''
      var f = str.charAt(0)
        .toLowerCase()
      return f + str.substr(1)
    }
  );

  $php.context.function.declare(
    '\\levenshtein', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"},
      {"name":"cost_ins","type":"int"},
      {"name":"cost_rep","type":"int"},
      {"name":"cost_del","type":"int"}
    ],
    'int', function levenshtein(s1, s2, costIns, costRep, costDel) {
      //       discuss at: http://locutus.io/php/levenshtein/
      //      original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
      //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //       revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      // reimplemented by: Alexander M Beedie
      // reimplemented by: Rafał Kukawski (http://blog.kukawski.pl)
      //        example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld')
      //        returns 1: 3
      //        example 2: levenshtein("carrrot", "carrots")
      //        returns 2: 2
      //        example 3: levenshtein("carrrot", "carrots", 2, 3, 4)
      //        returns 3: 6
    
      // var LEVENSHTEIN_MAX_LENGTH = 255 // PHP limits the function to max 255 character-long strings
    
      costIns = costIns == null ? 1 : +costIns
      costRep = costRep == null ? 1 : +costRep
      costDel = costDel == null ? 1 : +costDel
    
      if (s1 === s2) {
        return 0
      }
    
      var l1 = s1.length
      var l2 = s2.length
    
      if (l1 === 0) {
        return l2 * costIns
      }
      if (l2 === 0) {
        return l1 * costDel
      }
    
      // Enable the 3 lines below to set the same limits on string length as PHP does
      // if (l1 > LEVENSHTEIN_MAX_LENGTH || l2 > LEVENSHTEIN_MAX_LENGTH) {
      //   return -1;
      // }
    
      var split = false
      try {
        split = !('0')[0]
      } catch (e) {
        // Earlier IE may not support access by string index
        split = true
      }
    
      if (split) {
        s1 = s1.split('')
        s2 = s2.split('')
      }
    
      var p1 = new Array(l2 + 1)
      var p2 = new Array(l2 + 1)
    
      var i1, i2, c0, c1, c2, tmp
    
      for (i2 = 0; i2 <= l2; i2++) {
        p1[i2] = i2 * costIns
      }
    
      for (i1 = 0; i1 < l1; i1++) {
        p2[0] = p1[0] + costDel
    
        for (i2 = 0; i2 < l2; i2++) {
          c0 = p1[i2] + ((s1[i1] === s2[i2]) ? 0 : costRep)
          c1 = p1[i2 + 1] + costDel
    
          if (c1 < c0) {
            c0 = c1
          }
    
          c2 = p2[i2] + costIns
    
          if (c2 < c0) {
            c0 = c2
          }
    
          p2[i2 + 1] = c0
        }
    
        tmp = p1
        p1 = p2
        p2 = tmp
      }
    
      c0 = p1[l2]
    
      return c0
    }
  );

  $php.context.function.declare(
    '\\localeconv', [],
    'array', function localeconv() {
      //  discuss at: http://locutus.io/php/localeconv/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: setlocale('LC_ALL', 'en_US')
      //   example 1: localeconv()
      //   returns 1: {decimal_point: '.', thousands_sep: '', positive_sign: '', negative_sign: '-', int_frac_digits: 2, frac_digits: 2, p_cs_precedes: 1, p_sep_by_space: 0, n_cs_precedes: 1, n_sep_by_space: 0, p_sign_posn: 1, n_sign_posn: 1, grouping: [], int_curr_symbol: 'USD ', currency_symbol: '$', mon_decimal_point: '.', mon_thousands_sep: ',', mon_grouping: [3, 3]}
    
      var setlocale = require('../strings/setlocale')
    
      var arr = {}
      var prop = ''
    
      // ensure setup of localization variables takes place, if not already
      setlocale('LC_ALL', 0)
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      // Make copies
      for (prop in $locutus.php.locales[$locutus.php.localeCategories.LC_NUMERIC].LC_NUMERIC) {
        arr[prop] = $locutus.php.locales[$locutus.php.localeCategories.LC_NUMERIC].LC_NUMERIC[prop]
      }
      for (prop in $locutus.php.locales[$locutus.php.localeCategories.LC_MONETARY].LC_MONETARY) {
        arr[prop] = $locutus.php.locales[$locutus.php.localeCategories.LC_MONETARY].LC_MONETARY[prop]
      }
    
      return arr
    }
  );

  $php.context.function.declare(
    '\\ltrim', [
      {"name":"str","type":"string"},
      {"name":"charlist","type":"string"}
    ],
    'string', function ltrim(str, charlist) {
      //  discuss at: http://locutus.io/php/ltrim/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Erkekjetter
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: ltrim('    Kevin van Zonneveld    ')
      //   returns 1: 'Kevin van Zonneveld    '
    
      charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
        .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^:])/g, '$1')
    
      var re = new RegExp('^[' + charlist + ']+', 'g')
    
      return (str + '')
        .replace(re, '')
    }
  );

  $php.context.function.declare(
    '\\md5', [
      {"name":"str","type":"string"},
      {"name":"raw_output","type":"bool"}
    ],
    'string', function md5(str) {
      //  discuss at: http://locutus.io/php/md5/
      // original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // improved by: Michael White (http://getsprink.com)
      // improved by: Jack
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      note 1: Keep in mind that in accordance with PHP, the whole string is buffered and then
      //      note 1: hashed. If available, we'd recommend using Node's native crypto modules directly
      //      note 1: in a steaming fashion for faster and more efficient hashing
      //   example 1: md5('Kevin van Zonneveld')
      //   returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'
    
      var hash
      try {
        var crypto = require('crypto')
        var md5sum = crypto.createHash('md5')
        md5sum.update(str)
        hash = md5sum.digest('hex')
      } catch (e) {
        hash = undefined
      }
    
      if (hash !== undefined) {
        return hash
      }
    
      var utf8Encode = require('../xml/utf8_encode')
      var xl
    
      var _rotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
      }
    
      var _addUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult
        lX8 = (lX & 0x80000000)
        lY8 = (lY & 0x80000000)
        lX4 = (lX & 0x40000000)
        lY4 = (lY & 0x40000000)
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF)
        if (lX4 & lY4) {
          return (lResult ^ 0x80000000 ^ lX8 ^ lY8)
        }
        if (lX4 | lY4) {
          if (lResult & 0x40000000) {
            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8)
          } else {
            return (lResult ^ 0x40000000 ^ lX8 ^ lY8)
          }
        } else {
          return (lResult ^ lX8 ^ lY8)
        }
      }
    
      var _F = function (x, y, z) {
        return (x & y) | ((~x) & z)
      }
      var _G = function (x, y, z) {
        return (x & z) | (y & (~z))
      }
      var _H = function (x, y, z) {
        return (x ^ y ^ z)
      }
      var _I = function (x, y, z) {
        return (y ^ (x | (~z)))
      }
    
      var _FF = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_F(b, c, d), x), ac))
        return _addUnsigned(_rotateLeft(a, s), b)
      }
    
      var _GG = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_G(b, c, d), x), ac))
        return _addUnsigned(_rotateLeft(a, s), b)
      }
    
      var _HH = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_H(b, c, d), x), ac))
        return _addUnsigned(_rotateLeft(a, s), b)
      }
    
      var _II = function (a, b, c, d, x, s, ac) {
        a = _addUnsigned(a, _addUnsigned(_addUnsigned(_I(b, c, d), x), ac))
        return _addUnsigned(_rotateLeft(a, s), b)
      }
    
      var _convertToWordArray = function (str) {
        var lWordCount
        var lMessageLength = str.length
        var lNumberOfWordsTemp1 = lMessageLength + 8
        var lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64
        var lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16
        var lWordArray = new Array(lNumberOfWords - 1)
        var lBytePosition = 0
        var lByteCount = 0
        while (lByteCount < lMessageLength) {
          lWordCount = (lByteCount - (lByteCount % 4)) / 4
          lBytePosition = (lByteCount % 4) * 8
          lWordArray[lWordCount] = (lWordArray[lWordCount] |
            (str.charCodeAt(lByteCount) << lBytePosition))
          lByteCount++
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4
        lBytePosition = (lByteCount % 4) * 8
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition)
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
        return lWordArray
      }
    
      var _wordToHex = function (lValue) {
        var wordToHexValue = ''
        var wordToHexValueTemp = ''
        var lByte
        var lCount
    
        for (lCount = 0; lCount <= 3; lCount++) {
          lByte = (lValue >>> (lCount * 8)) & 255
          wordToHexValueTemp = '0' + lByte.toString(16)
          wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2)
        }
        return wordToHexValue
      }
    
      var x = []
      var k
      var AA
      var BB
      var CC
      var DD
      var a
      var b
      var c
      var d
      var S11 = 7
      var S12 = 12
      var S13 = 17
      var S14 = 22
      var S21 = 5
      var S22 = 9
      var S23 = 14
      var S24 = 20
      var S31 = 4
      var S32 = 11
      var S33 = 16
      var S34 = 23
      var S41 = 6
      var S42 = 10
      var S43 = 15
      var S44 = 21
    
      str = utf8Encode(str)
      x = _convertToWordArray(str)
      a = 0x67452301
      b = 0xEFCDAB89
      c = 0x98BADCFE
      d = 0x10325476
    
      xl = x.length
      for (k = 0; k < xl; k += 16) {
        AA = a
        BB = b
        CC = c
        DD = d
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478)
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756)
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB)
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE)
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF)
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A)
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613)
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501)
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8)
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF)
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1)
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE)
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122)
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193)
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E)
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821)
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562)
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340)
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51)
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA)
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D)
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453)
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681)
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8)
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6)
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6)
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87)
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED)
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905)
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8)
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9)
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A)
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942)
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681)
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122)
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C)
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44)
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9)
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60)
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70)
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6)
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA)
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085)
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05)
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039)
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5)
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8)
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665)
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244)
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97)
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7)
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039)
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3)
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92)
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D)
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1)
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F)
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0)
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314)
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1)
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82)
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235)
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB)
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391)
        a = _addUnsigned(a, AA)
        b = _addUnsigned(b, BB)
        c = _addUnsigned(c, CC)
        d = _addUnsigned(d, DD)
      }
    
      var temp = _wordToHex(a) + _wordToHex(b) + _wordToHex(c) + _wordToHex(d)
    
      return temp.toLowerCase()
    }
  );

  $php.context.function.declare(
    '\\md5_file', [
      {"name":"filename","type":"string"},
      {"name":"raw_output","type":"bool"}
    ],
    'string', function md5_file(str_filename) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/md5_file/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //      note 1: Relies on file_get_contents which does not work in the browser, so Node only.
      //      note 2: Keep in mind that in accordance with PHP, the whole file is buffered and then
      //      note 2: hashed. We'd recommend Node's native crypto modules for faster and more
      //      note 2: efficient hashing
      //   example 1: md5_file('test/never-change.txt')
      //   returns 1: 'bc3aa724b0ec7dce4c26e7f4d0d9b064'
    
      var fileGetContents = require('../filesystem/file_get_contents')
      var md5 = require('../strings/md5')
      var buf = fileGetContents(str_filename)
    
      if (buf === false) {
        return false
      }
    
      return md5(buf)
    }
  );

  $php.context.function.declare(
    '\\metaphone', [
      {"name":"str","type":"string"},
      {"name":"phonemes","type":"int"}
    ],
    'string', function metaphone(word, maxPhonemes) {
      //  discuss at: http://locutus.io/php/metaphone/
      // original by: Greg Frazier
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Rafał Kukawski (http://blog.kukawski.pl)
      //   example 1: metaphone('Gnu')
      //   returns 1: 'N'
      //   example 2: metaphone('bigger')
      //   returns 2: 'BKR'
      //   example 3: metaphone('accuracy')
      //   returns 3: 'AKKRS'
      //   example 4: metaphone('batch batcher')
      //   returns 4: 'BXBXR'
    
      var type = typeof word
    
      if (type === 'undefined' || type === 'object' && word !== null) {
        // weird!
        return null
      }
    
      // infinity and NaN values are treated as strings
      if (type === 'number') {
        if (isNaN(word)) {
          word = 'NAN'
        } else if (!isFinite(word)) {
          word = 'INF'
        }
      }
    
      if (maxPhonemes < 0) {
        return false
      }
    
      maxPhonemes = Math.floor(+maxPhonemes) || 0
    
      // alpha depends on locale, so this var might need an update
      // or should be turned into a regex
      // for now assuming pure a-z
      var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      var vowel = 'AEIOU'
      var soft = 'EIY'
      var leadingNonAlpha = new RegExp('^[^' + alpha + ']+')
    
      word = typeof word === 'string' ? word : ''
      word = word.toUpperCase().replace(leadingNonAlpha, '')
    
      if (!word) {
        return ''
      }
    
      var is = function (p, c) {
        return c !== '' && p.indexOf(c) !== -1
      }
    
      var i = 0
      var cc = word.charAt(0) // current char. Short name because it's used all over the function
      var nc = word.charAt(1)  // next char
      var nnc // after next char
      var pc // previous char
      var l = word.length
      var meta = ''
      // traditional is an internal param that could be exposed for now let it be a local var
      var traditional = true
    
      switch (cc) {
        case 'A':
          meta += nc === 'E' ? nc : cc
          i += 1
          break
        case 'G':
        case 'K':
        case 'P':
          if (nc === 'N') {
            meta += nc
            i += 2
          }
          break
        case 'W':
          if (nc === 'R') {
            meta += nc
            i += 2
          } else if (nc === 'H' || is(vowel, nc)) {
            meta += 'W'
            i += 2
          }
          break
        case 'X':
          meta += 'S'
          i += 1
          break
        case 'E':
        case 'I':
        case 'O':
        case 'U':
          meta += cc
          i++
          break
      }
    
      for (; i < l && (maxPhonemes === 0 || meta.length < maxPhonemes); i += 1) { // eslint-disable-line no-unmodified-loop-condition,max-len
        cc = word.charAt(i)
        nc = word.charAt(i + 1)
        pc = word.charAt(i - 1)
        nnc = word.charAt(i + 2)
    
        if (cc === pc && cc !== 'C') {
          continue
        }
    
        switch (cc) {
          case 'B':
            if (pc !== 'M') {
              meta += cc
            }
            break
          case 'C':
            if (is(soft, nc)) {
              if (nc === 'I' && nnc === 'A') {
                meta += 'X'
              } else if (pc !== 'S') {
                meta += 'S'
              }
            } else if (nc === 'H') {
              meta += !traditional && (nnc === 'R' || pc === 'S') ? 'K' : 'X'
              i += 1
            } else {
              meta += 'K'
            }
            break
          case 'D':
            if (nc === 'G' && is(soft, nnc)) {
              meta += 'J'
              i += 1
            } else {
              meta += 'T'
            }
            break
          case 'G':
            if (nc === 'H') {
              if (!(is('BDH', word.charAt(i - 3)) || word.charAt(i - 4) === 'H')) {
                meta += 'F'
                i += 1
              }
            } else if (nc === 'N') {
              if (is(alpha, nnc) && word.substr(i + 1, 3) !== 'NED') {
                meta += 'K'
              }
            } else if (is(soft, nc) && pc !== 'G') {
              meta += 'J'
            } else {
              meta += 'K'
            }
            break
          case 'H':
            if (is(vowel, nc) && !is('CGPST', pc)) {
              meta += cc
            }
            break
          case 'K':
            if (pc !== 'C') {
              meta += 'K'
            }
            break
          case 'P':
            meta += nc === 'H' ? 'F' : cc
            break
          case 'Q':
            meta += 'K'
            break
          case 'S':
            if (nc === 'I' && is('AO', nnc)) {
              meta += 'X'
            } else if (nc === 'H') {
              meta += 'X'
              i += 1
            } else if (!traditional && word.substr(i + 1, 3) === 'CHW') {
              meta += 'X'
              i += 2
            } else {
              meta += 'S'
            }
            break
          case 'T':
            if (nc === 'I' && is('AO', nnc)) {
              meta += 'X'
            } else if (nc === 'H') {
              meta += '0'
              i += 1
            } else if (word.substr(i + 1, 2) !== 'CH') {
              meta += 'T'
            }
            break
          case 'V':
            meta += 'F'
            break
          case 'W':
          case 'Y':
            if (is(vowel, nc)) {
              meta += cc
            }
            break
          case 'X':
            meta += 'KS'
            break
          case 'Z':
            meta += 'S'
            break
          case 'F':
          case 'J':
          case 'L':
          case 'M':
          case 'N':
          case 'R':
            meta += cc
            break
        }
      }
    
      return meta
    }
  );

  $php.context.function.declare(
    '\\money_format', [
      {"name":"format","type":"string"},
      {"name":"number","type":"float"}
    ],
    'string', function money_format(format, number) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/money_format/
      // original by: Brett Zamir (http://brett-zamir.me)
      //    input by: daniel airton wermann (http://wermann.com.br)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      note 1: This depends on setlocale having the appropriate
      //      note 1: locale (these examples use 'en_US')
      //   example 1: money_format('%i', 1234.56)
      //   returns 1: ' USD 1,234.56'
      //   example 2: money_format('%14#8.2n', 1234.5678)
      //   returns 2: ' $     1,234.57'
      //   example 3: money_format('%14#8.2n', -1234.5678)
      //   returns 3: '-$     1,234.57'
      //   example 4: money_format('%(14#8.2n', 1234.5678)
      //   returns 4: ' $     1,234.57 '
      //   example 5: money_format('%(14#8.2n', -1234.5678)
      //   returns 5: '($     1,234.57)'
      //   example 6: money_format('%=014#8.2n', 1234.5678)
      //   returns 6: ' $000001,234.57'
      //   example 7: money_format('%=014#8.2n', -1234.5678)
      //   returns 7: '-$000001,234.57'
      //   example 8: money_format('%=*14#8.2n', 1234.5678)
      //   returns 8: ' $*****1,234.57'
      //   example 9: money_format('%=*14#8.2n', -1234.5678)
      //   returns 9: '-$*****1,234.57'
      //  example 10: money_format('%=*^14#8.2n', 1234.5678)
      //  returns 10: '  $****1234.57'
      //  example 11: money_format('%=*^14#8.2n', -1234.5678)
      //  returns 11: ' -$****1234.57'
      //  example 12: money_format('%=*!14#8.2n', 1234.5678)
      //  returns 12: ' *****1,234.57'
      //  example 13: money_format('%=*!14#8.2n', -1234.5678)
      //  returns 13: '-*****1,234.57'
      //  example 14: money_format('%i', 3590)
      //  returns 14: ' USD 3,590.00'
    
      var setlocale = require('../strings/setlocale')
    
      // Per PHP behavior, there seems to be no extra padding
      // for sign when there is a positive number, though my
      // understanding of the description is that there should be padding;
      // need to revisit examples
    
      // Helpful info at http://ftp.gnu.org/pub/pub/old-gnu/Manuals/glibc-2.2.3/html_chapter/libc_7.html
      // and http://publib.boulder.ibm.com/infocenter/zos/v1r10/index.jsp?topic=/com.ibm.zos.r10.bpxbd00/strfmp.htm
    
      if (typeof number !== 'number') {
        return null
      }
      // 1: flags, 3: width, 5: left, 7: right, 8: conversion
      var regex = /%((=.|[+^(!-])*?)(\d*?)(#(\d+))?(\.(\d+))?([in%])/g
    
      // Ensure the locale data we need is set up
      setlocale('LC_ALL', 0)
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      var monetary = $locutus.php.locales[$locutus.php.localeCategories.LC_MONETARY].LC_MONETARY
    
      var doReplace = function (n0, flags, n2, width, n4, left, n6, right, conversion) {
        var value = ''
        var repl = ''
        if (conversion === '%') {
          // Percent does not seem to be allowed with intervening content
          return '%'
        }
        var fill = flags && (/=./).test(flags) ? flags.match(/=(.)/)[1] : ' ' // flag: =f (numeric fill)
        // flag: ! (suppress currency symbol)
        var showCurrSymbol = !flags || flags.indexOf('!') === -1
        // field width: w (minimum field width)
        width = parseInt(width, 10) || 0
    
        var neg = number < 0
        // Convert to string
        number = number + ''
        // We don't want negative symbol represented here yet
        number = neg ? number.slice(1) : number
    
        var decpos = number.indexOf('.')
        // Get integer portion
        var integer = decpos !== -1 ? number.slice(0, decpos) : number
        // Get decimal portion
        var fraction = decpos !== -1 ? number.slice(decpos + 1) : ''
    
        var _strSplice = function (integerStr, idx, thouSep) {
          var integerArr = integerStr.split('')
          integerArr.splice(idx, 0, thouSep)
          return integerArr.join('')
        }
    
        var intLen = integer.length
        left = parseInt(left, 10)
        var filler = intLen < left
        if (filler) {
          var fillnum = left - intLen
          integer = new Array(fillnum + 1).join(fill) + integer
        }
        if (flags.indexOf('^') === -1) {
          // flag: ^ (disable grouping characters (of locale))
          // use grouping characters
          // ','
          var thouSep = monetary.mon_thousands_sep
          // [3] (every 3 digits in U.S.A. locale)
          var monGrouping = monetary.mon_grouping
    
          if (monGrouping[0] < integer.length) {
            for (var i = 0, idx = integer.length; i < monGrouping.length; i++) {
              // e.g., 3
              idx -= monGrouping[i]
              if (idx <= 0) {
                break
              }
              if (filler && idx < fillnum) {
                thouSep = fill
              }
              integer = _strSplice(integer, idx, thouSep)
            }
          }
          if (monGrouping[i - 1] > 0) {
            // Repeating last grouping (may only be one) until highest portion of integer reached
            while (idx > monGrouping[i - 1]) {
              idx -= monGrouping[i - 1]
              if (filler && idx < fillnum) {
                thouSep = fill
              }
              integer = _strSplice(integer, idx, thouSep)
            }
          }
        }
    
        // left, right
        if (right === '0') {
          // No decimal or fractional digits
          value = integer
        } else {
          // '.'
          var decPt = monetary.mon_decimal_point
          if (right === '' || right === undefined) {
            right = conversion === 'i' ? monetary.int_frac_digits : monetary.frac_digits
          }
          right = parseInt(right, 10)
    
          if (right === 0) {
            // Only remove fractional portion if explicitly set to zero digits
            fraction = ''
            decPt = ''
          } else if (right < fraction.length) {
            fraction = Math.round(parseFloat(
              fraction.slice(0, right) + '.' + fraction.substr(right, 1)
            ))
            if (right > fraction.length) {
              fraction = new Array(right - fraction.length + 1).join('0') + fraction // prepend with 0's
            }
          } else if (right > fraction.length) {
            fraction += new Array(right - fraction.length + 1).join('0') // pad with 0's
          }
          value = integer + decPt + fraction
        }
    
        var symbol = ''
        if (showCurrSymbol) {
          // 'i' vs. 'n' ('USD' vs. '$')
          symbol = conversion === 'i' ? monetary.int_curr_symbol : monetary.currency_symbol
        }
        var signPosn = neg ? monetary.n_sign_posn : monetary.p_sign_posn
    
        // 0: no space between curr. symbol and value
        // 1: space sep. them unless symb. and sign are adjacent then space sep. them from value
        // 2: space sep. sign and value unless symb. and sign are adjacent then space separates
        var sepBySpace = neg ? monetary.n_sep_by_space : monetary.p_sep_by_space
    
        // p_cs_precedes, n_cs_precedes
        // positive currency symbol follows value = 0; precedes value = 1
        var csPrecedes = neg ? monetary.n_cs_precedes : monetary.p_cs_precedes
    
        // Assemble symbol/value/sign and possible space as appropriate
        if (flags.indexOf('(') !== -1) {
          // flag: parenth. for negative
          // @todo: unclear on whether and how sepBySpace, signPosn, or csPrecedes have
          // an impact here (as they do below), but assuming for now behaves as signPosn 0 as
          // far as localized sepBySpace and signPosn behavior
          repl = (csPrecedes ? symbol + (sepBySpace === 1 ? ' ' : '') : '') + value + (!csPrecedes ? (
            sepBySpace === 1 ? ' ' : '') + symbol : '')
          if (neg) {
            repl = '(' + repl + ')'
          } else {
            repl = ' ' + repl + ' '
          }
        } else {
          // '+' is default
          // ''
          var posSign = monetary.positive_sign
          // '-'
          var negSign = monetary.negative_sign
          var sign = neg ? (negSign) : (posSign)
          var otherSign = neg ? (posSign) : (negSign)
          var signPadding = ''
          if (signPosn) {
            // has a sign
            signPadding = new Array(otherSign.length - sign.length + 1).join(' ')
          }
    
          var valueAndCS = ''
          switch (signPosn) {
            // 0: parentheses surround value and curr. symbol;
            // 1: sign precedes them;
            // 2: sign follows them;
            // 3: sign immed. precedes curr. symbol; (but may be space between)
            // 4: sign immed. succeeds curr. symbol; (but may be space between)
            case 0:
              valueAndCS = csPrecedes
                ? symbol + (sepBySpace === 1 ? ' ' : '') + value
                : value + (sepBySpace === 1 ? ' ' : '') + symbol
              repl = '(' + valueAndCS + ')'
              break
            case 1:
              valueAndCS = csPrecedes
                ? symbol + (sepBySpace === 1 ? ' ' : '') + value
                : value + (sepBySpace === 1 ? ' ' : '') + symbol
              repl = signPadding + sign + (sepBySpace === 2 ? ' ' : '') + valueAndCS
              break
            case 2:
              valueAndCS = csPrecedes
                ? symbol + (sepBySpace === 1 ? ' ' : '') + value
                : value + (sepBySpace === 1 ? ' ' : '') + symbol
              repl = valueAndCS + (sepBySpace === 2 ? ' ' : '') + sign + signPadding
              break
            case 3:
              repl = csPrecedes
                ? signPadding + sign + (sepBySpace === 2 ? ' ' : '') + symbol +
                  (sepBySpace === 1 ? ' ' : '') + value
                : value + (sepBySpace === 1 ? ' ' : '') + sign + signPadding +
                  (sepBySpace === 2 ? ' ' : '') + symbol
              break
            case 4:
              repl = csPrecedes
                ? symbol + (sepBySpace === 2 ? ' ' : '') + signPadding + sign +
                  (sepBySpace === 1 ? ' ' : '') + value
                : value + (sepBySpace === 1 ? ' ' : '') + symbol +
                  (sepBySpace === 2 ? ' ' : '') + sign + signPadding
              break
          }
        }
    
        var padding = width - repl.length
        if (padding > 0) {
          padding = new Array(padding + 1).join(' ')
          // @todo: How does p_sep_by_space affect the count if there is a space?
          // Included in count presumably?
          if (flags.indexOf('-') !== -1) {
            // left-justified (pad to right)
            repl += padding
          } else {
            // right-justified (pad to left)
            repl = padding + repl
          }
        }
        return repl
      }
    
      return format.replace(regex, doReplace)
    }
  );

  $php.context.function.declare(
    '\\nl2br', [
      {"name":"string","type":"string"},
      {"name":"is_xhtml","type":"bool"}
    ],
    'string', function nl2br(str, isXhtml) {
      //  discuss at: http://locutus.io/php/nl2br/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Philip Peterson
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Atli Þór
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Maximusya
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Reynier de la Rosa (http://scriptinside.blogspot.com.es/)
      //    input by: Brett Zamir (http://brett-zamir.me)
      //   example 1: nl2br('Kevin\nvan\nZonneveld')
      //   returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
      //   example 2: nl2br("\nOne\nTwo\n\nThree\n", false)
      //   returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
      //   example 3: nl2br("\nOne\nTwo\n\nThree\n", true)
      //   returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
      //   example 4: nl2br(null)
      //   returns 4: ''
    
      // Some latest browsers when str is null return and unexpected null value
      if (typeof str === 'undefined' || str === null) {
        return ''
      }
    
      // Adjust comment to avoid issue on locutus.io display
      var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br ' + '/>' : '<br>'
    
      return (str + '')
        .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2')
    }
  );

  $php.context.function.declare(
    '\\nl_langinfo', [
      {"name":"item","type":"int"}
    ],
    'string', function nl_langinfo(item) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/nl_langinfo/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: nl_langinfo('DAY_1')
      //   returns 1: 'Sunday'
    
      var setlocale = require('../strings/setlocale')
    
      setlocale('LC_ALL', 0) // Ensure locale data is available
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      var loc = $locutus.php.locales[$locutus.php.localeCategories.LC_TIME]
      if (item.indexOf('ABDAY_') === 0) {
        return loc.LC_TIME.a[parseInt(item.replace(/^ABDAY_/, ''), 10) - 1]
      } else if (item.indexOf('DAY_') === 0) {
        return loc.LC_TIME.A[parseInt(item.replace(/^DAY_/, ''), 10) - 1]
      } else if (item.indexOf('ABMON_') === 0) {
        return loc.LC_TIME.b[parseInt(item.replace(/^ABMON_/, ''), 10) - 1]
      } else if (item.indexOf('MON_') === 0) {
        return loc.LC_TIME.B[parseInt(item.replace(/^MON_/, ''), 10) - 1]
      } else {
        switch (item) {
          // More LC_TIME
          case 'AM_STR':
            return loc.LC_TIME.p[0]
          case 'PM_STR':
            return loc.LC_TIME.p[1]
          case 'D_T_FMT':
            return loc.LC_TIME.c
          case 'D_FMT':
            return loc.LC_TIME.x
          case 'T_FMT':
            return loc.LC_TIME.X
          case 'T_FMT_AMPM':
            return loc.LC_TIME.r
          case 'ERA':
          case 'ERA_YEAR':
          case 'ERA_D_T_FMT':
          case 'ERA_D_FMT':
          case 'ERA_T_FMT':
            // all fall-throughs
            return loc.LC_TIME[item]
        }
        loc = $locutus.php.locales[$locutus.php.localeCategories.LC_MONETARY]
        if (item === 'CRNCYSTR') {
          // alias
          item = 'CURRENCY_SYMBOL'
        }
        switch (item) {
          case 'INT_CURR_SYMBOL':
          case 'CURRENCY_SYMBOL':
          case 'MON_DECIMAL_POINT':
          case 'MON_THOUSANDS_SEP':
          case 'POSITIVE_SIGN':
          case 'NEGATIVE_SIGN':
          case 'INT_FRAC_DIGITS':
          case 'FRAC_DIGITS':
          case 'P_CS_PRECEDES':
          case 'P_SEP_BY_SPACE':
          case 'N_CS_PRECEDES':
          case 'N_SEP_BY_SPACE':
          case 'P_SIGN_POSN':
          case 'N_SIGN_POSN':
            // all fall-throughs
            return loc.LC_MONETARY[item.toLowerCase()]
          case 'MON_GROUPING':
            // Same as above, or return something different since this returns an array?
            return loc.LC_MONETARY[item.toLowerCase()]
        }
        loc = $locutus.php.locales[$locutus.php.localeCategories.LC_NUMERIC]
        switch (item) {
          case 'RADIXCHAR':
          case 'DECIMAL_POINT':
            // Fall-through
            return loc.LC_NUMERIC[item.toLowerCase()]
          case 'THOUSEP':
          case 'THOUSANDS_SEP':
            // Fall-through
            return loc.LC_NUMERIC[item.toLowerCase()]
          case 'GROUPING':
            // Same as above, or return something different since this returns an array?
            return loc.LC_NUMERIC[item.toLowerCase()]
        }
        loc = $locutus.php.locales[$locutus.php.localeCategories.LC_MESSAGES]
        switch (item) {
          case 'YESEXPR':
          case 'NOEXPR':
          case 'YESSTR':
          case 'NOSTR':
            // all fall-throughs
            return loc.LC_MESSAGES[item]
        }
        loc = $locutus.php.locales[$locutus.php.localeCategories.LC_CTYPE]
        if (item === 'CODESET') {
          return loc.LC_CTYPE[item]
        }
    
        return false
      }
    }
  );

  $php.context.function.declare(
    '\\number_format', [
      {"name":"number","type":"float"},
      {"name":"decimals","type":"int"},
      {"name":"dec_point","type":"string"},
      {"name":"thousands_sep","type":"string"}
    ],
    'string', function number_format(number, decimals, decPoint, thousandsSep) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/number_format/
      // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: davook
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Theriault (https://github.com/Theriault)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Michael White (http://getsprink.com)
      // bugfixed by: Benjamin Lupton
      // bugfixed by: Allan Jensen (http://www.winternet.no)
      // bugfixed by: Howard Yeend
      // bugfixed by: Diogo Resende
      // bugfixed by: Rival
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      //  revised by: Luke Smith (http://lucassmith.name)
      //    input by: Kheang Hok Chin (http://www.distantia.ca/)
      //    input by: Jay Klehr
      //    input by: Amir Habibi (http://www.residence-mixte.com/)
      //    input by: Amirouche
      //   example 1: number_format(1234.56)
      //   returns 1: '1,235'
      //   example 2: number_format(1234.56, 2, ',', ' ')
      //   returns 2: '1 234,56'
      //   example 3: number_format(1234.5678, 2, '.', '')
      //   returns 3: '1234.57'
      //   example 4: number_format(67, 2, ',', '.')
      //   returns 4: '67,00'
      //   example 5: number_format(1000)
      //   returns 5: '1,000'
      //   example 6: number_format(67.311, 2)
      //   returns 6: '67.31'
      //   example 7: number_format(1000.55, 1)
      //   returns 7: '1,000.6'
      //   example 8: number_format(67000, 5, ',', '.')
      //   returns 8: '67.000,00000'
      //   example 9: number_format(0.9, 0)
      //   returns 9: '1'
      //  example 10: number_format('1.20', 2)
      //  returns 10: '1.20'
      //  example 11: number_format('1.20', 4)
      //  returns 11: '1.2000'
      //  example 12: number_format('1.2000', 3)
      //  returns 12: '1.200'
      //  example 13: number_format('1 000,50', 2, '.', ' ')
      //  returns 13: '100 050.00'
      //  example 14: number_format(1e-8, 8, '.', '')
      //  returns 14: '0.00000001'
    
      number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
      var n = !isFinite(+number) ? 0 : +number
      var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
      var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
      var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
      var s = ''
    
      var toFixedFix = function (n, prec) {
        var k = Math.pow(10, prec)
        return '' + (Math.round(n * k) / k)
          .toFixed(prec)
      }
    
      // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
      s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
      if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
      }
      if ((s[1] || '').length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
      }
    
      return s.join(dec)
    }
  );

  $php.context.function.declare(
    '\\ord', [
      {"name":"string","type":"string"}
    ],
    'int', function ord(string) {
      //  discuss at: http://locutus.io/php/ord/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //    input by: incidence
      //   example 1: ord('K')
      //   returns 1: 75
      //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
      //   returns 2: 65536
    
      var str = string + ''
      var code = str.charCodeAt(0)
    
      if (code >= 0xD800 && code <= 0xDBFF) {
        // High surrogate (could change last hex to 0xDB7F to treat
        // high private surrogates as single characters)
        var hi = code
        if (str.length === 1) {
          // This is just a high surrogate with no following low surrogate,
          // so we return its value;
          return code
          // we could also throw an error as it is not a complete character,
          // but someone may want to know
        }
        var low = str.charCodeAt(1)
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
      }
      if (code >= 0xDC00 && code <= 0xDFFF) {
        // Low surrogate
        // This is just a low surrogate with no preceding high surrogate,
        // so we return its value;
        return code
        // we could also throw an error as it is not a complete character,
        // but someone may want to know
      }
    
      return code
    }
  );

  $php.context.function.declare(
    '\\parse_str', [
      {"name":"str","type":"string"},
      {"name":"arr","type":"\\array"}
    ],
    'void', function parse_str(str, array) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/parse_str/
      //      original by: Cagri Ekin
      //      improved by: Michael White (http://getsprink.com)
      //      improved by: Jack
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: stag019
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
      // reimplemented by: stag019
      //         input by: Dreamer
      //         input by: Zaide (http://zaidesthings.com/)
      //         input by: David Pesta (http://davidpesta.com/)
      //         input by: jeicquest
      //           note 1: When no argument is specified, will put variables in global scope.
      //           note 1: When a particular argument has been passed, and the
      //           note 1: returned value is different parse_str of PHP.
      //           note 1: For example, a=b=c&d====c
      //        example 1: var $arr = {}
      //        example 1: parse_str('first=foo&second=bar', $arr)
      //        example 1: var $result = $arr
      //        returns 1: { first: 'foo', second: 'bar' }
      //        example 2: var $arr = {}
      //        example 2: parse_str('str_a=Jack+and+Jill+didn%27t+see+the+well.', $arr)
      //        example 2: var $result = $arr
      //        returns 2: { str_a: "Jack and Jill didn't see the well." }
      //        example 3: var $abc = {3:'a'}
      //        example 3: parse_str('a[b]["c"]=def&a[q]=t+5', $abc)
      //        example 3: var $result = $abc
      //        returns 3: {"3":"a","a":{"b":{"c":"def"},"q":"t 5"}}
    
      var strArr = String(str).replace(/^&/, '').replace(/&$/, '').split('&')
      var sal = strArr.length
      var i
      var j
      var ct
      var p
      var lastObj
      var obj
      var undef
      var chr
      var tmp
      var key
      var value
      var postLeftBracketPos
      var keys
      var keysLen
    
      var _fixStr = function (str) {
        return decodeURIComponent(str.replace(/\+/g, '%20'))
      }
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      if (!array) {
        array = $global
      }
    
      for (i = 0; i < sal; i++) {
        tmp = strArr[i].split('=')
        key = _fixStr(tmp[0])
        value = (tmp.length < 2) ? '' : _fixStr(tmp[1])
    
        while (key.charAt(0) === ' ') {
          key = key.slice(1)
        }
        if (key.indexOf('\x00') > -1) {
          key = key.slice(0, key.indexOf('\x00'))
        }
        if (key && key.charAt(0) !== '[') {
          keys = []
          postLeftBracketPos = 0
          for (j = 0; j < key.length; j++) {
            if (key.charAt(j) === '[' && !postLeftBracketPos) {
              postLeftBracketPos = j + 1
            } else if (key.charAt(j) === ']') {
              if (postLeftBracketPos) {
                if (!keys.length) {
                  keys.push(key.slice(0, postLeftBracketPos - 1))
                }
                keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos))
                postLeftBracketPos = 0
                if (key.charAt(j + 1) !== '[') {
                  break
                }
              }
            }
          }
          if (!keys.length) {
            keys = [key]
          }
          for (j = 0; j < keys[0].length; j++) {
            chr = keys[0].charAt(j)
            if (chr === ' ' || chr === '.' || chr === '[') {
              keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1)
            }
            if (chr === '[') {
              break
            }
          }
    
          obj = array
          for (j = 0, keysLen = keys.length; j < keysLen; j++) {
            key = keys[j].replace(/^['"]/, '').replace(/['"]$/, '')
            lastObj = obj
            if ((key !== '' && key !== ' ') || j === 0) {
              if (obj[key] === undef) {
                obj[key] = {}
              }
              obj = obj[key]
            } else {
              // To insert new dimension
              ct = -1
              for (p in obj) {
                if (obj.hasOwnProperty(p)) {
                  if (+p > ct && p.match(/^\d+$/g)) {
                    ct = +p
                  }
                }
              }
              key = ct + 1
            }
          }
          lastObj[key] = value
        }
      }
    }
  );

  $php.context.function.declare(
    '\\printf', [
      {"name":"format","type":"string"},
      {"name":"args","type":"mixed"},
      {"name":"_","type":"mixed"}
    ],
    'int', function printf() {
      //  discuss at: http://locutus.io/php/printf/
      // original by: Ash Searle (http://hexmen.com/blog/)
      // improved by: Michael White (http://getsprink.com)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: printf("%01.2f", 123.1)
      //   returns 1: 6
    
      var sprintf = require('../strings/sprintf')
      var echo = require('../strings/echo')
      var ret = sprintf.apply(this, arguments)
      echo(ret)
      return ret.length
    }
  );

  $php.context.function.declare(
    '\\quoted_printable_decode', [
      {"name":"str","type":"string"}
    ],
    'string', function quoted_printable_decode(str) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/quoted_printable_decode/
      //      original by: Ole Vrijenhoek
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: Theriault (https://github.com/Theriault)
      // reimplemented by: Theriault (https://github.com/Theriault)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //        example 1: quoted_printable_decode('a=3Db=3Dc')
      //        returns 1: 'a=b=c'
      //        example 2: quoted_printable_decode('abc  =20\r\n123  =20\r\n')
      //        returns 2: 'abc   \r\n123   \r\n'
      //        example 3: quoted_printable_decode('012345678901234567890123456789012345678901234567890123456789012345678901234=\r\n56789')
      //        returns 3: '01234567890123456789012345678901234567890123456789012345678901234567890123456789'
      //        example 4: quoted_printable_decode("Lorem ipsum dolor sit amet=23, consectetur adipisicing elit")
      //        returns 4: 'Lorem ipsum dolor sit amet#, consectetur adipisicing elit'
    
      // Decodes all equal signs followed by two hex digits
      var RFC2045Decode1 = /=\r\n/gm
    
      // the RFC states against decoding lower case encodings, but following apparent PHP behavior
      var RFC2045Decode2IN = /=([0-9A-F]{2})/gim
      // RFC2045Decode2IN = /=([0-9A-F]{2})/gm,
    
      var RFC2045Decode2OUT = function (sMatch, sHex) {
        return String.fromCharCode(parseInt(sHex, 16))
      }
    
      return str.replace(RFC2045Decode1, '')
        .replace(RFC2045Decode2IN, RFC2045Decode2OUT)
    }
  );

  $php.context.function.declare(
    '\\quoted_printable_encode', [
      {"name":"str","type":"string"}
    ],
    'string', function quoted_printable_encode(str) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/quoted_printable_encode/
      // original by: Theriault (https://github.com/Theriault)
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Theriault (https://github.com/Theriault)
      //   example 1: quoted_printable_encode('a=b=c')
      //   returns 1: 'a=3Db=3Dc'
      //   example 2: quoted_printable_encode('abc   \r\n123   \r\n')
      //   returns 2: 'abc  =20\r\n123  =20\r\n'
      //   example 3: quoted_printable_encode('0123456789012345678901234567890123456789012345678901234567890123456789012345')
      //   returns 3: '012345678901234567890123456789012345678901234567890123456789012345678901234=\r\n5'
      //        test: skip-2
    
      var hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
      var RFC2045Encode1IN = / \r\n|\r\n|[^!-<>-~ ]/gm
      var RFC2045Encode1OUT = function (sMatch) {
        // Encode space before CRLF sequence to prevent spaces from being stripped
        // Keep hard line breaks intact; CRLF sequences
        if (sMatch.length > 1) {
          return sMatch.replace(' ', '=20')
        }
        // Encode matching character
        var chr = sMatch.charCodeAt(0)
        return '=' + hexChars[((chr >>> 4) & 15)] + hexChars[(chr & 15)]
      }
    
      // Split lines to 75 characters; the reason it's 75 and not 76 is because softline breaks are
      // preceeded by an equal sign; which would be the 76th character. However, if the last line/string
      // was exactly 76 characters, then a softline would not be needed. PHP currently softbreaks
      // anyway; so this function replicates PHP.
    
      var RFC2045Encode2IN = /.{1,72}(?!\r\n)[^=]{0,3}/g
      var RFC2045Encode2OUT = function (sMatch) {
        if (sMatch.substr(sMatch.length - 2) === '\r\n') {
          return sMatch
        }
        return sMatch + '=\r\n'
      }
    
      str = str
        .replace(RFC2045Encode1IN, RFC2045Encode1OUT)
        .replace(RFC2045Encode2IN, RFC2045Encode2OUT)
    
      // Strip last softline break
      return str.substr(0, str.length - 3)
    }
  );

  $php.context.function.declare(
    '\\quotemeta', [
      {"name":"str","type":"string"}
    ],
    'string', function quotemeta(str) {
      //  discuss at: http://locutus.io/php/quotemeta/
      // original by: Paulo Freitas
      //   example 1: quotemeta(". + * ? ^ ( $ )")
      //   returns 1: '\\. \\+ \\* \\? \\^ \\( \\$ \\)'
    
      return (str + '')
        .replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1')
    }
  );

  $php.context.function.declare(
    '\\rtrim', [
      {"name":"str","type":"string"},
      {"name":"charlist","type":"string"}
    ],
    'string', function rtrim(str, charlist) {
      //  discuss at: http://locutus.io/php/rtrim/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Erkekjetter
      //    input by: rem
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: rtrim('    Kevin van Zonneveld    ')
      //   returns 1: '    Kevin van Zonneveld'
    
      charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
        .replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^:])/g, '\\$1')
    
      var re = new RegExp('[' + charlist + ']+$', 'g')
    
      return (str + '').replace(re, '')
    }
  );

  $php.context.function.declare(
    '\\setlocale', [
      {"name":"category","type":"int"},
      {"name":"locale","type":"mixed"},
      {"name":"_","type":"mixed"}
    ],
    'mixed', function setlocale(category, locale) {
      //  discuss at: http://locutus.io/php/setlocale/
      // original by: Brett Zamir (http://brett-zamir.me)
      // original by: Blues (http://hacks.bluesmoon.info/strftime/strftime.js)
      // original by: YUI Library (http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html)
      //      note 1: Is extensible, but currently only implements locales en,
      //      note 1: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
      //      note 1: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
      //      note 1: Uses global: locutus to store locale info
      //      note 1: Consider using http://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
      //      note 2: This function tries to establish the locale via the `window` global.
      //      note 2: This feature will not work in Node and hence is Browser-only
      //   example 1: setlocale('LC_ALL', 'en_US')
      //   returns 1: 'en_US'
    
      var getenv = require('../info/getenv')
    
      var categ = ''
      var cats = []
      var i = 0
    
      var _copy = function _copy (orig) {
        if (orig instanceof RegExp) {
          return new RegExp(orig)
        } else if (orig instanceof Date) {
          return new Date(orig)
        }
        var newObj = {}
        for (var i in orig) {
          if (typeof orig[i] === 'object') {
            newObj[i] = _copy(orig[i])
          } else {
            newObj[i] = orig[i]
          }
        }
        return newObj
      }
    
      // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(),
      // but locale-specific) See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms
      // though amended with others from https://developer.mozilla.org/En/Localization_and_Plurals (new
      // categories noted with "MDC" below, though not sure of whether there is a convention for the
      // relative order of these newer groups as far as ngettext) The function name indicates the number
      // of plural forms (nplural) Need to look into http://cldr.unicode.org/ (maybe future JavaScript);
      // Dojo has some functions (under new BSD), including JSON conversions of LDML XML from CLDR:
      // http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr and docs at
      // http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
    
      // var _nplurals1 = function (n) {
      //   // e.g., Japanese
      //   return 0
      // }
      var _nplurals2a = function (n) {
        // e.g., English
        return n !== 1 ? 1 : 0
      }
      var _nplurals2b = function (n) {
        // e.g., French
        return n > 1 ? 1 : 0
      }
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      // Reconcile Windows vs. *nix locale names?
      // Allow different priority orders of languages, esp. if implement gettext as in
      // LANGUAGE env. var.? (e.g., show German if French is not available)
      if (!$locutus.php.locales ||
        !$locutus.php.locales.fr_CA ||
        !$locutus.php.locales.fr_CA.LC_TIME ||
        !$locutus.php.locales.fr_CA.LC_TIME.x) {
        // Can add to the locales
        $locutus.php.locales = {}
    
        $locutus.php.locales.en = {
          'LC_COLLATE': function (str1, str2) {
            // @todo: This one taken from strcmp, but need for other locales; we don't use localeCompare
            // since its locale is not settable
            return (str1 === str2) ? 0 : ((str1 > str2) ? 1 : -1)
          },
          'LC_CTYPE': {
            // Need to change any of these for English as opposed to C?
            an: /^[A-Za-z\d]+$/g,
            al: /^[A-Za-z]+$/g,
            ct: /^[\u0000-\u001F\u007F]+$/g,
            dg: /^[\d]+$/g,
            gr: /^[\u0021-\u007E]+$/g,
            lw: /^[a-z]+$/g,
            pr: /^[\u0020-\u007E]+$/g,
            pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
            sp: /^[\f\n\r\t\v ]+$/g,
            up: /^[A-Z]+$/g,
            xd: /^[A-Fa-f\d]+$/g,
            CODESET: 'UTF-8',
            // Used by sql_regcase
            lower: 'abcdefghijklmnopqrstuvwxyz',
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
          },
          'LC_TIME': {
            // Comments include nl_langinfo() constant equivalents and any
            // changes from Blues' implementation
            a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            // ABDAY_
            A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            // DAY_
            b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            // ABMON_
            B: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
              'August', 'September', 'October',
              'November', 'December'
            ],
            // MON_
            c: '%a %d %b %Y %r %Z',
            // D_T_FMT // changed %T to %r per results
            p: ['AM', 'PM'],
            // AM_STR/PM_STR
            P: ['am', 'pm'],
            // Not available in nl_langinfo()
            r: '%I:%M:%S %p',
            // T_FMT_AMPM (Fixed for all locales)
            x: '%m/%d/%Y',
            // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
            X: '%r',
            // T_FMT // changed from %T to %r  (%T is default for C, not English US)
            // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
            alt_digits: '',
            // e.g., ordinal
            ERA: '',
            ERA_YEAR: '',
            ERA_D_T_FMT: '',
            ERA_D_FMT: '',
            ERA_T_FMT: ''
          },
          // Assuming distinction between numeric and monetary is thus:
          // See below for C locale
          'LC_MONETARY': {
            // based on Windows "english" (English_United States.1252) locale
            int_curr_symbol: 'USD',
            currency_symbol: '$',
            mon_decimal_point: '.',
            mon_thousands_sep: ',',
            mon_grouping: [3],
            // use mon_thousands_sep; "" for no grouping; additional array members
            // indicate successive group lengths after first group
            // (e.g., if to be 1,23,456, could be [3, 2])
            positive_sign: '',
            negative_sign: '-',
            int_frac_digits: 2,
            // Fractional digits only for money defaults?
            frac_digits: 2,
            p_cs_precedes: 1,
            // positive currency symbol follows value = 0; precedes value = 1
            p_sep_by_space: 0,
            // 0: no space between curr. symbol and value; 1: space sep. them unless symb.
            // and sign are adjacent then space sep. them from value; 2: space sep. sign
            // and value unless symb. and sign are adjacent then space separates
            n_cs_precedes: 1,
            // see p_cs_precedes
            n_sep_by_space: 0,
            // see p_sep_by_space
            p_sign_posn: 3,
            // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them;
            // 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed.
            // succeeds curr. symbol
            n_sign_posn: 0 // see p_sign_posn
          },
          'LC_NUMERIC': {
            // based on Windows "english" (English_United States.1252) locale
            decimal_point: '.',
            thousands_sep: ',',
            grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
          },
          'LC_MESSAGES': {
            YESEXPR: '^[yY].*',
            NOEXPR: '^[nN].*',
            YESSTR: '',
            NOSTR: ''
          },
          nplurals: _nplurals2a
        }
        $locutus.php.locales.en_US = _copy($locutus.php.locales.en)
        $locutus.php.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z'
        $locutus.php.locales.en_US.LC_TIME.x = '%D'
        $locutus.php.locales.en_US.LC_TIME.X = '%r'
        // The following are based on *nix settings
        $locutus.php.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD '
        $locutus.php.locales.en_US.LC_MONETARY.p_sign_posn = 1
        $locutus.php.locales.en_US.LC_MONETARY.n_sign_posn = 1
        $locutus.php.locales.en_US.LC_MONETARY.mon_grouping = [3, 3]
        $locutus.php.locales.en_US.LC_NUMERIC.thousands_sep = ''
        $locutus.php.locales.en_US.LC_NUMERIC.grouping = []
    
        $locutus.php.locales.en_GB = _copy($locutus.php.locales.en)
        $locutus.php.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z'
    
        $locutus.php.locales.en_AU = _copy($locutus.php.locales.en_GB)
        // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
        $locutus.php.locales.C = _copy($locutus.php.locales.en)
        $locutus.php.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968'
        $locutus.php.locales.C.LC_MONETARY = {
          int_curr_symbol: '',
          currency_symbol: '',
          mon_decimal_point: '',
          mon_thousands_sep: '',
          mon_grouping: [],
          p_cs_precedes: 127,
          p_sep_by_space: 127,
          n_cs_precedes: 127,
          n_sep_by_space: 127,
          p_sign_posn: 127,
          n_sign_posn: 127,
          positive_sign: '',
          negative_sign: '',
          int_frac_digits: 127,
          frac_digits: 127
        }
        $locutus.php.locales.C.LC_NUMERIC = {
          decimal_point: '.',
          thousands_sep: '',
          grouping: []
        }
        // D_T_FMT
        $locutus.php.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y'
        // D_FMT
        $locutus.php.locales.C.LC_TIME.x = '%m/%d/%y'
        // T_FMT
        $locutus.php.locales.C.LC_TIME.X = '%H:%M:%S'
        $locutus.php.locales.C.LC_MESSAGES.YESEXPR = '^[yY]'
        $locutus.php.locales.C.LC_MESSAGES.NOEXPR = '^[nN]'
    
        $locutus.php.locales.fr = _copy($locutus.php.locales.en)
        $locutus.php.locales.fr.nplurals = _nplurals2b
        $locutus.php.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
        $locutus.php.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi',
          'jeudi', 'vendredi', 'samedi']
        $locutus.php.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai',
          'jun', 'jui', 'ao\u00FB', 'sep', 'oct',
          'nov', 'd\u00E9c'
        ]
        $locutus.php.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars',
          'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt',
          'septembre', 'octobre', 'novembre', 'd\u00E9cembre'
        ]
        $locutus.php.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z'
        $locutus.php.locales.fr.LC_TIME.p = ['', '']
        $locutus.php.locales.fr.LC_TIME.P = ['', '']
        $locutus.php.locales.fr.LC_TIME.x = '%d.%m.%Y'
        $locutus.php.locales.fr.LC_TIME.X = '%T'
    
        $locutus.php.locales.fr_CA = _copy($locutus.php.locales.fr)
        $locutus.php.locales.fr_CA.LC_TIME.x = '%Y-%m-%d'
      }
      if (!$locutus.php.locale) {
        $locutus.php.locale = 'en_US'
        // Try to establish the locale via the `window` global
        if (typeof window !== 'undefined' && window.document) {
          var d = window.document
          var NS_XHTML = 'http://www.w3.org/1999/xhtml'
          var NS_XML = 'http://www.w3.org/XML/1998/namespace'
          if (d.getElementsByTagNameNS &&
            d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
            if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS &&
              d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang')) {
              $locutus.php.locale = d.getElementsByTagName(NS_XHTML, 'html')[0]
                .getAttributeNS(NS_XML, 'lang')
            } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) {
              // XHTML 1.0 only
              $locutus.php.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang
            }
          } else if (d.getElementsByTagName('html')[0] &&
            d.getElementsByTagName('html')[0].lang) {
            $locutus.php.locale = d.getElementsByTagName('html')[0].lang
          }
        }
      }
      // PHP-style
      $locutus.php.locale = $locutus.php.locale.replace('-', '_')
      // @todo: locale if declared locale hasn't been defined
      if (!($locutus.php.locale in $locutus.php.locales)) {
        if ($locutus.php.locale.replace(/_[a-zA-Z]+$/, '') in $locutus.php.locales) {
          $locutus.php.locale = $locutus.php.locale.replace(/_[a-zA-Z]+$/, '')
        }
      }
    
      if (!$locutus.php.localeCategories) {
        $locutus.php.localeCategories = {
          'LC_COLLATE': $locutus.php.locale,
          // for string comparison, see strcoll()
          'LC_CTYPE': $locutus.php.locale,
          // for character classification and conversion, for example strtoupper()
          'LC_MONETARY': $locutus.php.locale,
          // for localeconv()
          'LC_NUMERIC': $locutus.php.locale,
          // for decimal separator (See also localeconv())
          'LC_TIME': $locutus.php.locale,
          // for date and time formatting with strftime()
          // for system responses (available if PHP was compiled with libintl):
          'LC_MESSAGES': $locutus.php.locale
        }
      }
    
      if (locale === null || locale === '') {
        locale = getenv(category) || getenv('LANG')
      } else if (Object.prototype.toString.call(locale) === '[object Array]') {
        for (i = 0; i < locale.length; i++) {
          if (!(locale[i] in $locutus.php.locales)) {
            if (i === locale.length - 1) {
              // none found
              return false
            }
            continue
          }
          locale = locale[i]
          break
        }
      }
    
      // Just get the locale
      if (locale === '0' || locale === 0) {
        if (category === 'LC_ALL') {
          for (categ in $locutus.php.localeCategories) {
            // Add ".UTF-8" or allow ".@latint", etc. to the end?
            cats.push(categ + '=' + $locutus.php.localeCategories[categ])
          }
          return cats.join(';')
        }
        return $locutus.php.localeCategories[category]
      }
    
      if (!(locale in $locutus.php.locales)) {
        // Locale not found
        return false
      }
    
      // Set and get locale
      if (category === 'LC_ALL') {
        for (categ in $locutus.php.localeCategories) {
          $locutus.php.localeCategories[categ] = locale
        }
      } else {
        $locutus.php.localeCategories[category] = locale
      }
    
      return locale
    }
  );

  $php.context.function.declare(
    '\\sha1', [
      {"name":"str","type":"string"},
      {"name":"raw_output","type":"bool"}
    ],
    'string', function sha1(str) {
      //  discuss at: http://locutus.io/php/sha1/
      // original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // improved by: Michael White (http://getsprink.com)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Brett Zamir (http://brett-zamir.me)
      //      note 1: Keep in mind that in accordance with PHP, the whole string is buffered and then
      //      note 1: hashed. If available, we'd recommend using Node's native crypto modules directly
      //      note 1: in a steaming fashion for faster and more efficient hashing
      //   example 1: sha1('Kevin van Zonneveld')
      //   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
    
      var hash
      try {
        var crypto = require('crypto')
        var sha1sum = crypto.createHash('sha1')
        sha1sum.update(str)
        hash = sha1sum.digest('hex')
      } catch (e) {
        hash = undefined
      }
    
      if (hash !== undefined) {
        return hash
      }
    
      var _rotLeft = function (n, s) {
        var t4 = (n << s) | (n >>> (32 - s))
        return t4
      }
    
      var _cvtHex = function (val) {
        var str = ''
        var i
        var v
    
        for (i = 7; i >= 0; i--) {
          v = (val >>> (i * 4)) & 0x0f
          str += v.toString(16)
        }
        return str
      }
    
      var blockstart
      var i, j
      var W = new Array(80)
      var H0 = 0x67452301
      var H1 = 0xEFCDAB89
      var H2 = 0x98BADCFE
      var H3 = 0x10325476
      var H4 = 0xC3D2E1F0
      var A, B, C, D, E
      var temp
    
      // utf8_encode
      str = unescape(encodeURIComponent(str))
      var strLen = str.length
    
      var wordArray = []
      for (i = 0; i < strLen - 3; i += 4) {
        j = str.charCodeAt(i) << 24 |
          str.charCodeAt(i + 1) << 16 |
          str.charCodeAt(i + 2) << 8 |
          str.charCodeAt(i + 3)
        wordArray.push(j)
      }
    
      switch (strLen % 4) {
        case 0:
          i = 0x080000000
          break
        case 1:
          i = str.charCodeAt(strLen - 1) << 24 | 0x0800000
          break
        case 2:
          i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000
          break
        case 3:
          i = str.charCodeAt(strLen - 3) << 24 |
            str.charCodeAt(strLen - 2) << 16 |
            str.charCodeAt(strLen - 1) <<
          8 | 0x80
          break
      }
    
      wordArray.push(i)
    
      while ((wordArray.length % 16) !== 14) {
        wordArray.push(0)
      }
    
      wordArray.push(strLen >>> 29)
      wordArray.push((strLen << 3) & 0x0ffffffff)
    
      for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
        for (i = 0; i < 16; i++) {
          W[i] = wordArray[blockstart + i]
        }
        for (i = 16; i <= 79; i++) {
          W[i] = _rotLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1)
        }
    
        A = H0
        B = H1
        C = H2
        D = H3
        E = H4
    
        for (i = 0; i <= 19; i++) {
          temp = (_rotLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff
          E = D
          D = C
          C = _rotLeft(B, 30)
          B = A
          A = temp
        }
    
        for (i = 20; i <= 39; i++) {
          temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff
          E = D
          D = C
          C = _rotLeft(B, 30)
          B = A
          A = temp
        }
    
        for (i = 40; i <= 59; i++) {
          temp = (_rotLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff
          E = D
          D = C
          C = _rotLeft(B, 30)
          B = A
          A = temp
        }
    
        for (i = 60; i <= 79; i++) {
          temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff
          E = D
          D = C
          C = _rotLeft(B, 30)
          B = A
          A = temp
        }
    
        H0 = (H0 + A) & 0x0ffffffff
        H1 = (H1 + B) & 0x0ffffffff
        H2 = (H2 + C) & 0x0ffffffff
        H3 = (H3 + D) & 0x0ffffffff
        H4 = (H4 + E) & 0x0ffffffff
      }
    
      temp = _cvtHex(H0) + _cvtHex(H1) + _cvtHex(H2) + _cvtHex(H3) + _cvtHex(H4)
      return temp.toLowerCase()
    }
  );

  $php.context.function.declare(
    '\\sha1_file', [
      {"name":"filename","type":"string"},
      {"name":"raw_output","type":"bool"}
    ],
    'string', function sha1_file(str_filename) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/sha1_file/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //      note 1: Relies on file_get_contents which does not work in the browser, so Node only.
      //      note 2: Keep in mind that in accordance with PHP, the whole file is buffered and then
      //      note 2: hashed. We'd recommend Node's native crypto modules for faster and more
      //      note 2: efficient hashing
      //   example 1: sha1_file('test/never-change.txt')
      //   returns 1: '0ea65a1f4b4d69712affc58240932f3eb8a2af66'
    
      var fileGetContents = require('../filesystem/file_get_contents')
      var sha1 = require('../strings/sha1')
      var buf = fileGetContents(str_filename)
    
      if (buf === false) {
        return false
      }
    
      return sha1(buf)
    }
  );

  $php.context.function.declare(
    '\\similar_text', [
      {"name":"first","type":"string"},
      {"name":"second","type":"string"},
      {"name":"percent","type":"float"}
    ],
    'int', function similar_text(first, second, percent) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/similar_text/
      // original by: Rafał Kukawski (http://blog.kukawski.pl)
      // bugfixed by: Chris McMacken
      // bugfixed by: Jarkko Rantavuori original by findings in stackoverflow (http://stackoverflow.com/questions/14136349/how-does-similar-text-work)
      // improved by: Markus Padourek (taken from http://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
      //   example 1: similar_text('Hello World!', 'Hello locutus!')
      //   returns 1: 8
      //   example 2: similar_text('Hello World!', null)
      //   returns 2: 0
    
      if (first === null ||
        second === null ||
        typeof first === 'undefined' ||
        typeof second === 'undefined') {
        return 0
      }
    
      first += ''
      second += ''
    
      var pos1 = 0
      var pos2 = 0
      var max = 0
      var firstLength = first.length
      var secondLength = second.length
      var p
      var q
      var l
      var sum
    
      for (p = 0; p < firstLength; p++) {
        for (q = 0; q < secondLength; q++) {
          for (l = 0; (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++) { // eslint-disable-line max-len
            // @todo: ^-- break up this crazy for loop and put the logic in its body
          }
          if (l > max) {
            max = l
            pos1 = p
            pos2 = q
          }
        }
      }
    
      sum = max
    
      if (sum) {
        if (pos1 && pos2) {
          sum += similar_text(first.substr(0, pos1), second.substr(0, pos2))
        }
    
        if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
          sum += similar_text(
            first.substr(pos1 + max, firstLength - pos1 - max),
            second.substr(pos2 + max,
            secondLength - pos2 - max))
        }
      }
    
      if (!percent) {
        return sum
      }
    
      return (sum * 200) / (firstLength + secondLength)
    }
  );

  $php.context.function.declare(
    '\\soundex', [
      {"name":"str","type":"string"}
    ],
    'string', function soundex(str) {
      //  discuss at: http://locutus.io/php/soundex/
      // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // original by: Arnout Kazemier (http://www.3rd-Eden.com)
      // improved by: Jack
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Brett Zamir (http://brett-zamir.me)
      //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
      //   example 1: soundex('Kevin')
      //   returns 1: 'K150'
      //   example 2: soundex('Ellery')
      //   returns 2: 'E460'
      //   example 3: soundex('Euler')
      //   returns 3: 'E460'
    
      str = (str + '').toUpperCase()
      if (!str) {
        return ''
      }
    
      var sdx = [0, 0, 0, 0]
      var m = {
        B: 1,
        F: 1,
        P: 1,
        V: 1,
        C: 2,
        G: 2,
        J: 2,
        K: 2,
        Q: 2,
        S: 2,
        X: 2,
        Z: 2,
        D: 3,
        T: 3,
        L: 4,
        M: 5,
        N: 5,
        R: 6
      }
      var i = 0
      var j
      var s = 0
      var c
      var p
    
      while ((c = str.charAt(i++)) && s < 4) {
        if ((j = m[c])) {
          if (j !== p) {
            sdx[s++] = p = j
          }
        } else {
          s += i === 1
          p = 0
        }
      }
    
      sdx[0] = str.charAt(0)
    
      return sdx.join('')
    }
  );

  $php.context.function.declare(
    '\\split', [
      {"name":"pattern","type":"string"},
      {"name":"string","type":"mixed"},
      {"name":"limit","type":"mixed"}
    ],
    'mixed', function split(delimiter, string) {
      //  discuss at: http://locutus.io/php/split/
      // original by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: split(' ', 'Kevin van Zonneveld')
      //   returns 1: ['Kevin', 'van', 'Zonneveld']
    
      var explode = require('../strings/explode')
      return explode(delimiter, string)
    }
  );

  $php.context.function.declare(
    '\\sprintf', [
      {"name":"format","type":"string"},
      {"name":"args","type":"mixed"},
      {"name":"_","type":"mixed"}
    ],
    'mixed', function sprintf() {
      //  discuss at: http://locutus.io/php/sprintf/
      // original by: Ash Searle (http://hexmen.com/blog/)
      // improved by: Michael White (http://getsprink.com)
      // improved by: Jack
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Dj
      // improved by: Allidylls
      //    input by: Paulo Freitas
      //    input by: Brett Zamir (http://brett-zamir.me)
      //   example 1: sprintf("%01.2f", 123.1)
      //   returns 1: '123.10'
      //   example 2: sprintf("[%10s]", 'monkey')
      //   returns 2: '[    monkey]'
      //   example 3: sprintf("[%'#10s]", 'monkey')
      //   returns 3: '[####monkey]'
      //   example 4: sprintf("%d", 123456789012345)
      //   returns 4: '123456789012345'
      //   example 5: sprintf('%-03s', 'E')
      //   returns 5: 'E00'
    
      var regex = /%%|%(\d+\$)?([\-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g
      var a = arguments
      var i = 0
      var format = a[i++]
    
      var _pad = function (str, len, chr, leftJustify) {
        if (!chr) {
          chr = ' '
        }
        var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0).join(chr)
        return leftJustify ? str + padding : padding + str
      }
    
      var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length
        if (diff > 0) {
          if (leftJustify || !zeroPad) {
            value = _pad(value, minWidth, customPadChar, leftJustify)
          } else {
            value = [
              value.slice(0, prefix.length),
              _pad('', diff, '0', true),
              value.slice(prefix.length)
            ].join('')
          }
        }
        return value
      }
    
      var _formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0
        prefix = (prefix && number && {
          '2': '0b',
          '8': '0',
          '16': '0x'
        }[base]) || ''
        value = prefix + _pad(number.toString(base), precision || 0, '0', false)
        return justify(value, prefix, leftJustify, minWidth, zeroPad)
      }
    
      // _formatString()
      var _formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision !== null && precision !== undefined) {
          value = value.slice(0, precision)
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar)
      }
    
      // doFormat()
      var doFormat = function (substring, valueIndex, flags, minWidth, precision, type) {
        var number, prefix, method, textTransform, value
    
        if (substring === '%%') {
          return '%'
        }
    
        // parse flags
        var leftJustify = false
        var positivePrefix = ''
        var zeroPad = false
        var prefixBaseX = false
        var customPadChar = ' '
        var flagsl = flags.length
        var j
        for (j = 0; j < flagsl; j++) {
          switch (flags.charAt(j)) {
            case ' ':
              positivePrefix = ' '
              break
            case '+':
              positivePrefix = '+'
              break
            case '-':
              leftJustify = true
              break
            case "'":
              customPadChar = flags.charAt(j + 1)
              break
            case '0':
              zeroPad = true
              customPadChar = '0'
              break
            case '#':
              prefixBaseX = true
              break
          }
        }
    
        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
          minWidth = 0
        } else if (minWidth === '*') {
          minWidth = +a[i++]
        } else if (minWidth.charAt(0) === '*') {
          minWidth = +a[minWidth.slice(1, -1)]
        } else {
          minWidth = +minWidth
        }
    
        // Note: undocumented perl feature:
        if (minWidth < 0) {
          minWidth = -minWidth
          leftJustify = true
        }
    
        if (!isFinite(minWidth)) {
          throw new Error('sprintf: (minimum-)width must be finite')
        }
    
        if (!precision) {
          precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined
        } else if (precision === '*') {
          precision = +a[i++]
        } else if (precision.charAt(0) === '*') {
          precision = +a[precision.slice(1, -1)]
        } else {
          precision = +precision
        }
    
        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++]
    
        switch (type) {
          case 's':
            return _formatString(value + '', leftJustify, minWidth, precision, zeroPad, customPadChar)
          case 'c':
            return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad)
          case 'b':
            return _formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'o':
            return _formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'x':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'X':
            return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
            .toUpperCase()
          case 'u':
            return _formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          case 'i':
          case 'd':
            number = +value || 0
            // Plain Math.round doesn't just truncate
            number = Math.round(number - number % 1)
            prefix = number < 0 ? '-' : positivePrefix
            value = prefix + _pad(String(Math.abs(number)), precision, '0', false)
            return justify(value, prefix, leftJustify, minWidth, zeroPad)
          case 'e':
          case 'E':
          case 'f': // @todo: Should handle locales (as per setlocale)
          case 'F':
          case 'g':
          case 'G':
            number = +value
            prefix = number < 0 ? '-' : positivePrefix
            method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())]
            textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2]
            value = prefix + Math.abs(number)[method](precision)
            return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]()
          default:
            return substring
        }
      }
    
      return format.replace(regex, doFormat)
    }
  );

  $php.context.function.declare(
    '\\sscanf', [
      {"name":"str","type":"string"},
      {"name":"format","type":"string"},
      {"name":"_","type":"mixed"}
    ],
    'mixed', function sscanf(str, format) {
      //  discuss at: http://locutus.io/php/sscanf/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: sscanf('SN/2350001', 'SN/%d')
      //   returns 1: [2350001]
      //   example 2: var myVar = {}
      //   example 2: sscanf('SN/2350001', 'SN/%d', myVar)
      //   example 2: var $result = myVar.value
      //   returns 2: 2350001
      //   example 3: sscanf("10--20", "%2$d--%1$d") // Must escape '$' in PHP, but not JS
      //   returns 3: [20, 10]
    
      var retArr = []
      var _NWS = /\S/
      var args = arguments
      var digit
    
      var _setExtraConversionSpecs = function (offset) {
        // Since a mismatched character sets us off track from future
        // legitimate finds, we just scan
        // to the end for any other conversion specifications (besides a percent literal),
        // setting them to null
        // sscanf seems to disallow all conversion specification components (of sprintf)
        // except for type specifiers
        // Do not allow % in last char. class
        // var matches = format.match(/%[+-]?([ 0]|'.)?-?\d*(\.\d+)?[bcdeufFosxX]/g);
        // Do not allow % in last char. class:
        var matches = format.slice(offset).match(/%[cdeEufgosxX]/g)
        // b, F,G give errors in PHP, but 'g', though also disallowed, doesn't
        if (matches) {
          var lgth = matches.length
          while (lgth--) {
            retArr.push(null)
          }
        }
        return _finish()
      }
    
      var _finish = function () {
        if (args.length === 2) {
          return retArr
        }
        for (var i = 0; i < retArr.length; ++i) {
          args[i + 2].value = retArr[i]
        }
        return i
      }
    
      var _addNext = function (j, regex, cb) {
        if (assign) {
          var remaining = str.slice(j)
          var check = width ? remaining.substr(0, width) : remaining
          var match = regex.exec(check)
          // @todo: Make this more readable
          var key = digit !== undefined
            ? digit
            : retArr.length
          var testNull = retArr[key] = match
              ? (cb
                ? cb.apply(null, match)
                : match[0])
              : null
          if (testNull === null) {
            throw new Error('No match in string')
          }
          return j + match[0].length
        }
        return j
      }
    
      if (arguments.length < 2) {
        throw new Error('Not enough arguments passed to sscanf')
      }
    
      // PROCESS
      for (var i = 0, j = 0; i < format.length; i++) {
        var width = 0
        var assign = true
    
        if (format.charAt(i) === '%') {
          if (format.charAt(i + 1) === '%') {
            if (str.charAt(j) === '%') {
              // a matched percent literal
              // skip beyond duplicated percent
              ++i
              ++j
              continue
            }
            // Format indicated a percent literal, but not actually present
            return _setExtraConversionSpecs(i + 2)
          }
    
          // CHARACTER FOLLOWING PERCENT IS NOT A PERCENT
    
          // We need 'g' set to get lastIndex
          var prePattern = new RegExp('^(?:(\\d+)\\$)?(\\*)?(\\d*)([hlL]?)', 'g')
    
          var preConvs = prePattern.exec(format.slice(i + 1))
    
          var tmpDigit = digit
          if (tmpDigit && preConvs[1] === undefined) {
            var msg = 'All groups in sscanf() must be expressed as numeric if '
            msg += 'any have already been used'
            throw new Error(msg)
          }
          digit = preConvs[1] ? parseInt(preConvs[1], 10) - 1 : undefined
    
          assign = !preConvs[2]
          width = parseInt(preConvs[3], 10)
          var sizeCode = preConvs[4]
          i += prePattern.lastIndex
    
          // @todo: Does PHP do anything with these? Seems not to matter
          if (sizeCode) {
            // This would need to be processed later
            switch (sizeCode) {
              case 'h':
              case 'l':
              case 'L':
                // Treats subsequent as short int (for d,i,n) or unsigned short int (for o,u,x)
                // Treats subsequent as long int (for d,i,n), or unsigned long int (for o,u,x);
                //    or as double (for e,f,g) instead of float or wchar_t instead of char
                // Treats subsequent as long double (for e,f,g)
                break
              default:
                throw new Error('Unexpected size specifier in sscanf()!')
            }
          }
          // PROCESS CHARACTER
          try {
            // For detailed explanations, see http://web.archive.org/web/20031128125047/http://www.uwm.edu/cgi-bin/IMT/wwwman?topic=scanf%283%29&msection=
            // Also http://www.mathworks.com/access/helpdesk/help/techdoc/ref/sscanf.html
            // p, S, C arguments in C function not available
            // DOCUMENTED UNDER SSCANF
            switch (format.charAt(i + 1)) {
              case 'F':
                // Not supported in PHP sscanf; the argument is treated as a float, and
                //  presented as a floating-point number (non-locale aware)
                // sscanf doesn't support locales, so no need for two (see %f)
                break
              case 'g':
                // Not supported in PHP sscanf; shorter of %e and %f
                // Irrelevant to input conversion
                break
              case 'G':
                // Not supported in PHP sscanf; shorter of %E and %f
                // Irrelevant to input conversion
                break
              case 'b':
                // Not supported in PHP sscanf; the argument is treated as an integer,
                // and presented as a binary number
                // Not supported - couldn't distinguish from other integers
                break
              case 'i':
                // Integer with base detection (Equivalent of 'd', but base 0 instead of 10)
                var pattern = /([+-])?(?:(?:0x([\da-fA-F]+))|(?:0([0-7]+))|(\d+))/
                j = _addNext(j, pattern, function (num, sign, hex,
                oct, dec) {
                  return hex ? parseInt(num, 16) : oct ? parseInt(num, 8) : parseInt(num, 10)
                })
                break
              case 'n':
                // Number of characters processed so far
                retArr[digit !== undefined ? digit : retArr.length - 1] = j
                break
                // DOCUMENTED UNDER SPRINTF
              case 'c':
                // Get character; suppresses skipping over whitespace!
                // (but shouldn't be whitespace in format anyways, so no difference here)
                // Non-greedy match
                j = _addNext(j, new RegExp('.{1,' + (width || 1) + '}'))
                break
              case 'D':
              case 'd':
                // sscanf documented decimal number; equivalent of 'd';
                // Optionally signed decimal integer
                j = _addNext(j, /([+-])?(?:0*)(\d+)/, function (num, sign, dec) {
                  // Ignores initial zeroes, unlike %i and parseInt()
                  var decInt = parseInt((sign || '') + dec, 10)
                  if (decInt < 0) {
                    // PHP also won't allow less than -2147483648
                    // integer overflow with negative
                    return decInt < -2147483648 ? -2147483648 : decInt
                  } else {
                    // PHP also won't allow greater than -2147483647
                    return decInt < 2147483647 ? decInt : 2147483647
                  }
                })
                break
              case 'f':
              case 'E':
              case 'e':
                // Although sscanf doesn't support locales,
                // this is used instead of '%F'; seems to be same as %e
                // These don't discriminate here as both allow exponential float of either case
                j = _addNext(j, /([+-])?(?:0*)(\d*\.?\d*(?:[eE]?\d+)?)/, function (num, sign, dec) {
                  if (dec === '.') {
                    return null
                  }
                  // Ignores initial zeroes, unlike %i and parseFloat()
                  return parseFloat((sign || '') + dec)
                })
                break
              case 'u':
                // unsigned decimal integer
                // We won't deal with integer overflows due to signs
                j = _addNext(j, /([+-])?(?:0*)(\d+)/, function (num, sign, dec) {
                  // Ignores initial zeroes, unlike %i and parseInt()
                  var decInt = parseInt(dec, 10)
                  if (sign === '-') {
                    // PHP also won't allow greater than 4294967295
                    // integer overflow with negative
                    return 4294967296 - decInt
                  } else {
                    return decInt < 4294967295 ? decInt : 4294967295
                  }
                })
                break
              case 'o':
                  // Octal integer // @todo: add overflows as above?
                j = _addNext(j, /([+-])?(?:0([0-7]+))/, function (num, sign, oct) {
                  return parseInt(num, 8)
                })
                break
              case 's':
                // Greedy match
                j = _addNext(j, /\S+/)
                break
              case 'X':
              case 'x':
              // Same as 'x'?
                // @todo: add overflows as above?
                // Initial 0x not necessary here
                j = _addNext(j, /([+-])?(?:(?:0x)?([\da-fA-F]+))/, function (num, sign, hex) {
                  return parseInt(num, 16)
                })
                break
              case '':
                // If no character left in expression
                throw new Error('Missing character after percent mark in sscanf() format argument')
              default:
                throw new Error('Unrecognized character after percent mark in sscanf() format argument')
            }
          } catch (e) {
            if (e === 'No match in string') {
              // Allow us to exit
              return _setExtraConversionSpecs(i + 2)
            }
            // Calculate skipping beyond initial percent too
          }
          ++i
        } else if (format.charAt(i) !== str.charAt(j)) {
            // @todo: Double-check i whitespace ignored in string and/or formats
          _NWS.lastIndex = 0
          if ((_NWS)
            .test(str.charAt(j)) || str.charAt(j) === '') {
            // Whitespace doesn't need to be an exact match)
            return _setExtraConversionSpecs(i + 1)
          } else {
            // Adjust strings when encounter non-matching whitespace,
            // so they align in future checks above
            // Ok to replace with j++;?
            str = str.slice(0, j) + str.slice(j + 1)
            i--
          }
        } else {
          j++
        }
      }
    
      // POST-PROCESSING
      return _finish()
    }
  );

  $php.context.function.declare(
    '\\str_getcsv', [
      {"name":"input","type":"string"},
      {"name":"delimiter","type":"string"},
      {"name":"enclosure","type":"string"},
      {"name":"escape","type":"string"}
    ],
    'array', function str_getcsv(input, delimiter, enclosure, escape) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_getcsv/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: str_getcsv('"abc","def","ghi"')
      //   returns 1: ['abc', 'def', 'ghi']
      //   example 2: str_getcsv('"row2""cell1","row2cell2","row2cell3"', null, null, '"')
      //   returns 2: ['row2"cell1', 'row2cell2', 'row2cell3']
    
      /*
      // These test cases allowing for missing delimiters are not currently supported
        str_getcsv('"row2""cell1",row2cell2,row2cell3', null, null, '"');
        ['row2"cell1', 'row2cell2', 'row2cell3']
    
        str_getcsv('row1cell1,"row1,cell2",row1cell3', null, null, '"');
        ['row1cell1', 'row1,cell2', 'row1cell3']
    
        str_getcsv('"row2""cell1",row2cell2,"row2""""cell3"');
        ['row2"cell1', 'row2cell2', 'row2""cell3']
    
        str_getcsv('row1cell1,"row1,cell2","row1"",""cell3"', null, null, '"');
        ['row1cell1', 'row1,cell2', 'row1","cell3'];
    
        Should also test newlines within
      */
    
      var i
      var inpLen
      var output = []
      var _backwards = function (str) {
        // We need to go backwards to simulate negative look-behind (don't split on
        // an escaped enclosure even if followed by the delimiter and another enclosure mark)
        return str.split('').reverse().join('')
      }
      var _pq = function (str) {
        // preg_quote()
        return String(str).replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}=!<>\|:])/g, '\\$1')
      }
    
      delimiter = delimiter || ','
      enclosure = enclosure || '"'
      escape = escape || '\\'
      var pqEnc = _pq(enclosure)
      var pqEsc = _pq(escape)
    
      input = input
        .replace(new RegExp('^\\s*' + pqEnc), '')
        .replace(new RegExp(pqEnc + '\\s*$'), '')
    
      // PHP behavior may differ by including whitespace even outside of the enclosure
      input = _backwards(input)
        .split(new RegExp(pqEnc + '\\s*' + _pq(delimiter) + '\\s*' + pqEnc + '(?!' + pqEsc + ')', 'g'))
        .reverse()
    
      for (i = 0, inpLen = input.length; i < inpLen; i++) {
        output.push(_backwards(input[i])
          .replace(new RegExp(pqEsc + pqEnc, 'g'), enclosure))
      }
    
      return output
    }
  );

  $php.context.function.declare(
    '\\str_ireplace', [
      {"name":"search","type":"mixed"},
      {"name":"replace","type":"mixed"},
      {"name":"subject","type":"mixed"},
      {"name":"count","type":"int"}
    ],
    'mixed', function str_ireplace(search, replace, subject, countObj) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_ireplace/
      // original by: Glen Arason (http://CanadianDomainRegistry.ca)
      //      note 1: Case-insensitive version of str_replace()
      //      note 1: Compliant with PHP 5.0 str_ireplace() Full details at:
      //      note 1: http://ca3.php.net/manual/en/function.str-ireplace.php
      //      note 2: The countObj parameter (optional) if used must be passed in as a
      //      note 2: object. The count will then be written by reference into it's `value` property
      //   example 1: str_ireplace('M', 'e', 'name')
      //   returns 1: 'naee'
      //   example 2: var $countObj = {}
      //   example 2: str_ireplace('M', 'e', 'name', $countObj)
      //   example 2: var $result = $countObj.value
      //   returns 2: 1
    
      var i = 0
      var j = 0
      var temp = ''
      var repl = ''
      var sl = 0
      var fl = 0
      var f = ''
      var r = ''
      var s = ''
      var ra = ''
      var otemp = ''
      var oi = ''
      var ofjl = ''
      var os = subject
      var osa = Object.prototype.toString.call(os) === '[object Array]'
      // var sa = ''
    
      if (typeof (search) === 'object') {
        temp = search
        search = []
        for (i = 0; i < temp.length; i += 1) {
          search[i] = temp[i].toLowerCase()
        }
      } else {
        search = search.toLowerCase()
      }
    
      if (typeof (subject) === 'object') {
        temp = subject
        subject = []
        for (i = 0; i < temp.length; i += 1) {
          subject[i] = temp[i].toLowerCase()
        }
      } else {
        subject = subject.toLowerCase()
      }
    
      if (typeof (search) === 'object' && typeof (replace) === 'string') {
        temp = replace
        replace = []
        for (i = 0; i < search.length; i += 1) {
          replace[i] = temp
        }
      }
    
      temp = ''
      f = [].concat(search)
      r = [].concat(replace)
      ra = Object.prototype.toString.call(r) === '[object Array]'
      s = subject
      // sa = Object.prototype.toString.call(s) === '[object Array]'
      s = [].concat(s)
      os = [].concat(os)
    
      if (countObj) {
        countObj.value = 0
      }
    
      for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
          continue
        }
        for (j = 0, fl = f.length; j < fl; j++) {
          temp = s[i] + ''
          repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0]
          s[i] = (temp).split(f[j]).join(repl)
          otemp = os[i] + ''
          oi = temp.indexOf(f[j])
          ofjl = f[j].length
          if (oi >= 0) {
            os[i] = (otemp).split(otemp.substr(oi, ofjl)).join(repl)
          }
    
          if (countObj) {
            countObj.value += ((temp.split(f[j])).length - 1)
          }
        }
      }
    
      return osa ? os : os[0]
    }
  );

  $php.context.function.declare(
    '\\str_pad', [
      {"name":"input","type":"string"},
      {"name":"pad_length","type":"int"},
      {"name":"pad_string","type":"string"},
      {"name":"pad_type","type":"int"}
    ],
    'string', function str_pad(input, padLength, padString, padType) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_pad/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Michael White (http://getsprink.com)
      //    input by: Marco van Oort
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT')
      //   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
      //   example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH')
      //   returns 2: '------Kevin van Zonneveld-----'
    
      var half = ''
      var padToGo
    
      var _strPadRepeater = function (s, len) {
        var collect = ''
    
        while (collect.length < len) {
          collect += s
        }
        collect = collect.substr(0, len)
    
        return collect
      }
    
      input += ''
      padString = padString !== undefined ? padString : ' '
    
      if (padType !== 'STR_PAD_LEFT' && padType !== 'STR_PAD_RIGHT' && padType !== 'STR_PAD_BOTH') {
        padType = 'STR_PAD_RIGHT'
      }
      if ((padToGo = padLength - input.length) > 0) {
        if (padType === 'STR_PAD_LEFT') {
          input = _strPadRepeater(padString, padToGo) + input
        } else if (padType === 'STR_PAD_RIGHT') {
          input = input + _strPadRepeater(padString, padToGo)
        } else if (padType === 'STR_PAD_BOTH') {
          half = _strPadRepeater(padString, Math.ceil(padToGo / 2))
          input = half + input + half
          input = input.substr(0, padLength)
        }
      }
    
      return input
    }
  );

  $php.context.function.declare(
    '\\str_repeat', [
      {"name":"input","type":"string"},
      {"name":"multiplier","type":"int"}
    ],
    'string', function str_repeat(input, multiplier) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_repeat/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // improved by: Ian Carter (http://euona.com/)
      //   example 1: str_repeat('-=', 10)
      //   returns 1: '-=-=-=-=-=-=-=-=-=-='
    
      var y = ''
      while (true) {
        if (multiplier & 1) {
          y += input
        }
        multiplier >>= 1
        if (multiplier) {
          input += input
        } else {
          break
        }
      }
      return y
    }
  );

  $php.context.function.declare(
    '\\str_replace', [
      {"name":"search","type":"mixed"},
      {"name":"replace","type":"mixed"},
      {"name":"subject","type":"mixed"},
      {"name":"count","type":"int"}
    ],
    'mixed', function str_replace(search, replace, subject, countObj) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_replace/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Gabriel Paderni
      // improved by: Philip Peterson
      // improved by: Simon Willison (http://simonwillison.net)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // bugfixed by: Anton Ongson
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Oleg Eremeev
      // bugfixed by: Glen Arason (http://CanadianDomainRegistry.ca)
      // bugfixed by: Glen Arason (http://CanadianDomainRegistry.ca)
      //    input by: Onno Marsman (https://twitter.com/onnomarsman)
      //    input by: Brett Zamir (http://brett-zamir.me)
      //    input by: Oleg Eremeev
      //      note 1: The countObj parameter (optional) if used must be passed in as a
      //      note 1: object. The count will then be written by reference into it's `value` property
      //   example 1: str_replace(' ', '.', 'Kevin van Zonneveld')
      //   returns 1: 'Kevin.van.Zonneveld'
      //   example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars')
      //   returns 2: 'hemmo, mars'
      //   example 3: str_replace(Array('S','F'),'x','ASDFASDF')
      //   returns 3: 'AxDxAxDx'
      //   example 4: var countObj = {}
      //   example 4: str_replace(['A','D'], ['x','y'] , 'ASDFASDF' , countObj)
      //   example 4: var $result = countObj.value
      //   returns 4: 4
    
      var i = 0
      var j = 0
      var temp = ''
      var repl = ''
      var sl = 0
      var fl = 0
      var f = [].concat(search)
      var r = [].concat(replace)
      var s = subject
      var ra = Object.prototype.toString.call(r) === '[object Array]'
      var sa = Object.prototype.toString.call(s) === '[object Array]'
      s = [].concat(s)
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      if (typeof (search) === 'object' && typeof (replace) === 'string') {
        temp = replace
        replace = []
        for (i = 0; i < search.length; i += 1) {
          replace[i] = temp
        }
        temp = ''
        r = [].concat(replace)
        ra = Object.prototype.toString.call(r) === '[object Array]'
      }
    
      if (typeof countObj !== 'undefined') {
        countObj.value = 0
      }
    
      for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
          continue
        }
        for (j = 0, fl = f.length; j < fl; j++) {
          temp = s[i] + ''
          repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0]
          s[i] = (temp).split(f[j]).join(repl)
          if (typeof countObj !== 'undefined') {
            countObj.value += ((temp.split(f[j])).length - 1)
          }
        }
      }
      return sa ? s : s[0]
    }
  );

  $php.context.function.declare(
    '\\str_rot13', [
      {"name":"str","type":"string"}
    ],
    'string', function str_rot13(str) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_rot13/
      // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // improved by: Ates Goral (http://magnetiq.com)
      // improved by: Rafał Kukawski (http://blog.kukawski.pl)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: str_rot13('Kevin van Zonneveld')
      //   returns 1: 'Xriva ina Mbaariryq'
      //   example 2: str_rot13('Xriva ina Mbaariryq')
      //   returns 2: 'Kevin van Zonneveld'
      //   example 3: str_rot13(33)
      //   returns 3: '33'
    
      return (str + '')
        .replace(/[a-z]/gi, function (s) {
          return String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < 'n' ? 13 : -13))
        })
    }
  );

  $php.context.function.declare(
    '\\str_shuffle', [
      {"name":"str","type":"string"}
    ],
    'string', function str_shuffle(str) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_shuffle/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: var $shuffled = str_shuffle("abcdef")
      //   example 1: var $result = $shuffled.length
      //   returns 1: 6
    
      if (arguments.length === 0) {
        throw new Error('Wrong parameter count for str_shuffle()')
      }
    
      if (str === null) {
        return ''
      }
    
      str += ''
    
      var newStr = ''
      var rand
      var i = str.length
    
      while (i) {
        rand = Math.floor(Math.random() * i)
        newStr += str.charAt(rand)
        str = str.substring(0, rand) + str.substr(rand + 1)
        i--
      }
    
      return newStr
    }
  );

  $php.context.function.declare(
    '\\str_split', [
      {"name":"string","type":"string"},
      {"name":"split_length","type":"int"}
    ],
    'array', function str_split(string, splitLength) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_split/
      // original by: Martijn Wieringa
      // improved by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //  revised by: Theriault (https://github.com/Theriault)
      //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
      //    input by: Bjorn Roesbeke (http://www.bjornroesbeke.be/)
      //   example 1: str_split('Hello Friend', 3)
      //   returns 1: ['Hel', 'lo ', 'Fri', 'end']
    
      if (splitLength === null) {
        splitLength = 1
      }
      if (string === null || splitLength < 1) {
        return false
      }
    
      string += ''
      var chunks = []
      var pos = 0
      var len = string.length
    
      while (pos < len) {
        chunks.push(string.slice(pos, pos += splitLength))
      }
    
      return chunks
    }
  );

  $php.context.function.declare(
    '\\str_word_count', [
      {"name":"string","type":"string"},
      {"name":"format","type":"int"},
      {"name":"charlist","type":"string"}
    ],
    'mixed', function str_word_count(str, format, charlist) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/str_word_count/
      // original by: Ole Vrijenhoek
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //    input by: Bug?
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: str_word_count("Hello fri3nd, you're\r\n       looking          good today!", 1)
      //   returns 1: ['Hello', 'fri', 'nd', "you're", 'looking', 'good', 'today']
      //   example 2: str_word_count("Hello fri3nd, you're\r\n       looking          good today!", 2)
      //   returns 2: {0: 'Hello', 6: 'fri', 10: 'nd', 14: "you're", 29: 'looking', 46: 'good', 51: 'today'}
      //   example 3: str_word_count("Hello fri3nd, you're\r\n       looking          good today!", 1, '\u00e0\u00e1\u00e3\u00e73')
      //   returns 3: ['Hello', 'fri3nd', "you're", 'looking', 'good', 'today']
      //   example 4: str_word_count('hey', 2)
      //   returns 4: {0: 'hey'}
    
      var ctypeAlpha = require('../ctype/ctype_alpha')
      var len = str.length
      var cl = charlist && charlist.length
      var chr = ''
      var tmpStr = ''
      var i = 0
      var c = ''
      var wArr = []
      var wC = 0
      var assoc = {}
      var aC = 0
      var reg = ''
      var match = false
    
      var _pregQuote = function (str) {
        return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}=!<>\|:])/g, '\\$1')
      }
      var _getWholeChar = function (str, i) {
        // Use for rare cases of non-BMP characters
        var code = str.charCodeAt(i)
        if (code < 0xD800 || code > 0xDFFF) {
          return str.charAt(i)
        }
        if (code >= 0xD800 && code <= 0xDBFF) {
          // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single
          // characters)
          if (str.length <= (i + 1)) {
            throw new Error('High surrogate without following low surrogate')
          }
          var next = str.charCodeAt(i + 1)
          if (next < 0xDC00 || next > 0xDFFF) {
            throw new Error('High surrogate without following low surrogate')
          }
          return str.charAt(i) + str.charAt(i + 1)
        }
        // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
        if (i === 0) {
          throw new Error('Low surrogate without preceding high surrogate')
        }
        var prev = str.charCodeAt(i - 1)
        if (prev < 0xD800 || prev > 0xDBFF) {
          // (could change last hex to 0xDB7F to treat high private surrogates as single characters)
          throw new Error('Low surrogate without preceding high surrogate')
        }
        // We can pass over low surrogates now as the second component in a pair which we have already
        // processed
        return false
      }
    
      if (cl) {
        reg = '^(' + _pregQuote(_getWholeChar(charlist, 0))
        for (i = 1; i < cl; i++) {
          if ((chr = _getWholeChar(charlist, i)) === false) {
            continue
          }
          reg += '|' + _pregQuote(chr)
        }
        reg += ')$'
        reg = new RegExp(reg)
      }
    
      for (i = 0; i < len; i++) {
        if ((c = _getWholeChar(str, i)) === false) {
          continue
        }
        // No hyphen at beginning or end unless allowed in charlist (or locale)
        // No apostrophe at beginning unless allowed in charlist (or locale)
        // @todo: Make this more readable
        match = ctypeAlpha(c) ||
          (reg && c.search(reg) !== -1) ||
          ((i !== 0 && i !== len - 1) && c === '-') ||
          (i !== 0 && c === "'")
        if (match) {
          if (tmpStr === '' && format === 2) {
            aC = i
          }
          tmpStr = tmpStr + c
        }
        if (i === len - 1 || !match && tmpStr !== '') {
          if (format !== 2) {
            wArr[wArr.length] = tmpStr
          } else {
            assoc[aC] = tmpStr
          }
          tmpStr = ''
          wC++
        }
      }
    
      if (!format) {
        return wC
      } else if (format === 1) {
        return wArr
      } else if (format === 2) {
        return assoc
      }
    
      throw new Error('You have supplied an incorrect format')
    }
  );

  $php.context.function.declare(
    '\\strcasecmp', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"}
    ],
    'int', function strcasecmp(fString1, fString2) {
      //  discuss at: http://locutus.io/php/strcasecmp/
      // original by: Martijn Wieringa
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: strcasecmp('Hello', 'hello')
      //   returns 1: 0
    
      var string1 = (fString1 + '').toLowerCase()
      var string2 = (fString2 + '').toLowerCase()
    
      if (string1 > string2) {
        return 1
      } else if (string1 === string2) {
        return 0
      }
    
      return -1
    }
  );

  $php.context.function.declare(
    '\\strchr', [
      {"name":"haystack","type":"mixed"},
      {"name":"needle","type":"mixed"},
      {"name":"part","type":"mixed"}
    ],
    'mixed', function strchr(haystack, needle, bool) {
      //  discuss at: http://locutus.io/php/strchr/
      // original by: Philip Peterson
      //   example 1: strchr('Kevin van Zonneveld', 'van')
      //   returns 1: 'van Zonneveld'
      //   example 2: strchr('Kevin van Zonneveld', 'van', true)
      //   returns 2: 'Kevin '
    
      var strstr = require('../strings/strstr')
      return strstr(haystack, needle, bool)
    }
  );

  $php.context.function.declare(
    '\\strcmp', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"}
    ],
    'int', function strcmp(str1, str2) {
      //  discuss at: http://locutus.io/php/strcmp/
      // original by: Waldo Malqui Silva (http://waldo.malqui.info)
      //    input by: Steve Hilder
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //  revised by: gorthaur
      //   example 1: strcmp( 'waldo', 'owald' )
      //   returns 1: 1
      //   example 2: strcmp( 'owald', 'waldo' )
      //   returns 2: -1
    
      return ((str1 === str2) ? 0 : ((str1 > str2) ? 1 : -1))
    }
  );

  $php.context.function.declare(
    '\\strcoll', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"}
    ],
    'int', function strcoll(str1, str2) {
      //  discuss at: http://locutus.io/php/strcoll/
      // original by: Brett Zamir (http://brett-zamir.me)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: strcoll('a', 'b')
      //   returns 1: -1
    
      var setlocale = require('../strings/setlocale')
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      setlocale('LC_ALL', 0) // ensure setup of localization variables takes place
    
      var cmp = $locutus.php.locales[$locutus.php.localeCategories.LC_COLLATE].LC_COLLATE
    
      return cmp(str1, str2)
    }
  );

  $php.context.function.declare(
    '\\strcspn', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"},
      {"name":"start","type":"int"},
      {"name":"length","type":"int"}
    ],
    'int', function strcspn(str, mask, start, length) {
      //  discuss at: http://locutus.io/php/strcspn/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: strcspn('abcdefg123', '1234567890')
      //   returns 1: 7
      //   example 2: strcspn('123abc', '1234567890')
      //   returns 2: 3
    
      start = start || 0
      var count = (length && ((start + length) < str.length)) ? start + length : str.length
      strct: for (var i = start, lgth = 0; i < count; i++) { // eslint-disable-line no-labels
        for (var j = 0; j < mask.length; j++) {
          if (str.charAt(i).indexOf(mask[j]) !== -1) {
            continue strct // eslint-disable-line no-labels
          }
        }
        ++lgth
      }
    
      return lgth
    }
  );

  $php.context.function.declare(
    '\\strip_tags', [
      {"name":"str","type":"string"},
      {"name":"allowable_tags","type":"string"}
    ],
    'string', function strip_tags(input, allowed) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/strip_tags/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Luke Godfrey
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Pul
      //    input by: Alex
      //    input by: Marc Palau
      //    input by: Brett Zamir (http://brett-zamir.me)
      //    input by: Bobby Drake
      //    input by: Evertjan Garretsen
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Eric Nagel
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Tomasz Wesolowski
      //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
      //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
      //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
      //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
      //   returns 2: '<p>Kevin van Zonneveld</p>'
      //   example 3: strip_tags("<a href='http://kvz.io'>Kevin van Zonneveld</a>", "<a>")
      //   returns 3: "<a href='http://kvz.io'>Kevin van Zonneveld</a>"
      //   example 4: strip_tags('1 < 5 5 > 1')
      //   returns 4: '1 < 5 5 > 1'
      //   example 5: strip_tags('1 <br/> 1')
      //   returns 5: '1  1'
      //   example 6: strip_tags('1 <br/> 1', '<br>')
      //   returns 6: '1 <br/> 1'
      //   example 7: strip_tags('1 <br/> 1', '<br><br/>')
      //   returns 7: '1 <br/> 1'
    
      // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
      allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
    
      var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
      var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
    
      return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
      })
    }
  );

  $php.context.function.declare(
    '\\stripos', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"string"},
      {"name":"offset","type":"int"}
    ],
    'int', function stripos(fHaystack, fNeedle, fOffset) {
      //  discuss at: http://locutus.io/php/stripos/
      // original by: Martijn Wieringa
      //  revised by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: stripos('ABC', 'a')
      //   returns 1: 0
    
      var haystack = (fHaystack + '').toLowerCase()
      var needle = (fNeedle + '').toLowerCase()
      var index = 0
    
      if ((index = haystack.indexOf(needle, fOffset)) !== -1) {
        return index
      }
    
      return false
    }
  );

  $php.context.function.declare(
    '\\stripslashes', [
      {"name":"str","type":"string"}
    ],
    'string', function stripslashes(str) {
      //       discuss at: http://locutus.io/php/stripslashes/
      //      original by: Kevin van Zonneveld (http://kvz.io)
      //      improved by: Ates Goral (http://magnetiq.com)
      //      improved by: marrtins
      //      improved by: rezna
      //         fixed by: Mick@el
      //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //      bugfixed by: Brett Zamir (http://brett-zamir.me)
      //         input by: Rick Waldron
      //         input by: Brant Messenger (http://www.brantmessenger.com/)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //        example 1: stripslashes('Kevin\'s code')
      //        returns 1: "Kevin's code"
      //        example 2: stripslashes('Kevin\\\'s code')
      //        returns 2: "Kevin\'s code"
    
      return (str + '')
        .replace(/\\(.?)/g, function (s, n1) {
          switch (n1) {
            case '\\':
              return '\\'
            case '0':
              return '\u0000'
            case '':
              return ''
            default:
              return n1
          }
        })
    }
  );

  $php.context.function.declare(
    '\\stristr', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"mixed"},
      {"name":"before_needle","type":"bool"}
    ],
    'string', function stristr(haystack, needle, bool) {
      //  discuss at: http://locutus.io/php/stristr/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: stristr('Kevin van Zonneveld', 'Van')
      //   returns 1: 'van Zonneveld'
      //   example 2: stristr('Kevin van Zonneveld', 'VAN', true)
      //   returns 2: 'Kevin '
    
      var pos = 0
    
      haystack += ''
      pos = haystack.toLowerCase()
        .indexOf((needle + '')
          .toLowerCase())
      if (pos === -1) {
        return false
      } else {
        if (bool) {
          return haystack.substr(0, pos)
        } else {
          return haystack.slice(pos)
        }
      }
    }
  );

  $php.context.function.declare(
    '\\strlen', [
      {"name":"string","type":"string"}
    ],
    'int', function strlen(string) {
      //  discuss at: http://locutus.io/php/strlen/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Sakimori
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //    input by: Kirk Strobeck
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //  revised by: Brett Zamir (http://brett-zamir.me)
      //      note 1: May look like overkill, but in order to be truly faithful to handling all Unicode
      //      note 1: characters and to this function in PHP which does not count the number of bytes
      //      note 1: but counts the number of characters, something like this is really necessary.
      //   example 1: strlen('Kevin van Zonneveld')
      //   returns 1: 19
      //   example 2: ini_set('unicode.semantics', 'on')
      //   example 2: strlen('A\ud87e\udc04Z')
      //   returns 2: 3
    
      var str = string + ''
    
      var iniVal = (typeof require !== 'undefined' ? require('../info/ini_get')('unicode.semantics') : undefined) || 'off'
      if (iniVal === 'off') {
        return str.length
      }
    
      var i = 0
      var lgth = 0
    
      var getWholeChar = function (str, i) {
        var code = str.charCodeAt(i)
        var next = ''
        var prev = ''
        if (code >= 0xD800 && code <= 0xDBFF) {
          // High surrogate (could change last hex to 0xDB7F to
          // treat high private surrogates as single characters)
          if (str.length <= (i + 1)) {
            throw new Error('High surrogate without following low surrogate')
          }
          next = str.charCodeAt(i + 1)
          if (next < 0xDC00 || next > 0xDFFF) {
            throw new Error('High surrogate without following low surrogate')
          }
          return str.charAt(i) + str.charAt(i + 1)
        } else if (code >= 0xDC00 && code <= 0xDFFF) {
          // Low surrogate
          if (i === 0) {
            throw new Error('Low surrogate without preceding high surrogate')
          }
          prev = str.charCodeAt(i - 1)
          if (prev < 0xD800 || prev > 0xDBFF) {
            // (could change last hex to 0xDB7F to treat high private surrogates
            // as single characters)
            throw new Error('Low surrogate without preceding high surrogate')
          }
          // We can pass over low surrogates now as the second
          // component in a pair which we have already processed
          return false
        }
        return str.charAt(i)
      }
    
      for (i = 0, lgth = 0; i < str.length; i++) {
        if ((getWholeChar(str, i)) === false) {
          continue
        }
        // Adapt this line at the top of any loop, passing in the whole string and
        // the current iteration and returning a variable to represent the individual character;
        // purpose is to treat the first part of a surrogate pair as the whole character and then
        // ignore the second part
        lgth++
      }
    
      return lgth
    }
  );

  $php.context.function.declare(
    '\\strnatcasecmp', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"}
    ],
    'int', function strnatcasecmp(a, b) {
      //       discuss at: http://locutus.io/php/strnatcasecmp/
      //      original by: Martin Pool
      // reimplemented by: Pierre-Luc Paour
      // reimplemented by: Kristof Coomans (SCK-CEN (Belgian Nucleair Research Centre))
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
      //         input by: Devan Penner-Woelk
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      // reimplemented by: Rafał Kukawski
      //        example 1: strnatcasecmp(10, 1)
      //        returns 1: 1
      //        example 2: strnatcasecmp('1', '10')
      //        returns 2: -1
    
      var strnatcmp = require('../strings/strnatcmp')
      var _phpCastString = require('../_helpers/_phpCastString')
    
      if (arguments.length !== 2) {
        return null
      }
    
      return strnatcmp(_phpCastString(a).toLowerCase(), _phpCastString(b).toLowerCase())
    }
  );

  $php.context.function.declare(
    '\\strnatcmp', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"}
    ],
    'int', function strnatcmp(a, b) {
      //       discuss at: http://locutus.io/php/strnatcmp/
      //      original by: Martijn Wieringa
      //      improved by: Michael White (http://getsprink.com)
      //      improved by: Jack
      //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // reimplemented by: Rafał Kukawski
      //        example 1: strnatcmp('abc', 'abc')
      //        returns 1: 0
      //        example 2: strnatcmp('a', 'b')
      //        returns 2: -1
      //        example 3: strnatcmp('10', '1')
      //        returns 3: 1
      //        example 4: strnatcmp('0000abc', '0abc')
      //        returns 4: 0
      //        example 5: strnatcmp('1239', '12345')
      //        returns 5: -1
      //        example 6: strnatcmp('t01239', 't012345')
      //        returns 6: 1
      //        example 7: strnatcmp('0A', '5N')
      //        returns 7: -1
    
      var _phpCastString = require('../_helpers/_phpCastString')
    
      var leadingZeros = /^0+(?=\d)/
      var whitespace = /^\s/
      var digit = /^\d/
    
      if (arguments.length !== 2) {
        return null
      }
    
      a = _phpCastString(a)
      b = _phpCastString(b)
    
      if (!a.length || !b.length) {
        return a.length - b.length
      }
    
      var i = 0
      var j = 0
    
      a = a.replace(leadingZeros, '')
      b = b.replace(leadingZeros, '')
    
      while (i < a.length && j < b.length) {
        // skip consecutive whitespace
        while (whitespace.test(a.charAt(i))) i++
        while (whitespace.test(b.charAt(j))) j++
    
        var ac = a.charAt(i)
        var bc = b.charAt(j)
        var aIsDigit = digit.test(ac)
        var bIsDigit = digit.test(bc)
    
        if (aIsDigit && bIsDigit) {
          var bias = 0
          var fractional = ac === '0' || bc === '0'
    
          do {
            if (!aIsDigit) {
              return -1
            } else if (!bIsDigit) {
              return 1
            } else if (ac < bc) {
              if (!bias) {
                bias = -1
              }
    
              if (fractional) {
                return -1
              }
            } else if (ac > bc) {
              if (!bias) {
                bias = 1
              }
    
              if (fractional) {
                return 1
              }
            }
    
            ac = a.charAt(++i)
            bc = b.charAt(++j)
    
            aIsDigit = digit.test(ac)
            bIsDigit = digit.test(bc)
          } while (aIsDigit || bIsDigit)
    
          if (!fractional && bias) {
            return bias
          }
    
          continue
        }
    
        if (!ac || !bc) {
          continue
        } else if (ac < bc) {
          return -1
        } else if (ac > bc) {
          return 1
        }
    
        i++
        j++
      }
    
      var iBeforeStrEnd = i < a.length
      var jBeforeStrEnd = j < b.length
    
      // Check which string ended first
      // return -1 if a, 1 if b, 0 otherwise
      return (iBeforeStrEnd > jBeforeStrEnd) - (iBeforeStrEnd < jBeforeStrEnd)
    }
  );

  $php.context.function.declare(
    '\\strncasecmp', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"},
      {"name":"len","type":"int"}
    ],
    'int', function strncasecmp(argStr1, argStr2, len) {
      //  discuss at: http://locutus.io/php/strncasecmp/
      // original by: Saulo Vallory
      //    input by: Nate
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //      note 1: Returns < 0 if str1 is less than str2 ; > 0
      //      note 1: if str1 is greater than str2, and 0 if they are equal.
      //   example 1: strncasecmp('Price 12.9', 'Price 12.15', 2)
      //   returns 1: 0
      //   example 2: strncasecmp('Price 12.09', 'Price 12.15', 10)
      //   returns 2: -1
      //   example 3: strncasecmp('Price 12.90', 'Price 12.15', 30)
      //   returns 3: 8
      //   example 4: strncasecmp('Version 12.9', 'Version 12.15', 20)
      //   returns 4: 8
      //   example 5: strncasecmp('Version 12.15', 'Version 12.9', 20)
      //   returns 5: -8
    
      var diff
      var i = 0
      var str1 = (argStr1 + '').toLowerCase().substr(0, len)
      var str2 = (argStr2 + '').toLowerCase().substr(0, len)
    
      if (str1.length !== str2.length) {
        if (str1.length < str2.length) {
          len = str1.length
          if (str2.substr(0, str1.length) === str1) {
            // return the difference of chars
            return str1.length - str2.length
          }
        } else {
          len = str2.length
          // str1 is longer than str2
          if (str1.substr(0, str2.length) === str2) {
            // return the difference of chars
            return str1.length - str2.length
          }
        }
      } else {
        // Avoids trying to get a char that does not exist
        len = str1.length
      }
    
      for (diff = 0, i = 0; i < len; i++) {
        diff = str1.charCodeAt(i) - str2.charCodeAt(i)
        if (diff !== 0) {
          return diff
        }
      }
    
      return 0
    }
  );

  $php.context.function.declare(
    '\\strncmp', [
      {"name":"str1","type":"string"},
      {"name":"str2","type":"string"},
      {"name":"len","type":"int"}
    ],
    'int', function strncmp(str1, str2, lgth) {
      //       discuss at: http://locutus.io/php/strncmp/
      //      original by: Waldo Malqui Silva (http://waldo.malqui.info)
      //         input by: Steve Hilder
      //      improved by: Kevin van Zonneveld (http://kvz.io)
      //       revised by: gorthaur
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //        example 1: strncmp('aaa', 'aab', 2)
      //        returns 1: 0
      //        example 2: strncmp('aaa', 'aab', 3 )
      //        returns 2: -1
    
      var s1 = (str1 + '')
        .substr(0, lgth)
      var s2 = (str2 + '')
        .substr(0, lgth)
    
      return ((s1 === s2) ? 0 : ((s1 > s2) ? 1 : -1))
    }
  );

  $php.context.function.declare(
    '\\strpbrk', [
      {"name":"haystack","type":"string"},
      {"name":"char_list","type":"string"}
    ],
    'string', function strpbrk(haystack, charList) {
      //  discuss at: http://locutus.io/php/strpbrk/
      // original by: Alfonso Jimenez (http://www.alfonsojimenez.com)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //  revised by: Christoph
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: strpbrk('This is a Simple text.', 'is')
      //   returns 1: 'is is a Simple text.'
    
      for (var i = 0, len = haystack.length; i < len; ++i) {
        if (charList.indexOf(haystack.charAt(i)) >= 0) {
          return haystack.slice(i)
        }
      }
      return false
    }
  );

  $php.context.function.declare(
    '\\strpos', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"mixed"},
      {"name":"offset","type":"int"}
    ],
    'mixed', function strpos(haystack, needle, offset) {
      //  discuss at: http://locutus.io/php/strpos/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Daniel Esteban
      //   example 1: strpos('Kevin van Zonneveld', 'e', 5)
      //   returns 1: 14
    
      var i = (haystack + '')
        .indexOf(needle, (offset || 0))
      return i === -1 ? false : i
    }
  );

  $php.context.function.declare(
    '\\strrchr', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"mixed"}
    ],
    'mixed', function strrchr(haystack, needle) {
      //  discuss at: http://locutus.io/php/strrchr/
      // original by: Brett Zamir (http://brett-zamir.me)
      //    input by: Jason Wong (http://carrot.org/)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: strrchr("Line 1\nLine 2\nLine 3", 10).substr(1)
      //   returns 1: 'Line 3'
    
      var pos = 0
    
      if (typeof needle !== 'string') {
        needle = String.fromCharCode(parseInt(needle, 10))
      }
      needle = needle.charAt(0)
      pos = haystack.lastIndexOf(needle)
      if (pos === -1) {
        return false
      }
    
      return haystack.substr(pos)
    }
  );

  $php.context.function.declare(
    '\\strrev', [
      {"name":"string","type":"string"}
    ],
    'string', function strrev(string) {
      //       discuss at: http://locutus.io/php/strrev/
      //      original by: Kevin van Zonneveld (http://kvz.io)
      //      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //        example 1: strrev('Kevin van Zonneveld')
      //        returns 1: 'dlevennoZ nav niveK'
      //        example 2: strrev('a\u0301haB')
      //        returns 2: 'Baha\u0301' // combining
      //        example 3: strrev('A\uD87E\uDC04Z')
      //        returns 3: 'Z\uD87E\uDC04A' // surrogates
      //             test: 'skip-3'
    
      string = string + ''
    
      // Performance will be enhanced with the next two lines of code commented
      // out if you don't care about combining characters
      // Keep Unicode combining characters together with the character preceding
      // them and which they are modifying (as in PHP 6)
      // See http://unicode.org/reports/tr44/#Property_Table (Me+Mn)
      // We also add the low surrogate range at the beginning here so it will be
      // maintained with its preceding high surrogate
    
      var chars = [
        '\uDC00-\uDFFF',
        '\u0300-\u036F',
        '\u0483-\u0489',
        '\u0591-\u05BD',
        '\u05BF',
        '\u05C1',
        '\u05C2',
        '\u05C4',
        '\u05C5',
        '\u05C7',
        '\u0610-\u061A',
        '\u064B-\u065E',
        '\u0670',
        '\u06D6-\u06DC',
        '\u06DE-\u06E4',
        '\u06E7\u06E8',
        '\u06EA-\u06ED',
        '\u0711',
        '\u0730-\u074A',
        '\u07A6-\u07B0',
        '\u07EB-\u07F3',
        '\u0901-\u0903',
        '\u093C',
        '\u093E-\u094D',
        '\u0951-\u0954',
        '\u0962',
        '\u0963',
        '\u0981-\u0983',
        '\u09BC',
        '\u09BE-\u09C4',
        '\u09C7',
        '\u09C8',
        '\u09CB-\u09CD',
        '\u09D7',
        '\u09E2',
        '\u09E3',
        '\u0A01-\u0A03',
        '\u0A3C',
        '\u0A3E-\u0A42',
        '\u0A47',
        '\u0A48',
        '\u0A4B-\u0A4D',
        '\u0A51',
        '\u0A70',
        '\u0A71',
        '\u0A75',
        '\u0A81-\u0A83',
        '\u0ABC',
        '\u0ABE-\u0AC5',
        '\u0AC7-\u0AC9',
        '\u0ACB-\u0ACD',
        '\u0AE2',
        '\u0AE3',
        '\u0B01-\u0B03',
        '\u0B3C',
        '\u0B3E-\u0B44',
        '\u0B47',
        '\u0B48',
        '\u0B4B-\u0B4D',
        '\u0B56',
        '\u0B57',
        '\u0B62',
        '\u0B63',
        '\u0B82',
        '\u0BBE-\u0BC2',
        '\u0BC6-\u0BC8',
        '\u0BCA-\u0BCD',
        '\u0BD7',
        '\u0C01-\u0C03',
        '\u0C3E-\u0C44',
        '\u0C46-\u0C48',
        '\u0C4A-\u0C4D',
        '\u0C55',
        '\u0C56',
        '\u0C62',
        '\u0C63',
        '\u0C82',
        '\u0C83',
        '\u0CBC',
        '\u0CBE-\u0CC4',
        '\u0CC6-\u0CC8',
        '\u0CCA-\u0CCD',
        '\u0CD5',
        '\u0CD6',
        '\u0CE2',
        '\u0CE3',
        '\u0D02',
        '\u0D03',
        '\u0D3E-\u0D44',
        '\u0D46-\u0D48',
        '\u0D4A-\u0D4D',
        '\u0D57',
        '\u0D62',
        '\u0D63',
        '\u0D82',
        '\u0D83',
        '\u0DCA',
        '\u0DCF-\u0DD4',
        '\u0DD6',
        '\u0DD8-\u0DDF',
        '\u0DF2',
        '\u0DF3',
        '\u0E31',
        '\u0E34-\u0E3A',
        '\u0E47-\u0E4E',
        '\u0EB1',
        '\u0EB4-\u0EB9',
        '\u0EBB',
        '\u0EBC',
        '\u0EC8-\u0ECD',
        '\u0F18',
        '\u0F19',
        '\u0F35',
        '\u0F37',
        '\u0F39',
        '\u0F3E',
        '\u0F3F',
        '\u0F71-\u0F84',
        '\u0F86',
        '\u0F87',
        '\u0F90-\u0F97',
        '\u0F99-\u0FBC',
        '\u0FC6',
        '\u102B-\u103E',
        '\u1056-\u1059',
        '\u105E-\u1060',
        '\u1062-\u1064',
        '\u1067-\u106D',
        '\u1071-\u1074',
        '\u1082-\u108D',
        '\u108F',
        '\u135F',
        '\u1712-\u1714',
        '\u1732-\u1734',
        '\u1752',
        '\u1753',
        '\u1772',
        '\u1773',
        '\u17B6-\u17D3',
        '\u17DD',
        '\u180B-\u180D',
        '\u18A9',
        '\u1920-\u192B',
        '\u1930-\u193B',
        '\u19B0-\u19C0',
        '\u19C8',
        '\u19C9',
        '\u1A17-\u1A1B',
        '\u1B00-\u1B04',
        '\u1B34-\u1B44',
        '\u1B6B-\u1B73',
        '\u1B80-\u1B82',
        '\u1BA1-\u1BAA',
        '\u1C24-\u1C37',
        '\u1DC0-\u1DE6',
        '\u1DFE',
        '\u1DFF',
        '\u20D0-\u20F0',
        '\u2DE0-\u2DFF',
        '\u302A-\u302F',
        '\u3099',
        '\u309A',
        '\uA66F-\uA672',
        '\uA67C',
        '\uA67D',
        '\uA802',
        '\uA806',
        '\uA80B',
        '\uA823-\uA827',
        '\uA880',
        '\uA881',
        '\uA8B4-\uA8C4',
        '\uA926-\uA92D',
        '\uA947-\uA953',
        '\uAA29-\uAA36',
        '\uAA43',
        '\uAA4C',
        '\uAA4D',
        '\uFB1E',
        '\uFE00-\uFE0F',
        '\uFE20-\uFE26'
      ]
    
      var graphemeExtend = new RegExp('(.)([' + chars.join('') + ']+)', 'g')
    
      // Temporarily reverse
      string = string.replace(graphemeExtend, '$2$1')
      return string.split('').reverse().join('')
    }
  );

  $php.context.function.declare(
    '\\strripos', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"string"},
      {"name":"offset","type":"int"}
    ],
    'int', function strripos(haystack, needle, offset) {
      //  discuss at: http://locutus.io/php/strripos/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //    input by: saulius
      //   example 1: strripos('Kevin van Zonneveld', 'E')
      //   returns 1: 16
    
      haystack = (haystack + '')
        .toLowerCase()
      needle = (needle + '')
        .toLowerCase()
    
      var i = -1
      if (offset) {
        i = (haystack + '')
          .slice(offset)
          .lastIndexOf(needle) // strrpos' offset indicates starting point of range till end,
        // while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
        if (i !== -1) {
          i += offset
        }
      } else {
        i = (haystack + '')
          .lastIndexOf(needle)
      }
      return i >= 0 ? i : false
    }
  );

  $php.context.function.declare(
    '\\strrpos', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"string"},
      {"name":"offset","type":"int"}
    ],
    'undefined', function strrpos(haystack, needle, offset) {
      //  discuss at: http://locutus.io/php/strrpos/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //    input by: saulius
      //   example 1: strrpos('Kevin van Zonneveld', 'e')
      //   returns 1: 16
      //   example 2: strrpos('somepage.com', '.', false)
      //   returns 2: 8
      //   example 3: strrpos('baa', 'a', 3)
      //   returns 3: false
      //   example 4: strrpos('baa', 'a', 2)
      //   returns 4: 2
    
      var i = -1
      if (offset) {
        i = (haystack + '')
          .slice(offset)
          .lastIndexOf(needle) // strrpos' offset indicates starting point of range till end,
        // while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
        if (i !== -1) {
          i += offset
        }
      } else {
        i = (haystack + '')
          .lastIndexOf(needle)
      }
      return i >= 0 ? i : false
    }
  );

  $php.context.function.declare(
    '\\strspn', [
      {"name":"subject","type":"string"},
      {"name":"mask","type":"string"},
      {"name":"start","type":"int"},
      {"name":"length","type":"int"}
    ],
    'int', function strspn(str1, str2, start, lgth) {
      //  discuss at: http://locutus.io/php/strspn/
      // original by: Valentina De Rosa
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: strspn('42 is the answer, what is the question ...', '1234567890')
      //   returns 1: 2
      //   example 2: strspn('foo', 'o', 1, 2)
      //   returns 2: 2
    
      var found
      var stri
      var strj
      var j = 0
      var i = 0
    
      start = start ? (start < 0 ? (str1.length + start) : start) : 0
      lgth = lgth ? ((lgth < 0) ? (str1.length + lgth - start) : lgth) : str1.length - start
      str1 = str1.substr(start, lgth)
    
      for (i = 0; i < str1.length; i++) {
        found = 0
        stri = str1.substring(i, i + 1)
        for (j = 0; j <= str2.length; j++) {
          strj = str2.substring(j, j + 1)
          if (stri === strj) {
            found = 1
            break
          }
        }
        if (found !== 1) {
          return i
        }
      }
    
      return i
    }
  );

  $php.context.function.declare(
    '\\strstr', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"mixed"},
      {"name":"before_needle","type":"bool"}
    ],
    'string', function strstr(haystack, needle, bool) {
      //  discuss at: http://locutus.io/php/strstr/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      //   example 1: strstr('Kevin van Zonneveld', 'van')
      //   returns 1: 'van Zonneveld'
      //   example 2: strstr('Kevin van Zonneveld', 'van', true)
      //   returns 2: 'Kevin '
      //   example 3: strstr('name@example.com', '@')
      //   returns 3: '@example.com'
      //   example 4: strstr('name@example.com', '@', true)
      //   returns 4: 'name'
    
      var pos = 0
    
      haystack += ''
      pos = haystack.indexOf(needle)
      if (pos === -1) {
        return false
      } else {
        if (bool) {
          return haystack.substr(0, pos)
        } else {
          return haystack.slice(pos)
        }
      }
    }
  );

  $php.context.function.declare(
    '\\strtok', [
      {"name":"str","type":"string"},
      {"name":"token","type":"string"}
    ],
    'string', function strtok(str, tokens) {
      //  discuss at: http://locutus.io/php/strtok/
      // original by: Brett Zamir (http://brett-zamir.me)
      //      note 1: Use tab and newline as tokenizing characters as well
      //   example 1: var $string = "\t\t\t\nThis is\tan example\nstring\n"
      //   example 1: var $tok = strtok($string, " \n\t")
      //   example 1: var $b = ''
      //   example 1: while ($tok !== false) {$b += "Word="+$tok+"\n"; $tok = strtok(" \n\t");}
      //   example 1: var $result = $b
      //   returns 1: "Word=This\nWord=is\nWord=an\nWord=example\nWord=string\n"
    
      var $global = (typeof window !== 'undefined' ? window : global)
      $global.$locutus = $global.$locutus || {}
      var $locutus = $global.$locutus
      $locutus.php = $locutus.php || {}
    
      if (tokens === undefined) {
        tokens = str
        str = $locutus.php.strtokleftOver
      }
      if (str.length === 0) {
        return false
      }
      if (tokens.indexOf(str.charAt(0)) !== -1) {
        return strtok(str.substr(1), tokens)
      }
      for (var i = 0; i < str.length; i++) {
        if (tokens.indexOf(str.charAt(i)) !== -1) {
          break
        }
      }
      $locutus.php.strtokleftOver = str.substr(i + 1)
    
      return str.substring(0, i)
    }
  );

  $php.context.function.declare(
    '\\strtolower', [
      {"name":"str","type":"string"}
    ],
    'string', function strtolower(str) {
      //  discuss at: http://locutus.io/php/strtolower/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: strtolower('Kevin van Zonneveld')
      //   returns 1: 'kevin van zonneveld'
    
      return (str + '')
        .toLowerCase()
    }
  );

  $php.context.function.declare(
    '\\strtoupper', [
      {"name":"string","type":"string"}
    ],
    'string', function strtoupper(str) {
      //  discuss at: http://locutus.io/php/strtoupper/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: strtoupper('Kevin van Zonneveld')
      //   returns 1: 'KEVIN VAN ZONNEVELD'
    
      return (str + '')
        .toUpperCase()
    }
  );

  $php.context.function.declare(
    '\\strtr', [
      {"name":"str","type":"string"},
      {"name":"from","type":"string"},
      {"name":"to","type":"string"}
    ],
    'string', function strtr(str, trFrom, trTo) {
      //  discuss at: http://locutus.io/php/strtr/
      // original by: Brett Zamir (http://brett-zamir.me)
      //    input by: uestla
      //    input by: Alan C
      //    input by: Taras Bogach
      //    input by: jpfle
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Brett Zamir (http://brett-zamir.me)
      //   example 1: var $trans = {'hello' : 'hi', 'hi' : 'hello'}
      //   example 1: strtr('hi all, I said hello', $trans)
      //   returns 1: 'hello all, I said hi'
      //   example 2: strtr('äaabaåccasdeöoo', 'äåö','aao')
      //   returns 2: 'aaabaaccasdeooo'
      //   example 3: strtr('ääääääää', 'ä', 'a')
      //   returns 3: 'aaaaaaaa'
      //   example 4: strtr('http', 'pthxyz','xyzpth')
      //   returns 4: 'zyyx'
      //   example 5: strtr('zyyx', 'pthxyz','xyzpth')
      //   returns 5: 'http'
      //   example 6: strtr('aa', {'a':1,'aa':2})
      //   returns 6: '2'
    
      var krsort = require('../array/krsort')
      var iniSet = require('../info/ini_set')
    
      var fr = ''
      var i = 0
      var j = 0
      var lenStr = 0
      var lenFrom = 0
      var sortByReference = false
      var fromTypeStr = ''
      var toTypeStr = ''
      var istr = ''
      var tmpFrom = []
      var tmpTo = []
      var ret = ''
      var match = false
    
      // Received replace_pairs?
      // Convert to normal trFrom->trTo chars
      if (typeof trFrom === 'object') {
        // Not thread-safe; temporarily set to true
        // @todo: Don't rely on ini here, use internal krsort instead
        sortByReference = iniSet('locutus.sortByReference', false)
        trFrom = krsort(trFrom)
        iniSet('locutus.sortByReference', sortByReference)
    
        for (fr in trFrom) {
          if (trFrom.hasOwnProperty(fr)) {
            tmpFrom.push(fr)
            tmpTo.push(trFrom[fr])
          }
        }
    
        trFrom = tmpFrom
        trTo = tmpTo
      }
    
      // Walk through subject and replace chars when needed
      lenStr = str.length
      lenFrom = trFrom.length
      fromTypeStr = typeof trFrom === 'string'
      toTypeStr = typeof trTo === 'string'
    
      for (i = 0; i < lenStr; i++) {
        match = false
        if (fromTypeStr) {
          istr = str.charAt(i)
          for (j = 0; j < lenFrom; j++) {
            if (istr === trFrom.charAt(j)) {
              match = true
              break
            }
          }
        } else {
          for (j = 0; j < lenFrom; j++) {
            if (str.substr(i, trFrom[j].length) === trFrom[j]) {
              match = true
              // Fast forward
              i = (i + trFrom[j].length) - 1
              break
            }
          }
        }
        if (match) {
          ret += toTypeStr ? trTo.charAt(j) : trTo[j]
        } else {
          ret += str.charAt(i)
        }
      }
    
      return ret
    }
  );

  $php.context.function.declare(
    '\\substr', [
      {"name":"string","type":"string"},
      {"name":"start","type":"int"},
      {"name":"length","type":"int"}
    ],
    'string', function substr(str, start, len) {
      //  discuss at: http://locutus.io/php/substr/
      // original by: Martijn Wieringa
      // bugfixed by: T.Wild
      // improved by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //  revised by: Theriault (https://github.com/Theriault)
      //      note 1: Handles rare Unicode characters if 'unicode.semantics' ini (PHP6) is set to 'on'
      //   example 1: substr('abcdef', 0, -1)
      //   returns 1: 'abcde'
      //   example 2: substr(2, 0, -6)
      //   returns 2: false
      //   example 3: ini_set('unicode.semantics', 'on')
      //   example 3: substr('a\uD801\uDC00', 0, -1)
      //   returns 3: 'a'
      //   example 4: ini_set('unicode.semantics', 'on')
      //   example 4: substr('a\uD801\uDC00', 0, 2)
      //   returns 4: 'a\uD801\uDC00'
      //   example 5: ini_set('unicode.semantics', 'on')
      //   example 5: substr('a\uD801\uDC00', -1, 1)
      //   returns 5: '\uD801\uDC00'
      //   example 6: ini_set('unicode.semantics', 'on')
      //   example 6: substr('a\uD801\uDC00z\uD801\uDC00', -3, 2)
      //   returns 6: '\uD801\uDC00z'
      //   example 7: ini_set('unicode.semantics', 'on')
      //   example 7: substr('a\uD801\uDC00z\uD801\uDC00', -3, -1)
      //   returns 7: '\uD801\uDC00z'
      //        test: skip-3 skip-4 skip-5 skip-6 skip-7
    
      str += ''
      var end = str.length
    
      var iniVal = (typeof require !== 'undefined' ? require('../info/ini_get')('unicode.emantics') : undefined) || 'off'
    
      if (iniVal === 'off') {
        // assumes there are no non-BMP characters;
        // if there may be such characters, then it is best to turn it on (critical in true XHTML/XML)
        if (start < 0) {
          start += end
        }
        if (typeof len !== 'undefined') {
          if (len < 0) {
            end = len + end
          } else {
            end = len + start
          }
        }
    
        // PHP returns false if start does not fall within the string.
        // PHP returns false if the calculated end comes before the calculated start.
        // PHP returns an empty string if start and end are the same.
        // Otherwise, PHP returns the portion of the string from start to end.
        if (start >= str.length || start < 0 || start > end) {
          return false
        }
    
        return str.slice(start, end)
      }
    
      // Full-blown Unicode including non-Basic-Multilingual-Plane characters
      var i = 0
      var allBMP = true
      var es = 0
      var el = 0
      var se = 0
      var ret = ''
    
      for (i = 0; i < str.length; i++) {
        if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
          allBMP = false
          break
        }
      }
    
      if (!allBMP) {
        if (start < 0) {
          for (i = end - 1, es = (start += end); i >= es; i--) {
            if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
              start--
              es--
            }
          }
        } else {
          var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
          while ((surrogatePairs.exec(str)) !== null) {
            var li = surrogatePairs.lastIndex
            if (li - 2 < start) {
              start++
            } else {
              break
            }
          }
        }
    
        if (start >= end || start < 0) {
          return false
        }
        if (len < 0) {
          for (i = end - 1, el = (end += len); i >= el; i--) {
            if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
              end--
              el--
            }
          }
          if (start > end) {
            return false
          }
          return str.slice(start, end)
        } else {
          se = start + len
          for (i = start; i < se; i++) {
            ret += str.charAt(i)
            if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
              // Go one further, since one of the "characters" is part of a surrogate pair
              se++
            }
          }
          return ret
        }
      }
    }
  );

  $php.context.function.declare(
    '\\substr_compare', [
      {"name":"main_str","type":"string"},
      {"name":"str","type":"string"},
      {"name":"offset","type":"int"},
      {"name":"length","type":"int"},
      {"name":"case_insensitivity","type":"bool"}
    ],
    'int', function substr_compare(mainStr, str, offset, length, caseInsensitivity) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/substr_compare/
      // original by: Brett Zamir (http://brett-zamir.me)
      // original by: strcasecmp, strcmp
      //   example 1: substr_compare("abcde", "bc", 1, 2)
      //   returns 1: 0
    
      if (!offset && offset !== 0) {
        throw new Error('Missing offset for substr_compare()')
      }
    
      if (offset < 0) {
        offset = mainStr.length + offset
      }
    
      if (length && length > (mainStr.length - offset)) {
        return false
      }
      length = length || mainStr.length - offset
    
      mainStr = mainStr.substr(offset, length)
      // Should only compare up to the desired length
      str = str.substr(0, length)
      if (caseInsensitivity) {
        // Works as strcasecmp
        mainStr = (mainStr + '').toLowerCase()
        str = (str + '').toLowerCase()
        if (mainStr === str) {
          return 0
        }
        return (mainStr > str) ? 1 : -1
      }
      // Works as strcmp
      return ((mainStr === str) ? 0 : ((mainStr > str) ? 1 : -1))
    }
  );

  $php.context.function.declare(
    '\\substr_count', [
      {"name":"haystack","type":"string"},
      {"name":"needle","type":"string"},
      {"name":"offset","type":"int"},
      {"name":"length","type":"int"}
    ],
    'int', function substr_count(haystack, needle, offset, length) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/substr_count/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      // improved by: Thomas
      //   example 1: substr_count('Kevin van Zonneveld', 'e')
      //   returns 1: 3
      //   example 2: substr_count('Kevin van Zonneveld', 'K', 1)
      //   returns 2: 0
      //   example 3: substr_count('Kevin van Zonneveld', 'Z', 0, 10)
      //   returns 3: false
    
      var cnt = 0
    
      haystack += ''
      needle += ''
      if (isNaN(offset)) {
        offset = 0
      }
      if (isNaN(length)) {
        length = 0
      }
      if (needle.length === 0) {
        return false
      }
      offset--
    
      while ((offset = haystack.indexOf(needle, offset + 1)) !== -1) {
        if (length > 0 && (offset + needle.length) > length) {
          return false
        }
        cnt++
      }
    
      return cnt
    }
  );

  $php.context.function.declare(
    '\\substr_replace', [
      {"name":"string","type":"mixed"},
      {"name":"replacement","type":"string"},
      {"name":"start","type":"int"},
      {"name":"length","type":"int"}
    ],
    'mixed', function substr_replace(str, replace, start, length) { // eslint-disable-line camelcase
      //  discuss at: http://locutus.io/php/substr_replace/
      // original by: Brett Zamir (http://brett-zamir.me)
      //   example 1: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', 0)
      //   returns 1: 'bob'
      //   example 2: var $var = 'ABCDEFGH:/MNRPQR/'
      //   example 2: substr_replace($var, 'bob', 0, $var.length)
      //   returns 2: 'bob'
      //   example 3: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', 0, 0)
      //   returns 3: 'bobABCDEFGH:/MNRPQR/'
      //   example 4: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', 10, -1)
      //   returns 4: 'ABCDEFGH:/bob/'
      //   example 5: substr_replace('ABCDEFGH:/MNRPQR/', 'bob', -7, -1)
      //   returns 5: 'ABCDEFGH:/bob/'
      //   example 6: substr_replace('ABCDEFGH:/MNRPQR/', '', 10, -1)
      //   returns 6: 'ABCDEFGH://'
    
      if (start < 0) {
        // start position in str
        start = start + str.length
      }
      length = length !== undefined ? length : str.length
      if (length < 0) {
        length = length + str.length - start
      }
    
      return [
        str.slice(0, start),
        replace.substr(0, length),
        replace.slice(length),
        str.slice(start + length)
      ].join('')
    }
  );

  $php.context.function.declare(
    '\\trim', [
      {"name":"str","type":"string"},
      {"name":"charlist","type":"string"}
    ],
    'string', function trim(str, charlist) {
      //  discuss at: http://locutus.io/php/trim/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // improved by: mdsjack (http://www.mdsjack.bo.it)
      // improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Steven Levithan (http://blog.stevenlevithan.com)
      // improved by: Jack
      //    input by: Erkekjetter
      //    input by: DxGx
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //   example 1: trim('    Kevin van Zonneveld    ')
      //   returns 1: 'Kevin van Zonneveld'
      //   example 2: trim('Hello World', 'Hdle')
      //   returns 2: 'o Wor'
      //   example 3: trim(16, 1)
      //   returns 3: '6'
    
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
      var l = 0
      var i = 0
      str += ''
    
      if (charlist) {
        whitespace = (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^:])/g, '$1')
      }
    
      l = str.length
      for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
          str = str.substring(i)
          break
        }
      }
    
      l = str.length
      for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
          str = str.substring(0, i + 1)
          break
        }
      }
    
      return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
    }
  );

  $php.context.function.declare(
    '\\ucfirst', [
      {"name":"str","type":"mixed"}
    ],
    'mixed', function ucfirst(str) {
      //  discuss at: http://locutus.io/php/ucfirst/
      // original by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      // improved by: Brett Zamir (http://brett-zamir.me)
      //   example 1: ucfirst('kevin van zonneveld')
      //   returns 1: 'Kevin van zonneveld'
    
      str += ''
      var f = str.charAt(0)
        .toUpperCase()
      return f + str.substr(1)
    }
  );

  $php.context.function.declare(
    '\\ucwords', [
      {"name":"str","type":"string"},
      {"name":"delimiters","type":"string"}
    ],
    'string', function ucwords(str) {
      //  discuss at: http://locutus.io/php/ucwords/
      // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // improved by: Waldo Malqui Silva (http://waldo.malqui.info)
      // improved by: Robin
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
      //    input by: James (http://www.james-bell.co.uk/)
      //   example 1: ucwords('kevin van  zonneveld')
      //   returns 1: 'Kevin Van  Zonneveld'
      //   example 2: ucwords('HELLO WORLD')
      //   returns 2: 'HELLO WORLD'
    
      return (str + '')
        .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
          return $1.toUpperCase()
        })
    }
  );

  $php.context.function.declare(
    '\\vprintf', [
      {"name":"format","type":"string"},
      {"name":"args","type":"\\array"}
    ],
    'int', function vprintf(format, args) {
      //       discuss at: http://locutus.io/php/vprintf/
      //      original by: Ash Searle (http://hexmen.com/blog/)
      //      improved by: Michael White (http://getsprink.com)
      // reimplemented by: Brett Zamir (http://brett-zamir.me)
      //        example 1: vprintf("%01.2f", 123.1)
      //        returns 1: 6
    
      var sprintf = require('../strings/sprintf')
      var echo = require('../strings/echo')
      var ret = sprintf.apply(this, [format].concat(args))
      echo(ret)
    
      return ret.length
    }
  );

  $php.context.function.declare(
    '\\vsprintf', [
      {"name":"format","type":"string"},
      {"name":"args","type":"\\array"}
    ],
    'string', function vsprintf(format, args) {
      //  discuss at: http://locutus.io/php/vsprintf/
      // original by: ejsanders
      //   example 1: vsprintf('%04d-%02d-%02d', [1988, 8, 1])
      //   returns 1: '1988-08-01'
    
      var sprintf = require('../strings/sprintf')
    
      return sprintf.apply(this, [format].concat(args))
    }
  );

  $php.context.function.declare(
    '\\wordwrap', [
      {"name":"str","type":"string"},
      {"name":"width","type":"int"},
      {"name":"break","type":"string"},
      {"name":"cut","type":"bool"}
    ],
    'string', function wordwrap(str, intWidth, strBreak, cut) {
      //  discuss at: http://locutus.io/php/wordwrap/
      // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // improved by: Nick Callen
      // improved by: Kevin van Zonneveld (http://kvz.io)
      // improved by: Sakimori
      //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
      // bugfixed by: Michael Grier
      // bugfixed by: Feras ALHAEK
      //      note 1: It would be great if this function could be split up to have
      //      note 1: smaller line lengths, less ternary operators, and more readable variable names
      //   example 1: wordwrap('Kevin van Zonneveld', 6, '|', true)
      //   returns 1: 'Kevin |van |Zonnev|eld'
      //   example 2: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br />\n')
      //   returns 2: 'The quick brown fox <br />\njumped over the lazy<br />\n dog.'
      //   example 3: wordwrap('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')
      //   returns 3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod \ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \nveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea \ncommodo consequat.'
    
      var m = ((arguments.length >= 2) ? arguments[1] : 75)
      var b = ((arguments.length >= 3) ? arguments[2] : '\n')
      var c = ((arguments.length >= 4) ? arguments[3] : false)
    
      var i, j, l, s, r
    
      str += ''
    
      if (m < 1) {
        return str
      }
    
      for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
        // @todo: Split this up over many more lines and more semantic variable names
        // so it becomes readable
        for (s = r[i], r[i] = '';
          s.length > m;
          r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : '')) {
          j = c === 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1]
            ? m
            : j.input.length - j[0].length || c === true && m ||
              j.input.length + (j = s.slice(m).match(/^\S*/))[0].length
        }
      }
    
      return r.join('\n')
    }
  );

};