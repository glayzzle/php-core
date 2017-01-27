#!/usr/bin/node
/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-core/graphs/contributors
 * @url http://glayzzle.com
 */
'use strict';

var phpParserClass = require('php-parser');
var phpParser = new phpParserClass({
  parser: {
    extractDoc: true
  }
});
var docParserClass = require('doc-parser');
var docParser = new docParserClass();
var fs = require('fs');

var stubPath = __dirname + '/stubs/standard/';
var files = [
  'Core.php', 'Core_d.php', 'Core_c.php',
  'date.php', 'date_d.php', 'date_c.php',
  'ereg.php', 'json.php', 'SPL.php',
  'SPL_f.php', 'SPL_c1.php', 'standard_0.php',
  'standard_1.php', 'standard_2.php', 'standard_3.php',
  'standard_4.php', 'standard_5.php', 'standard_6.php',
  'standard_7.php', 'standard_8.php', 'standard_9.php',
  'standard_defines.php', 'xml.php'
];
var jsMethods = require(__dirname + '/locutus/src/php/index');
var phpMethods = {};
var defines = {};

console.log('Start to scan PHP stubs ...');

function extractMethods(node) {
  var result = [];
  if (node && node.kind) {
    if (node.kind === 'function') {
      return node;
    } else if (node.kind === 'doc' && node.isDoc) {
      return node;
    }
    if (node.kind === 'call' && node.what.name === 'define') {
      defines[node.arguments[0].value] = node.arguments[1].value;
    }
    for(var k in node) {
      var c = extractMethods(node[k]);
      if (Array.isArray(c)) {
        result = result.concat(c);
      } else if (c) {
        result.push(c);
      }
    }
  } else if (Array.isArray(node)) {
    for(var i = 0; i < node.length; i++) {
      var c = extractMethods(node[i]);
      if (Array.isArray(c)) {
        result = result.concat(c);
      } else if (c) {
        result.push(c);
      }
    }
  }
  return result;
}

function getDocNodes(doc, name) {
  var nodes = [];
  if (doc && Array.isArray(doc.body)) {
    for(var i = 0; i < doc.body.length; i++) {
      if (doc.body[i].kind === name) {
        nodes.push(doc.body[i]);
      }
    }
  }
  return nodes;
}

var nbFunctions = 0;

for(var i = 0; i < files.length; i++) {
  console.log('Scan ' + files[i]);
  var structure = phpParser.parseCode(
    fs.readFileSync(stubPath + files[i], { encoding: 'utf8' })
  );
  var methods = extractMethods(structure.children);
  var doc = null;
  for(var m = 0; m < methods.length; m++) {
    var item = methods[m];
    if (item.kind === 'doc') {
      doc = item;
    } else {
      if (doc) {
        nbFunctions++;
        doc = docParser.parse(doc.lines);
        var type = getDocNodes(doc, 'return');
        var params = getDocNodes(doc, 'param');
        phpMethods[item.name] = {
          args: [],
          type: type.length > 0 ? type[0].what.name : 'mixed'
        };
        if (item.type && item.type.name) {
          phpMethods[item.name].type = item.type.name;
        }
        if (item.arguments && item.arguments.length > 0) {
          for(var p = 0; p < item.arguments.length; p++) {
            phpMethods[item.name].args.push(
              {
                name: item.arguments[p].name,
                type: item.arguments[p].type ? item.arguments[p].type.name : (
                  params[p] ? params[p].type.name : 'mixed'
                )
              }
            );
            if (item.value) {
              if (item.value.kind === 'number') {
                phpMethods[item.name].args[p] = item.value.value;
              } else if (item.value.kind === 'constref') {
                phpMethods[item.name].args[p] = item.value.name.name;
              } else if (item.value.kind === 'boolean') {
                phpMethods[item.name].args[p] = item.value.value;
              } else if (item.value.kind === 'string') {
                phpMethods[item.name].args[p] = item.value.value;
              } else {
                console.log('[WARN] Not supported default type in ' + item.name + ', argument ' + item.arguments[p].name);
              }
            }
          }
        }
        doc = null;
      } else {
        console.log('[WARN] ' + item.name + ' does not have annotations, not exported !');
      }
    }
  }
}

console.log('Found ' + nbFunctions + ' functions');
var nbExport = 0;
for(var mod in jsMethods) {
  var curFn = nbExport;
  var buffer = [
    '/*!',
    ' * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors)',
    ' * @authors http://locutus.io/authors',
    ' * @url http://locutus.io',
    ' */',
    '\'use strict\';',
    'module.exports = function($php) {'
  ].join('\n');
  var methods = jsMethods[mod];
  for(var name in methods) {
    if (!(name in phpMethods)) {
      console.log('[WARN] ' + name + ' does not have any stub !');
    } else {
      var desc = phpMethods[name];
      var method = methods[name];
      buffer += '\n  $php.context.function.declare(';
      buffer += '\n    \'\\\\' + name + '\', [';
      if (desc.args.length > 0) {
        var args = [];
        for(var i = 0; i < desc.args.length; i++) {
          args.push(JSON.stringify(desc.args[i]));
        }
        buffer += '\n      ' + args.join(',\n      ');
        buffer += '\n    ],';
      } else {
        buffer += '],';
      }
      buffer += '\n    \'' + desc.type + '\', ';
      buffer += methods[name].toString().split('\n').join('\n    ');
      buffer += '\n  );\n';
      nbExport++;
    }
  }
  buffer += '\n};';
  if (nbExport > curFn) {
    fs.writeFileSync(__dirname + '/../src/' + mod + '.js', buffer);
  }
}
console.log('Exported ' + nbExport + ' functions');
