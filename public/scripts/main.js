$(".note-submit-button").click(function() {
   var submittedString = $("#input-text").val();
   socket.emit("getTermData", submittedString);
});

var questions;
var answers;

var clickCounter = 0;

socket.on("termData", function(termData) {
    console.log(termData);
    questions = termData.questions;
    answers = termData.answers;
    console.log(questions[clickCounter]);
    $(".flashcard > h1").text(questions[clickCounter]);
});

$( ".flashcard" ).hover(
    function() {
        $(".flashcard > h1").text(answers[clickCounter]);
    }, function() {
        $(".flashcard > h1").text(questions[clickCounter]);
    }
);

$(".flashcard").click(function() {
    clickCounter++;
    if (clickCounter == questions.length) {
        clickCounter = 0;
    }
    $(".flashcard > h1").text(questions[clickCounter]);
});