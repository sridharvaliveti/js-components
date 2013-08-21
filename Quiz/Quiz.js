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
        this.Timer = config.timer;
        this.ShowCorrectAnswers = config.showCorrectAnswers;
        this.quizComplete = false;
        this.counter;
        this.AllowUserCorrection = config.allowUserCorrection
        this.Randomize = config.randomize;
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
            if(this.Timer.enabled)
            {
                var count = this.Timer.max_time;
                this.counter = setInterval(timer, 1000);

                function timer()
                {
                    count += - 1;

                    if(_scope.Timer.display)
                    {
                        _scope.Timer.element.html(formatTime(count));
                    }

                    if(count <= 0)
                    {
                        _scope.Grade();
                        clearInterval(_scope.counter);
                        return;
                    }
                }

                function formatTime(seconds)
                {
                    var minutes = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
                    var seconds = Math.floor(seconds - (minutes * 60)) < 10 ? "0" + Math.floor(seconds - (minutes * 60)) : Math.floor(seconds - (minutes * 60));
                    return minutes + ":" + seconds;
                }
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

            this.Questions = this.Element.find($('.quiz_question'));
            if(this.Randomize)
                shuffle(this.Questions);

            function shuffle(array) {
                var counter = array.length, temp, index;
                // While there are elements in the array
                while (counter--) {
                    // Pick a random index
                    index = (Math.random() * counter) | 0;
                    // And swap the last element with it
                    temp = array[counter];
                    array[counter] = array[index];
                    array[index] = temp;
                }
                return array;
            }
        },
        /**
         * Grade
         * @classDescription: grades quiz based on type.
         */

        Grade : function()
        {
            if(this.Timer || this.Timer.enabled)
            {
                 clearInterval(_scope.counter);
            }
            switch(this.Type)
            {
                case Quiz.TYPE.WEIGHT:
                    //grade using weights:
                    var totalWeight = 0;
                    for(var currentAnswer = 0; currentAnswer < this.UserWeights.length; currentAnswer++)
                    {
                        totalWeight += this.UserWeights[currentAnswer];
                    }

                    //weightMin weightMax
                    this.Results.show().find("#surveyResults").show();
                    this.Results.find("#surveyResults li").each(function(){

                        if( totalWeight >= Number($(this).data("weightmin")) && totalWeight <= Number($(this).data("weightmax")))
                            $(this).show();
                        else
                            $(this).hide();
                    });

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
            this.quizComplete = true;
        },

        ToggleQuestion : function(id)
        {


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
                    e.stopPropagation();
                    //allow multiple choice:
                    if($(this).hasClass("userChoice"))
                    {
                        if(_scope.Type == Quiz.TYPE.WEIGHT)
                            _scope.UserWeights.pop();

                        $(this).removeClass("userChoice")
                    }
                    else{
                        if(_scope.Type == Quiz.TYPE.WEIGHT)
                            _scope.UserWeights.push($(this).data("weight"));

                        $(this).addClass("userChoice");
                    }

                    if($(this).hasClass("correctAnswer"))
                    {
                        $(this).removeClass("correctAnswer")
                    }
                }
            });

            //Update quiz progress:
            if(this.ProgressBar)
            {
                var width = $('#quiz_container').width();
                var progress = width / this.Questions.length;

                this.ProgressBar.animate({
                    width : progress * (this.CurrentQuestion + 1)
                }, 200);
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

            //show user correct answers:
            if(this.quizComplete && this.ShowCorrectAnswers)
            {
                answers.each(function(){
                    if($(this).data('answer'))
                    {
                        $(this).addClass('correctAnswer');
                    }
                })
            }

            //disable user from correcting answers:
            if(this.quizComplete && !this.AllowUserCorrection)
            {
                answers.off('click');
            }
        },

        ToggleUI : function(){
            if(_scope.Results.is(":visible"))
                _scope.Results.hide();

            if(_scope.NextBtn.not(":visible"))
                _scope.NextBtn.show();
        },

        Remove : function(){
            //defensively clear interval
            if(this.counter)
                clearInterval(this.counter)
        }
    };
})(jQuery);