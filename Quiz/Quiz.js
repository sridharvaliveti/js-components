;(function ($) {
    /**
     * Quiz
     * @classDescription: creates a number stepper with events
     * @param {array} Questions    array of questions & answers
     */
    Quiz = function (config) {
        config = (config = config || {});
        this.Questions = config.questions;
        this.Type = config.type;
        this.Element = $(config.element);
        this.UserWeights = [];
        _scope = this;

        //enumeration types for grading
        Quiz.TYPE = {
            WEIGHT: 0,
            EXACT: 1
        };
    };

    Quiz.prototype = {
        /**
         * Validate
         * @classDescription: performs validation based on min/max and increases by step.
         * @param {enum} type   enumeration based on the type of validation to perform (up/down)
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

                    var results = this.Element.find('#results');
                    results.show().html('total weight: ' + totalWeight);

                    break;

                case Quiz.TYPE.EXACT:
                    var results = this.Element.find('#results');
                    results.show().append('EXACTNESS:');
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
            var questionCounter = this.Element.find('.current_question');
            questionCounter.text(id + 1 +  " / " + this.Questions.length);

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