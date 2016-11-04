'use strict';

var _db = require('./db');

(0, _db.syncDb)(function (r) {
  console.log(r);
});