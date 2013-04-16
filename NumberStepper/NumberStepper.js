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
        this.Events = config.events;
        this.Trigger = config.trigger;
        this.Max = config.max;
        this.Min = config.min;
        this.Step = config.step;
        //enumerations for up/down validation
        this.VALID_UP_VALUE = 1;
        this.VALID_DOWN_VALUE = 0;
        scope = this;

        //change event on input:
        this.Field.change(function(e) {
            _scope.Validate(_scope.VALID_DOWN_VALUE);
            _scope.Validate(_scope.VALID_UP_VALUE);
            _scope.AssignTriggers(e);
        });

        //Number Step UP & DOWN events:
        this.Up.on('click', function(e){
            _scope.Validate(_scope.VALID_UP_VALUE);
            _scope.AssignTriggers((e));

        });

        this.Down.on('click', function(e){
            _scope.Validate(_scope.VALID_DOWN_VALUE);
            _scope.AssignTriggers((e));
        });
    };

    NumberStep.prototype = {
        scope: this,
        /**
         * AssignTriggers
         * @classDescription: assigns the event triggers to the buttons
         * @param {event} e    the event passed in from the UI element
         */
        AssignTriggers: function(e){
            //attach an event if needed:
            if(this.Events)
            {
                switch(this.Trigger){
                    case Tippie.Application.EVENT.DIVISION_CHANGED:
                        this.Events.Trigger(Tippie.Application.EVENT.DIVISION_CHANGED, e);
                        break;

                    case Tippie.Application.EVENT.SETTING_CHANGED:

                        var settings = [];
                        scope.Field.parents().find('#settings input').each(function(){
                            settings.push([$(this).attr('id'), $(this).val()]);
                        });

                        this.Events.Trigger(Tippie.Application.EVENT.SETTING_CHANGED, settings);
                        break;
                }
            }
        },

        /**
         * Validate
         * @classDescription: performs validation based on min/max and increases by step.
         * @param {enum} type   enumeration based on the type of validation to perform (up/down)
         */
        Validate: function(type)
        {
            switch(type){
                case this.VALID_UP_VALUE:
                    if(this.Field.val() < this.Max)
                    {
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
        }
    };
})(jQuery);