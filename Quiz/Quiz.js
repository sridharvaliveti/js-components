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
        this.Results = $(config.results);
        this.Pager = $(config.pager);
        _scope = this;

        //enumeration types for grading
        Quiz.TYPE = {
            WEIGHT: 0,
            EXACT: 1
        };

        this.Init();
    };

    Quiz.prototype = {

        Init : function()
        {
            //timer

            var count = 30;
            var counter = setInterval(timer, 1000);

            function timer()
            {
                count += - 1;
                if(count <= 0)
                {
                    console.log("done!");
                    clearInterval(counter);
                    return;
                }
                console.log(count)
            }


            //copy result html to data:
            this.Results.data('results', this.Results.html());
            //assign gui
            if(this.BackBtn)
            {
                this.Element.find(this.BackBtn).on("click", function(e)
                {
                    e.preventDefault();

                    //shows next button if not on results:
                    _scope.ToggleUI();

                    //question back navigation:
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
        },
        /**
         * Grade
         * @classDescription: grades quiz based on type.
         */

        Grade : function()
        {
            switch(this.Type)
            {
                case Quiz.TYPE.WEIGHT:
                    //grade using weights:
                    var totalWeight = 0;
                    for(var currentAnswer = 0; currentAnswer < this.UserWeights.length; currentAnswer++)
                    {
                        totalWeight += this.UserWeights[currentAnswer];
                    }

                    this.Results.show().html('total weight: ' + totalWeight);
                    ResetPager();

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
                                correctAnswers.push($(this).html());
                            }
                        });

                        $(this).find('.userChoice').each(function(){
                            userAnswers.push($(this).html());
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
                            if(answerKey[correctAnswer].answers.length == userKey[correctAnswer].answers.length)
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
                    this.Questions.hide();

                    this.Results.html('').append(this.Results.data('results'));

                    this.Results.find(".totalCorrect").append(totalCorrect + ' / ' + this.Questions.length)
                    this.Results.find('.totalPercent').append(percent + '%');
                    this.Results.show();

                    this.CurrentQuestion++;
                    //hide next btn on grade:
                    this.NextBtn.hide();
                    ResetPager();

                    break;

                default:
                    //default behavior
            }

            function ResetPager()
            {
                _scope.Pager.find('li').each(function(){
                    if($(this).hasClass("primary"))
                    {
                        $(this).removeClass("primary").addClass("secondary");
                    }
                })
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
            questionCounter.html("<h2>" + Number(id + 1) +  " / " + this.Questions.length + "</h2>");

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

            //Update quiz progress:
            if(this.ProgressBar)
            {
                var width = $('#quiz_container').width();
                var progress = width / this.Questions.length;
                this.ProgressBar.width(progress * (this.CurrentQuestion + 1));
            }

            //Pagination:
            if(this.Pager)
            {
                var pager = '';
                var activeClass = '';
                for(var currentQuestion = 0; currentQuestion < this.Questions.length; currentQuestion++)
                {
                    (currentQuestion == this.CurrentQuestion) ? activeClass = "primary" : activeClass = "secondary"
                    pager += '<li class="' + activeClass + ' badge" data-page="' + currentQuestion + '">' + Number(currentQuestion + 1) + '</li>';
                }

                this.Pager.html('');
                this.Pager.append(pager);
                this.Pager.find('li').on("click", function(){
                    _scope.ToggleQuestion($(this).data('page'));
                    _scope.ToggleUI();

                });
            }
        },

        ToggleUI : function(){
            if(_scope.Results.is(":visible"))
            {
                _scope.Results.hide();
            }

            if(_scope.NextBtn.not(":visible"))
            {
                _scope.NextBtn.show();
            }
        }
    };
})(jQuery);