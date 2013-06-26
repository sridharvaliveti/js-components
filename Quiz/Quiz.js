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
                console.log(_scope.Element.find('.quiz_question').length)
                if(_scope.CurrentQuestion < _scope.Element.find('.quiz_question').length -1)
                {
                    _scope.CurrentQuestion++;
                    _scope.ToggleQuestion(_scope.CurrentQuestion);
                }
                else
                {
                    _scope.CurrentQuestion = _scope.Element.find('.quiz_question').length -1;
                    _scope.ToggleQuestion(_scope.CurrentQuestion);
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

                    var answerKey = [];
                    var correct = 0;
                    //user answers:
                    var userAnswers = _scope.Questions.find($('.userChoice'));
                    //quiz answers:
                    this.Questions.find('li').each(function(){
                        if($(this).data('answer'))
                        {
                            answerKey.push($(this))
                        }
                    });

                    //grade:
                    for(var currentAnswer = 0; currentAnswer < answerKey.length; currentAnswer++)
                    {
                        if($(userAnswers).eq(currentAnswer).html() == answerKey[currentAnswer].html())
                            correct++;
                    }

                    var total = correct / answerKey.length;
                    var percent = Math.ceil(total * 100);
                    results.html('').show().append(correct + " / " + answerKey.length + '<br><br> percent: ' + percent + '%' );
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
            answers.on({
                'mouseenter' : function(e){
                    $(this).find(".answer_icon").css("backgroundPosition", "-79px 0px");
                },
                'mouseleave' : function(e){
                    $(this).find(".answer_icon").css("backgroundPosition", "1px 0px");
                },
                'click' : function(e){
                    _scope.UserWeights.push($(this).data("weight"));
                    _scope.Questions.eq(id).hide();

                    //reset previous answer:
                    $(this).parent().find('.userChoice').removeClass('userChoice');
                    //add new selection
                    $(this).addClass("userChoice");
                    //end quiz or keep going:
                    (id + 1 == _scope.Questions.length) ? _scope.Grade() : _scope.ToggleQuestion(id + 1)
                }
            });
        }
    };
})(jQuery);