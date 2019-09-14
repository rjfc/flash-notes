var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    flash            = require("connect-flash"),
    http             = require("http").Server(app);
    URL              = require('url').URL;

var request = require('request');
// Port for server to listen on
var port = 80;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(flash());
app.use(express.static(__dirname + "/public"));
const path = '/text/analytics/v2.1/keyPhrases';
const endpoint = "https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/keyPhrases";
const subscription_key = "780496de98da408b877506a9fd74bf29";


function getKeyPhrases (documents) {
    request({
        url: endpoint,
        method: "POST",
        json: true,   // <--Very important!!!
        headers: {
            'Ocp-Apim-Subscription-Key': subscription_key
        },
        body: documents
    }, function (error, response, body){
        console.log(JSON.stringify(body));
    });
}

// GET ROUTE: landing page
app.get("/", function(req, res) {
    var documents = {
        "documents": [
            {
                "language": "en",
                "id": "1",
                "text": "Free fall is the motion of an object under the influence of only gravity. The acceleration of an object in free fall is directed downward, regardless of the initial motion. The magnitude of free fall acceleration is g = 9.80 m/s^2. Aristotle thought that heavy objects fall faster than light ones but Galileo showed that all bodies fall at the same rate. An object is at its highest point when its vertical velocity, not the acceleration is zero at the highest point. The average velocity between two points is the displacement divided by the time interval between the two points and it has the same direction as the displacement. "
            },
            {
                "language": "fr",
                "id": "2",
                "text": "Bonjour tout le monde"
            }
        ]
    };

    getKeyPhrases(documents);
    res.render("landing");
});


http.listen(port, function() {
    console.log("Server listening on port " + port);
});