;(function ($) {
    /**
     * class FadeContent
     *
     * Encapsulates the functionality of a menu that pops up when another UI
     * element is hovered.
     **/
    FadeContent = function (config) {
        /**
         * new FadeContent(config)
         * - config (Object): A configuration object for the [[FadeContent]]
         *   consisting of the following keys:
         *   - closer (HTMLElement | jQuery | String): A jQuery object, HTML element, or CSS selector that will ultimately resolve to an HTML element will act as a close button for the FadeContent.
         *   - closeClass (string): CSS classes to be added to the FadeContent's close button.
         *   - closeTag (string): The HTML tag to use for the FadeContent's close button if no closer is provided. Defaults to span.
         *   - trigger (HTMLElement): The HTML element that should be the trigger for opening & closing the FadeContent.
         *   - FadeContent (HTMLElement): The HTML element that should be shown and hidden when the trigger is interacted with.
         *   - triggerEvent (FadeContent.TRIGGER_EVENT): The event that should trigger opening of the FadeContent. Defaults to [[FadeContent.TRIGGER_EVENT.HOVER]]
         **/
        var __scope = this;

        config = (config = config || {});

        this.Button = $(config.button);
        this.Element = $(config.element);
        this.Content =  this.Element.children().map(function(idx, elem) {
            return [elem];
        });

        this.EditContent = this.Content.slice(0);
        this.Duration = config.duration;
        this.FadeIn = (config.fadeIn = config.fadeIn || 1000);
        this.FadeOut = (config.fadeOut = config.fadeOut || 1000);
        if(this.Button)
        {
            this.Button.on('click', function(e){
                __scope.Render(e);
            })
        }
        __scope.Render();
    };

    /**
     * FadeContent.STATE = Object
     *
     * An enumeration of possible states that the FadeContent can have, with the following members:
     * - CLOSED: The FadeContent is currently closed.
     * - OPEN: The FadeContent is currently open.
     **/
    FadeContent.STATE = {
        STOPPED: false,
        PLAYING: true
    };

    FadeContent.prototype = {
        _state: FadeContent.STATE.PLAYING,

        /**
         * FadeContent#Close -> void
         *
         * [[FadeContent#Close]] closes the FadeContent and sets proper state on all related elements.
         **/
        Render: function (event) {
            _state = this.GetState();
            if(event && this.Duration)
            {
                clearInterval(this.Timer)
                //this.Start();
            }

            if(this.Duration)
            {
                var __scope = this;
                if(_state == FadeContent.STATE.PLAYING)
                {
                    this.Start();
                    _state = FadeContent.STATE.STOPPED;

                    this.Timer = setInterval(function(){
                        __scope.Start();
                    }, this.Duration);
                }
            }
            else
            {
                this.Start();
            }
        },

        /**
         * FadeContent#Close -> void
         *
         * [[FadeContent#Close]] closes the FadeContent and sets proper state on all related elements.
         **/
        Start: function () {
            var __scope = this;

            this.Element.fadeOut(this.FadeOut, function()
            {
                $(this).html(__scope.GetItem());
                $(this).fadeIn(this.FadeIn);
            });
        },

        /**
         * FadeContent#GetState() -> FadeContent.STATE
         *
         * [[FadeContent#GetState]] returns the appropriate [[FadeContent.STATE]] value to indicate whether the FadeContent is currently open or closed.
         **/
        GetItem: function () {

            var currentElement;
            if(this.EditContent.length > 0)
            {
                sliceArray(this.EditContent);
            }
            else
            {
                this.EditContent = this.Content.slice(0);
                sliceArray(this.EditContent);
            }

            //private
            function sliceArray(currentData)
            {
                var randomSeed = Math.floor(Math.random() * currentData.length);
                currentElement = currentData[randomSeed];
                currentData.splice(randomSeed, 1);
            }

            return currentElement;
        },

        /**
         * FadeContent#GetState() -> FadeContent.STATE
         *
         * [[FadeContent#GetState]] returns the appropriate [[FadeContent.STATE]] value to indicate whether the FadeContent is currently open or closed.
         **/
        GetState: function () {
            return this._state;
        },
    };
})(jQuery);