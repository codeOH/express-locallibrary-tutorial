var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Welcome to the user page!');
});

router.get('/cool/', function(req, res, next) {
  res.send('Hello');
});
module.exports = router;
