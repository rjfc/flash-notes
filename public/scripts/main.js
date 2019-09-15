$(".note-submit-button").click(function() {
   var submittedString = $("#input-text").val();
   socket.emit("getTermData", submittedString);
});

var questions;
var answers;

var clickCounter = 0;

socket.on("termData", function(termData) {
    $(".flashcard-container").show();
    var n = $(document).height();
    $('html, body').animate({ scrollTop: n }, 500);
    console.log(termData);
    questions = termData.questions;
    answers = termData.answers;
    console.log(questions[clickCounter]);
    $(".flashcard > h1").text(questions[clickCounter].charAt(0).toUpperCase() + questions[clickCounter].slice(1) + "...");
    $(".flashcard-container > span").text("Displaying term " + (clickCounter + 1) + " of " + answers.length);
});

$( ".flashcard" ).hover(
    function() {
        $(".flashcard > h1").text(answers[clickCounter]);
        $(".flashcard-container > span").text("Displaying definition " + (clickCounter + 1) + " of " + answers.length);
        $('.flashcard').css( 'cursor', 'pointer' );
    }, function() {
        $(".flashcard > h1").text(questions[clickCounter].charAt(0).toUpperCase() + questions[clickCounter].slice(1) + "...");
        $(".flashcard-container > span").text("Displaying term " + (clickCounter + 1) + " of " + answers.length);
    }
);

$(".flashcard").click(function() {
    clickCounter++;
    if (clickCounter == questions.length) {
        clickCounter = 0;
    }
    $(".flashcard > h1").text(questions[clickCounter].charAt(0).toUpperCase() + questions[clickCounter].slice(1) + "...");
    $(".flashcard-container > span").text("Displaying term " + (clickCounter + 1) + " of " + answers.length);
});