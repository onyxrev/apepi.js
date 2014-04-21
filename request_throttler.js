var RequestThrottler = function(options){
    this.options = jQuery.extend({
        debug:           false,
        debounceTimeout: 200
    }, options);

    this.initTransitionBus();
    this.transitionState("stable");
};

FsmModule(RequestThrottler);

jQuery.extend(RequestThrottler.prototype, {
    destabilize: function(){
        var self = this;

        this.transitionState("unstable");

        this.log("RequestThrottler: now unstable - waiting at least", this.options.debounceTimeout, "milliseconds");

        if (this._debounceTimeout) clearTimeout(this._debounceTimeout);

        this._debounceTimeout = setTimeout(function(){
            self.stabilize();
        }, this.options.debounceTimeout);
    },

    stabilize: function(){
        this.transitionState("stable");
        this.log("RequestThrottler: now stable");
    },

    log: function(){
        if (!this.options.debug) return;
        console.log.apply(console, arguments);
    }
});
