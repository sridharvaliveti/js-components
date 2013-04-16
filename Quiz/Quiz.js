//TODO: Convert to javascript class
var quiz = $("#quiz_container");
var questions = $(".quiz_question");
var userWeights = [];
var currentQuestion = 0;
var questionCounter = $(".current_question");
var results = $("#results");
var sharing = $("#fb-root");
var share_btn = $('.like_btn');

$(document).ready(function($) {

    showQuestion = function(qid)
    {
        quiz.fadeIn();
        questions.eq(qid).fadeIn();
        questionCounter.text(currentQuestion + 1 +  " / " + questions.length);

        var answers = questions.eq(qid).find("li");
        answers.css('cursor', 'pointer');
        //events
        answers.on({
            "mouseenter" : function(e){
                $(this).find(".answer_icon").css("backgroundPosition", "-79px 0px");
            },
            "mouseleave" : function(e){
                $(this).find(".answer_icon").css("backgroundPosition", "1px 0px");
            },
            "click" : function(e){
                userWeights.push($(this).data("weight"));
                hideQuestion(currentQuestion);
                currentQuestion++;
                //end quiz or keep going:
                (currentQuestion == questions.length) ? grade() : showQuestion(currentQuestion);
            }
        });
    }

    hideQuestion = function(qid)
    {
        questions.eq(qid).hide();
    }

    grade = function()
    {
        var totalWeight = 0;

        for(var currentAnswer = 0; currentAnswer < userWeights.length; currentAnswer++)
        {
            totalWeight += userWeights[currentAnswer];
        }

        //Get the verses:
        $.ajax({
            url: '/quiz/ajax/' + quiz.data("category") + '/' + totalWeight,
            success: function(data)
            {
                for(v = 0; v < data.length; v++)
                {
                    var bible_verses = $('<p class="bible_verses"></p>').html(data[v].verse)
                    var bible_book = $('<p class="bible_book"></p>').html(data[v].book);

                    sharing.after(bible_verses);
                    bible_verses.after(bible_book);
                    bible_book.fadeIn();
                }
                //fade in results:
                results.fadeIn();
            }
        });
    }
    //Let There Be Quiz!
    showQuestion(0);
});
