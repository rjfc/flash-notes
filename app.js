const express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    flash            = require("connect-flash"),
    http             = require("http").Server(app),
    URL              = require('url').URL,
    language         = require("@google-cloud/language");

const request = require('request');

// Port for server to listen on
const port = 80;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(flash());
app.use(express.static(__dirname + "/public"));

const endpoint = "https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/keyPhrases";
const subscription_key = "780496de98da408b877506a9fd74bf29";

// Creates a client
const client = new language.LanguageServiceClient();
let keyTerms = [];
let termIndexes = [];
let googleCloudArray = [];
let questions = [];
let answers = [];
//let string = "Free fall is the motion of an object under the influence of only gravity. The acceleration of an object in free fall is directed downward, regardless of the initial motion. The magnitude of free fall acceleration is g = 9.80 m/s^2. Aristotle thought that heavy objects fall faster than light ones but Galileo showed that all bodies fall at the same rate. An object is at its highest point when its vertical velocity, not the acceleration is zero at the highest point. The average velocity between two points is the displacement divided by the time interval between the two points and it has the same direction as the displacement.";
let string = "Free fall is the motion of an object under the influence of only gravity. The acceleration of an object in free fall is directed downward, regardless of the initial motion. The magnitude of free fall acceleration is g = 9.80 m/s^2. Aristotle thought that heavy objects fall faster than lighter ones, but Galileo showed that all bodies fall at the same rate. An object is at its highest point when its vertical velocity, not the acceleration, is zero at the highest point. The average velocity between two points is the displacement divided by the time interval between the two points and it has the same direction as the displacement.";

function getKeyPhrases (documents) {
    request({
        url: endpoint,
        method: "POST",
        json: true,   // <--Very important!!!x
        headers: {
            'Ocp-Apim-Subscription-Key': subscription_key
        },
        body: documents
    }, function (error, response, body){
        keyTerms = body.documents[0].keyPhrases;
        loadTermIndexArray(string);
        //console.log(keyTerms);
    });
}

async function analyzeSyntaxOfText(text) {
    // Imports the Google Cloud client library
    try {
        // Prepares a document, representing the provided text
        const document = {
                content: text,
                type: 'PLAIN_TEXT',
            };

        // Detects syntax in the document
        const [syntax] = await client.analyzeSyntax({document});

        googleCloudArray = syntax.tokens;

        // console.log(termIndexes);
        let documents = {
            "documents": [
                {
                    "language": "en",
                    "id": "1",
                    "text": string
                }
            ]
        };
        getKeyPhrases(documents);
    } catch(e) {
        console.log(e);
    }
}

function loadTermIndexArray(inputString) {
    for (let i = 0; i < keyTerms.length; i++) {
        let index = inputString.indexOf(keyTerms[i]);
        termIndexes.push(index);

    }
    sortTermArray();
}

