var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    flash            = require("connect-flash"),
    http             = require("http").Server(app);
// Routes
var indexRoutes       = require("./routes/index");
	
// Port for server to listen on
var port = 80;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(flash());
app.use(express.static(__dirname + "/public"));

app.use("/", indexRoutes);


http.listen(port, function() {
    console.log("Server listening on port " + port);
});