;(function ($) {
    /**
     * ProgressCircle
     * @classDescription: creates a circular ui element
     * @param {htmlElement} element    The htmlElement that will build the circle
     * @param {number} max    The maximum value that is displayed.
     */
    ProgressCircle = function (config) {
        config = (config = config || {});
        this.Element = $(config.element);
        this.Element.append('<div class="percent"></div><div id="slice"><div class="pie"></div></div>');
        this.Element.css('font-size', '68px');
        this.Max = config.max;
    };

    ProgressCircle.prototype = {

        /**
         * Render
         * @classDescription: Renders the element
         * @param {number} percent    the percentage to draw
         */
        Render: function (percent) {
            if(percent >= this.Max / 2)
            {
                if(this.Element.find('.fill').length == 0)
                {
                    this.Element.find('#slice').append('<div class="pie fill"></div>');
                }
                this.Element.find('#slice').addClass('gt50');
            }
            else
            {
                this.Element.find('.fill').remove();
                this.Element.find('#slice').removeClass('gt50');
            }

            this.Element.find('#slice .pie').css({
                '-webkit-transform':'rotate('+ 360 / this.Max * percent + 'deg)'
            });
            this.Element.find('.percent').html(Math.round(percent) + '%' );
        },

        /**
         * SetMax
         * @classDescription: Sets the maximum value dynamically
         * @param {number} value    the value of the max limit
         */
        SetMax: function(value){
            this.Max = value;
        }
    };
})(jQuery);