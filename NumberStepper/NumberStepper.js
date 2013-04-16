;(function ($) {
    /**
     * NumberStep
     * @classDescription: creates a number stepper with events
     * @param {htmlElement} up    The htmlElement that represents the up btn
     * @param {htmlElement} down    The htmlElement that represents the down btn
     * @param {htmlElement} field    The input field used to display the number
     * @param {Event} events    event object
     * @param {Event} trigger  The event that triggers change
     * @param {Number} max  The maximum number the stepper can reach
     * @param {Number} min  The minimum number the stepper can reach
     * @param {Number} step  the amount of increase in number
     */
    NumberStep = function (config) {
        var _scope = this;
        config = (config = config || {});
        this.Up = $(config.up);
        this.Down = $(config.down);
        this.Field = $(config.field);
        this.Max = config.max;
        this.Min = config.min;
        this.Step = config.step;
        //enumerations for up/down validation
        this.VALID_UP_VALUE = 1;
        this.VALID_DOWN_VALUE = 0;

        //change event on input:
        this.Field.change(function() {
            _scope.Validate(_scope.VALID_DOWN_VALUE);
            _scope.Validate(_scope.VALID_UP_VALUE);
        });

        //Number Step UP & DOWN events:
        this.Up.on('click', function(e){
            e.preventDefault();
            _scope.Validate(_scope.VALID_UP_VALUE, e);
        });

        this.Down.on('click', function(e){
            e.preventDefault();
            _scope.Validate(_scope.VALID_DOWN_VALUE, e);
        });

        this.Field.attr({
            step: this.Step,
            min: this.Min,
            max: this.Max
        });
    };

    NumberStep.prototype = {
        /**
         * Validate
         * @classDescription: performs validation based on min/max and increases by step.
         * @param {enum} type   enumeration based on the type of validation to perform (up/down)
         */
        Validate: function(type, event)
        {
            switch(type){
                case this.VALID_UP_VALUE:
                    if(this.Field.val() < this.Max)
                    {
                        if(event)
                            this.Field.val(Number(this.Field.val()) + this.Step);
                        if(this.Field.val() > this.Max)
                        {
                            this.Field.val(this.Max);
                        }
                    }
                    else
                    {
                        this.Field.val(this.Max);
                    }
                break;

                case this.VALID_DOWN_VALUE:
                    if(this.Field.val() > this.Min)
                    {
                        if(event)
                            this.Field.val( this.Field.val() - this.Step);
                        if(this.Field.val() < this.Min)
                        {
                            this.Field.val(this.Min)
                        }
                    }
                    else
                    {
                        this.Field.val(this.Min);
                    }
                break;
            }
        },

        /**
         * GetValue
         * @return {Number}   Returns a number value containing the value of the stepper input */
        GetValue: function()
        {
            return this.Field.val();
        },

        /**
         * SetValue
         * Sets the number value of the stepper input */
        SetValue: function(val)
        {
            this.Field.val(val);
            this.Field.attr('value', val);
        },

        /**
         * GetMax
         * @return {Number}   Returns a number value containing the value of the stepper input */
        GetMax: function()
        {
            return this.Max;
        },

        /**
         * SetMax
         * Sets the number value of the stepper input */
        SetMax: function(val)
        {
            this.Max = val;
            this.Field.attr('max', val);
        },

        /**
         * GetMin
         * @return {Number}   Returns a number value containing the value of the stepper input */
        GetMin: function()
        {
            return this.Min;
        },

        /**
         * SetMin
         * Sets the number value of the stepper input */
        SetMin: function(val)
        {
            this.Min = val;
            this.Field.attr('min', val);
        },

        /**
         * GetStep
         * @return {Number}   Returns a number value containing the value of the stepper input */
        GetStep: function()
        {
            return this.Step;
        },

        /**
         * SetStep
         * Sets the number value of the stepper input */
        SetStep: function(val)
        {
            this.Step = val;
            this.Field.attr('step', val);
        }
    };
})(jQuery);