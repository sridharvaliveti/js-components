;(function ($) {
    /**
     * Quiz
     * @classDescription: creates a quiz
     * @param {array} Questions    array of questions & answers
     */
    Quiz = function (config) {
        config = (config = config || {});
        this.Questions = config.questions;
        this.Type = config.type;
        this.Element = $(config.element);
        this.UserWeights = [];
        this.BackBtn = $(config.backBtn);
        this.NextBtn = $(config.nextBtn);
        this.CurrentQuestion = null;
        this.ProgressBar = $(config.progressBar);
        _scope = this;

        //enumeration types for grading
        Quiz.TYPE = {
            WEIGHT: 0,
            EXACT: 1
        };

        //assign gui

        if(this.BackBtn)
        {
            this.Element.find(this.BackBtn).on("click", function(e)
            {
                e.preventDefault();

                if(_scope.CurrentQuestion > 0)
                {
                    _scope.CurrentQuestion--;
                    _scope.ToggleQuestion(_scope.CurrentQuestion);
                }
                else
                {
                    _scope.CurrentQuestion = 0;
                    _scope.ToggleQuestion(_scope.CurrentQuestion);
                }
            });
        }

        if(this.NextBtn)
        {
            this.Element.find(this.NextBtn).on("click", function(e)
            {
                e.preventDefault();

                if(_scope.CurrentQuestion < _scope.Element.find('.quiz_question').length -1)
                {
                    _scope.CurrentQuestion++;
                    _scope.ToggleQuestion(_scope.CurrentQuestion);
                }
                else
                {
                   _scope.Grade();
                }
            });
        }
    };

    Quiz.prototype = {
        /**
         * Grade
         * @classDescription: grades quiz based on type.
         */

        Grade : function()
        {
            var results = this.Element.find('#results');
            switch(this.Type)
            {
                case Quiz.TYPE.WEIGHT:
                    //grade using weights:
                    var totalWeight = 0;
                    for(var currentAnswer = 0; currentAnswer < this.UserWeights.length; currentAnswer++)
                    {
                        totalWeight += this.UserWeights[currentAnswer];
                    }

                    results.show().html('total weight: ' + totalWeight);

                    break;

                case Quiz.TYPE.EXACT:
                    //build answer key:
                    var answerKey = [];
                    //user answers:
                    var userKey = [];
                    this.Questions.find('ul').each(function(){
                        var correctAnswers = [];
                        var userAnswers = [];

                        $(this).find('li').each(function(){
                            if($(this).data('answer'))
                            {
                                correctAnswers.push($(this).text());
                            }
                        });

                        $(this).find('.userChoice').each(function(){
                            userAnswers.push($(this).text());
                        });

                        answerKey.push({ answers : correctAnswers });
                        userKey.push({ answers : userAnswers})

                    });
                    //grade:
                    var totalCorrect = 0;
                    var passed = false;
                    for(var correctAnswer = 0; correctAnswer < answerKey.length; correctAnswer++)
                    {
                        for(var userAnswer = 0; userAnswer < answerKey[correctAnswer].answers.length; userAnswer++)
                        {
                            (answerKey[correctAnswer].answers[userAnswer] == userKey[correctAnswer].answers[userAnswer]) ? passed = true : passed = false;
                        }

                        if(passed)
                        {
                            passed = false;
                            totalCorrect++;
                        }
                    }

                    var total = totalCorrect / this.Questions.length;
                    var percent = Math.ceil(total * 100);
                    results.html('').show().append(totalCorrect + " / " + this.Questions.length + '<br><br> percent: ' + percent + '%' );

                    break;

                default:
                    //default behavior
            }
        },

        ToggleQuestion : function(id)
        {
            this.Questions = this.Element.find($('.quiz_question'));
            //hide all
            this.Questions.hide();
            //display specific:
            this.Questions.eq(id).show();
            this.CurrentQuestion = id;
            var questionCounter = this.Element.find('.current_question');
            questionCounter.text(id + 1 +  " / " + this.Questions.length);

            //choices:
            var answers = this.Questions.eq(id).find("li");
            answers.css('cursor', 'pointer');
            //events
            //reset any click events:
            answers.off('click');
            answers.on({
                'click' : function(e){
                    e.preventDefault();
                    _scope.UserWeights.push($(this).data("weight"));
                    //allow multiple choice:
                    ($(this).hasClass("userChoice")) ? $(this).removeClass("userChoice") : $(this).addClass("userChoice");
                }
            });
        }
    };
})(jQuery);