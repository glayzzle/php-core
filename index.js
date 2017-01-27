/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-core/graphs/contributors
 * @authors http://locutus.io/authors
 * @url http://glayzzle.com
 * @url http://locutus.io
 */
'use strict';
module.exports = function($php) {
  require('./src/datetime')($php);
  require('./src/exec')($php);
  require('./src/filesystem')($php);
  require('./src/json')($php);
  require('./src/math')($php);
  require('./src/misc')($php);
  require('./src/network')($php);
  require('./src/pcre')($php);
  require('./src/strings')($php);
  require('./src/url')($php);
  require('./src/strings')($php);
  require('./src/var')($php);
  require('./src/xml')($php);
};