function sortTermArray() {
    let tempString;
    let numKeyTerms = keyTerms.length;
    let max = 0;
    let temp = 0;

    while(numKeyTerms>0) {
        max = termIndexes[0];
        index = 0;

        for(i=0; i<numKeyTerms; i++) {
            if(termIndexes[i] > max) {
                index = i;
                max = termIndexes[i]
            }
        }
        i--;
        temp = termIndexes[i];
        tempString = keyTerms[i];

        termIndexes[i] = max;
        keyTerms[i] = keyTerms[index];

        termIndexes[index] = temp;
        keyTerms[index] = tempString;

        numKeyTerms--;
    }
    keyTerms.shift();
    termIndexes.shift();


    console.log(keyTerms);
    // console.log(termIndexes);
    let googleCloudWordArray = []
    for (let i = 0; i < googleCloudArray.length; i++) {
        googleCloudWordArray.push(googleCloudArray[i].text.content);
    }

    let counter = 0;
    for (let i = 0; i < googleCloudArray.length; i++) {
        /*  console.log("google cloud text: " + googleCloudArray[i].text.content);
          console.log("key terms: " +  keyTerms[i]); */

        // console.log(googleCloudArray[i].text.content)
        // console.log(keyTerms[counter])
        if (counter == keyTerms.length) {
            break;
        }

         if (googleCloudArray[i].text.content == keyTerms[counter]) {
             counter++;
             let indCounter = 1;
             while ((i + indCounter) < googleCloudArray.length && googleCloudArray[i + indCounter].partOfSpeech.mood != "INDICATIVE") {

                // console.log(googleCloudArray[i + indCounter].partOfSpeech.mood);
                // console.log("length: " + googleCloudArray.length + " | index:" + (i + indCounter));
                indCounter++
             }
             let sliced = googleCloudArray.slice(i, i+indCounter+1);
             let tags = []
             for (let k = 0; k < sliced.length; k++) {
                 tags.push(sliced[k].partOfSpeech.tag)
             }

             if (!tags.includes("CONJ") && !tags.includes("PRON")) {
                 questions.push(googleCloudWordArray.slice(i,i +indCounter + 1).join(" "));
                 // console.log(googleCloudWordArray.slice(i, i+indCounter + 1).join(" ") + "\n")

                 let periCounter = 0;
                 while ((i + indCounter + 1 + periCounter) < googleCloudArray.length && googleCloudWordArray[indCounter + i + 1 + periCounter] != ".") {
                     periCounter++
                 }



                 answers.push(googleCloudWordArray.slice(i+indCounter+1, i+indCounter + 1 + periCounter).join(" "))
             }


             // console.log("match found");
             // console.log(googleCloudArray[i]);

        }
        else if ((keyTerms[counter].indexOf(' ')) >= 0){

            let spaceCount = keyTerms[counter].split(" ").length-1;
            if ((i + spaceCount) <= googleCloudArray.length) {
                let compoundString = "";
                for (j = 0; j <= spaceCount; j++) {
                    compoundString += googleCloudArray[i+j].text.content + ' ';

                }
                compoundString = compoundString.slice(0, -1);
                if (compoundString == keyTerms[counter]) {
                    counter++;
                    let indCounter = 1;
                    while ((i + indCounter) < googleCloudArray.length && googleCloudArray[i + indCounter].partOfSpeech.mood != "INDICATIVE") {

                        // console.log(googleCloudArray[i + indCounter].partOfSpeech.mood);
                        // console.log("length: " + googleCloudArray.length + " | index:" + (i + indCounter));
                        indCounter++
                    }
                    let sliced = googleCloudArray.slice(i, i+indCounter+1);
                    let tags = []
                    for (let k = 0; k < sliced.length; k++) {
                        tags.push(sliced[k].partOfSpeech.tag)
                    }

                    if (!tags.includes("CONJ") && !tags.includes("PRON")) {
                        questions.push(googleCloudWordArray.slice(i, i + indCounter + 1).join(" "));


                   // console.log(googleCloudWordArray.slice(i, i+indCounter + 1).join(" ") + "\n")

                    let periCounter = 0;
                    while ((i + indCounter + 1 + periCounter) < googleCloudArray.length && googleCloudWordArray[indCounter + i + 1 + periCounter] != ".") {
                        periCounter++
                    }

                    answers.push(googleCloudWordArray.slice(i+indCounter+1, i+indCounter + 1 + periCounter).join(" "));
                    }
                    // console.log("match found");
                    // console.log(googleCloudArray[i]);
                }
            }
         }
    }

    for (let i=questions.length - 1;i>= 0;i--) {
        if (questions[i].includes('.')) {
            questions.splice(i,1)
            answers.splice(i,1)
        }
    }

    for (let i = 0; i < questions.length; i++) {
        for (let j = i + 1; j < questions.length; j++) {
            if (answers[i].includes(answers[j]) || answers[j].includes(answers[i])) {
                let question1 = questions[i].split(" ");
                let question2 = questions[j].split(" ");
                if (question1.length > question2.length) {
                    questions[j] = "";
                }
                else {
                    questions[i] = "";
                }
               /* for (let k = 0; k < answer1.length; k++) {
                    let apiCall = googleApiCall(answer1[k]);
                    apiCall.then(function (result){
                        let wordTag = result[0].partOfSpeech.tag;
                        if (wordTag == "NOUN" || wordTag == "NUM") {
                            infoCount1++;
                        }
                    })
                }

                for (let k = 0; k < answer2.length; k++) {
                    let apiCall = googleApiCall(answer2[k]);
                    apiCall.then(function (result) {
                        let wordTag = result[0].partOfSpeech.tag;
                        if (wordTag == "NOUN" || wordTag == "NUM") {
                            infoCount2++;
                        }
                        if (k == answer2.length - 1) {
                            // Done counting
                            if (infoCount1 >= infoCount2) {
                                answers[j] = "";
                            }
                            else {
                                //infoCount2 < infoCount1
                                answers[i] = "";
                            }

                        }

                    })
                }
                //await clearEmptyAnswers();*/
            }
        }
    }
    clearEmptyAnswers();
    console.log(questions);
    console.log(answers);
    console.log("");
}

function clearEmptyAnswers() {
    for (let i=answers.length - 1;i>= 0;i--) {
        if (questions[i].length == 0) {
            questions.splice(i, 1)
            answers.splice(i, 1)
        }
    }
}

async function googleApiCall(inputtedString) {
    try {
    const document = {
        content: inputtedString,
        type: 'PLAIN_TEXT',
    };

    // Detects syntax in the document
    const [syntax] = await client.analyzeSyntax({document});
   // console.log(syntax.tokens);
    return syntax.tokens;
    } catch(e) {
        console.log(e);
    }
}

// GET ROUTE: landing page
app.get("/", function(req, res) {
    analyzeSyntaxOfText(string);

    res.render("landing");
});


http.listen(port, function() {
    console.log("Server listening on port " + port);
});