;(function ($) {
    /**
     * class FadeContent
     *
     * Encapsulates the functionality of content that fades in/out
     **/
    FadeContent = function (config) {
        /**
         * new FadeContent(config)
         * - config (Object): A configuration object for the [[FadeContent]]
         *   consisting of the following keys:
         *   - Button (HTMLElement | jQuery | String): Button to progress into FadeContent.
         *   - Element (HTMLElement): current element being shown.
         *   - Content (Array): An array of HTMLElements loaded into FadeContent.
         *   - Duration (Number): How long each content slide lasts (milliseconds).
         *   - FadeIn (Number): The duration of the fadeIn animation (milliseconds).
         *   - FadeOut (Number): The duration of the fadeOut animation (milliseconds).
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
     * - STOPPED: The FadeContent is currently stopped.
     * - PLAYING: The FadeContent is currently playing.
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
                clearInterval(this.Timer);

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
         * FadeContent#Start -> void
         *
         * [[FadeContent#Start]] Fades out current content and starts the next piece of content
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
         * FadeContent#GetItem() -> HTMLElement
         *
         * [[FadeContent#GetItem]] returns the appropriate HTMLElement
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
         * [[FadeContent#GetState]] returns the appropriate [[FadeContent.STATE]] value to indicate whether the FadeContent is currently playing or stopped.
         **/
        GetState: function () {
            return this._state;
        }
    };
})(jQuery);