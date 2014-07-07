;
(function ($) {
    /**
     * Quiz
     * @classDescription: creates a quiz
     * @param {array} Questions    array of questions & answers
     */
    Quiz = function (config) {
        config = (config = config || {});
        //list of questions
        this.Questions = config.questions;
        //quiz type
        this.Type = config.type;
        //element that quiz lives inside
        this.Element = $(config.element);
        //user weights for weighing quiz
        this.UserWeights = [];
        //navigation
        this.BackBtn = $(config.backBtn);
        this.NextBtn = $(config.nextBtn);
        //current question the user is viewing
        this.CurrentQuestion = null;
        //progress bar element
        this.ProgressBar = $(config.progressBar);
        //results element
        this.Results = $(config.results);
        //pagination element
        this.Pager = $(config.pager);
        //timer / counter interval for quiz
        this.Timer = config.timer;
        this.counter;
        //optional show correct answers to user
        this.ShowCorrectAnswers = config.showCorrectAnswers;
        //optional allow users to go back and correct the quiz
        this.AllowUserCorrection = config.allowUserCorrection;
        //optional randomizer
        this.Randomize = config.randomize;
        //is quiz complete: only changed the first time the user is graded
        this.quizComplete = false;
        this.User = {
            quizType: {
                EXACT: {
                    totalQuestions: 0,
                    totalCorrect: 0,
                    percent: 0
                },
                WEIGHT: {
                    weighType: ""
                },
                duration: 0
            }
        }
        //callback that gets fired when question is initalized:
        this.QuestionInitCallback = config.questionInitCallback;
        //the current quiz plugin scope
        _scope = this;

        //enumeration types for grading
        Quiz.TYPE = {
            WEIGHT: 0,
            EXACT: 1
        };

        this.Init();
    };

    Quiz.prototype = {

        Init: function () {
            //timer
            if (this.Timer.enabled) {
                var count = this.Timer.max_time;
                this.counter = setInterval(timer, 1000);

                function timer() {
                    count += -1;
                    //display timer is option is available:
                    if (_scope.Timer.display) {
                        _scope.Timer.duration = count;
                        _scope.Timer.element.html(formatTime(_scope.Timer.duration));
                    }
                    //on timer ended: grade and clean up
                    if (count <= 0) {
                        _scope.Grade();
                        clearInterval(_scope.counter);
                        return;
                    }
                }

                //formats seconds into timecode: hh:mm:ss
                function formatTime(seconds) {
                    var minutes = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
                    var seconds = Math.floor(seconds - (minutes * 60)) < 10 ? "0" + Math.floor(seconds - (minutes * 60)) : Math.floor(seconds - (minutes * 60));
                    return minutes + ":" + seconds;
                }
            }

            //copy result html to data:
            this.Results.data('results', this.Results.html());

            //assign gui
            if (this.BackBtn) {
                this.Element.find(this.BackBtn).show();
                this.Element.find(this.BackBtn).on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _scope.Back(_scope.CurrentQuestion)
                });
            }

            if (this.NextBtn) {
                this.NextBtn.on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    _scope.Next(_scope.CurrentQuestion + 1)
                });
            }

            //get questions:
            this.Questions = this.Element.find($('.quiz_question'));
            //randomize if nessesary
            if (this.Randomize)
                shuffle(this.Questions);

            //private shuffle method:
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

        Grade: function () {
            //clean up timer if available:
            if (this.Timer || this.Timer.enabled) {
                this.User.quizType.duration = this.Timer.duration;
                clearInterval(_scope.counter);
            }
            switch (this.Type) {
                //Weight Quiz:
                case Quiz.TYPE.WEIGHT:
                    this.Results.find("#surveyResults").show();
                    //grade using weights:
                    var totalWeight = 0;
                    for (var currentAnswer = 0; currentAnswer < this.UserWeights.length; currentAnswer++) {
                        totalWeight += this.UserWeights[currentAnswer];
                    }

                    //weightMin weightMax
                    this.Results.show();
                    this.Results.find("#surveyResults li").each(function () {

                        if (totalWeight >= Number($(this).data("weightmin")) && totalWeight <= Number($(this).data("weightmax")))
                            $(this).show();
                        else
                            $(this).hide();
                    });

                    //update settings:
                    this.User.quizType.WEIGHT.weighType = $(this).text();

                    break;

                //Exact Answers:
                case Quiz.TYPE.EXACT:
                    //build answer key:
                    var answerKey = [];
                    //user answers:
                    var userKey = [];
                    this.Questions.each(function () {
                        var correctAnswers = [];
                        var userAnswers = [];

                        $(this).find('button').each(function () {
                            if ($(this).data('answer')) {
                                correctAnswers.push($(this).html());
                            }
                        });

                        $(this).find('.active').each(function () {
                            userAnswers.push($(this).html());
                        });

                        answerKey.push({ answers: correctAnswers });
                        userKey.push({ answers: userAnswers})
                    });

                    //grade using key:
                    var totalCorrect = 0;
                    var passed = false;
                    for (var correctAnswer = 0; correctAnswer < answerKey.length; correctAnswer++) {
                        for (var userAnswer = 0; userAnswer < answerKey[correctAnswer].answers.length; userAnswer++) {
                            if (answerKey[correctAnswer].answers.length == userKey[correctAnswer].answers.length)
                                (answerKey[correctAnswer].answers[userAnswer] == userKey[correctAnswer].answers[userAnswer]) ? passed = true : passed = false;
                        }

                        if (passed) {
                            passed = false;
                            totalCorrect++;
                        }
                    }

                    var total = totalCorrect / this.Questions.length;
                    var percent = Math.ceil(total * 100);
                    this.Questions.hide();

                    //handle results to user:
                    this.Pager.append('<li class="pager-results-btn"><a href="#">results</a></li>');
                    this.Pager.find(".pager-results-btn").addClass("active");
                    this.Results.html('').append(this.Results.data('results'));
                    this.Results.find('.totalCorrect').append(totalCorrect + ' / ' + this.Questions.length)
                    this.Results.find('.totalPercent').append(percent + '%');
                    this.Results.find('.totalCorrect').show();
                    this.Results.find('.totalPercent').show();
                    this.Results.show();
                    //hide next btn on grade:
                    this.NextBtn.hide();

                    //update settings:
                    this.User.quizType.EXACT.totalQuestions = this.Questions.length;
                    this.User.quizType.EXACT.percent = percent;
                    this.User.quizType.EXACT.totalCorrect = totalCorrect;

                    break;

                default:
                //default behavior if needed
            }

            //resets the paginator:
            function ResetPager() {
                _scope.Pager.find('li').each(function () {
                    if ($(this).hasClass("primary")) {
                        $(this).removeClass("primary").addClass("secondary");
                    }
                })
            }

            this.quizComplete = true;
            $(this).trigger("quizComplete", [this.User])
        },

        ToggleQuestion: function (id) {
            //hide all
            this.Questions.hide();
            //display specific:
            this.Questions.eq(id).show();
            this.CurrentQuestion = id;

            var questionCounter = this.Element.find('.current_question');
            questionCounter.html(Number(id + 1) + " / " + this.Questions.length);

            //choices:
            var answers = this.Questions.eq(id).find("button");
            //events : reset any click events
            answers.off('click');
            answers.on({
                'click': function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    //allow multiple choice:
                    if ($(this).hasClass("active")) {
                        if (_scope.Type == Quiz.TYPE.WEIGHT)
                            _scope.UserWeights.pop();

                        $(this).removeClass("active")
                    }
                    else {
                        if (_scope.Type == Quiz.TYPE.WEIGHT)
                            _scope.UserWeights.push($(this).data("weight"));

                        $(this).addClass("active");
                    }

                    if ($(this).hasClass("correctAnswer")) {
                        $(this).removeClass("correctAnswer")
                    }
                }
            });

            //Update quiz progress:
            if (this.ProgressBar) {
                var progression = 100 / this.Questions.length;
                var progress = progression * (this.CurrentQuestion + 1);
                this.ProgressBar.children().attr("aria-valuenow", Math.round(progress));
                this.ProgressBar.find(".progress-bar").css('width', progress + "%");
            }

            //Pagination:
            if (this.Pager) {
                this.ToggleUI();
                //todo: make this readable using jquery element creation instead of this crap:
                var pager = '<li class="pager-back-btn" data-page="' + Number(this.CurrentQuestion - 1) + '"><a href="#">&laquo;</a></li>';
                var activeClass = '';
                for (var currentQuestion = 0; currentQuestion < this.Questions.length; currentQuestion++) {
                    (currentQuestion == this.CurrentQuestion) ? activeClass = "active" : activeClass = "secondary"
                    pager += '<li class="' + activeClass + '" data-page="' + currentQuestion + '"><a href="#">' + Number(currentQuestion + 1) + '</a></li>';
                }

                pager += '<li class="pager-next-btn" data-page="' + Number(this.CurrentQuestion + 1) + '"><a href="#">&raquo;</a></li>';

                if (this.quizComplete) {
                    pager += '<li class="pager-results-btn"><a href="#">results</a></li>';
                }

                this.Pager.html('');
                this.Pager.append(pager);
                this.Pager.find('li').on("click", function () {
                    switch ($(this).attr('class')) {
                        case "pager-back-btn":
                            _scope.Back($(this).data('page'));
                            break;
                        case "pager-next-btn":
                            _scope.Next($(this).data('page'));
                            break;
                        case "pager-results-btn":
                        case "pager-results-btn active":
                            if (!$(this).hasClass("active")) {
                                _scope.Results.show();
                                _scope.Questions.hide();
                                $(this).addClass("active")
                            }
                            break;
                        default:
                            _scope.ToggleQuestion($(this).data('page'));
                    }
                });
            }

            //show user correct answers:
            if (this.quizComplete && this.ShowCorrectAnswers) {
                answers.each(function () {
                    if ($(this).data('answer')) {
                        $(this).addClass('btn-success');
                    }
                });
            }

            //disable user from correcting answers:
            if (this.quizComplete && !this.AllowUserCorrection) {
                answers.off('click');
            }
        },

        Next: function (id) {
            if (id < _scope.Questions.length) {
                _scope.CurrentQuestion++;
                _scope.ToggleQuestion(_scope.CurrentQuestion);
            }
            else {
                if (!_scope.quizComplete)
                    _scope.Grade();
            }
        },

        Back: function () {
            _scope.ToggleUI();

            //question back navigation:
            if (_scope.CurrentQuestion > 0) {
                _scope.CurrentQuestion--;
                _scope.ToggleQuestion(_scope.CurrentQuestion);
            }
            else {
                _scope.CurrentQuestion = 0;
                _scope.ToggleQuestion(_scope.CurrentQuestion);
            }
        },
        //Toggle UI elements:
        ToggleUI: function () {
            if (_scope.Results.is(":visible"))
                _scope.Results.hide();

            if (_scope.NextBtn.not(":visible"))
                _scope.NextBtn.show();
        },

        //remove quiz:
        RemoveQuiz: function () {
            if (this.counter)
                clearInterval(this.counter)
        },

        GetUser: function () {
            return this.User;
        }
    };
})(jQuery);