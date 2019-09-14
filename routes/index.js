var express = require("express");
var router = express.Router();
var URL = require('URL');


// GET ROUTE: landing page
router.get("/", function(req, res) {


    res.render("landing");
});

module.exports = router;