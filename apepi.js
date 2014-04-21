var ApePI = function(options){
    var self = this;

    this.options = jQuery.extend({
        debug: false
    }, options);

    this.initTransitionBus();
    this.initRequestThrottler();
    this.initHoldManager();
    this.initQueueManager();

    this.onTransition(function(){
        self.handleTransition.apply(self, arguments);
    });

    this.requestThrottler.onTransition(function(){
        self.evaluateReadiness();
    });

    this.holdManager.onTransition(function(){
        self.evaluateReadiness();
    });
};

FsmModule(ApePI);

jQuery.extend(ApePI.prototype, {
    initRequestThrottler: function(){
        this.requestThrottler = new RequestThrottler({
            debug: this.options.debug
        });
    },

    initHoldManager: function(){
        this.holdManager = new HoldManager({
            debug: this.options.debug
        });
    },

    initQueueManager: function(){
        this.queueManager = new QueueManager({
            debug:          this.options.debug,
            requestHandler: this.options.requestHandler
        });
    },

    evaluateReadiness: function(){
        var isReady  = this.requestThrottler.state === "stable" &&
                       this.holdManager.state      === "ready";

        var newState = isReady ? "ready" : "settling";

        if (this.state === newState) return;

        this.transitionState(newState);
    },

    addRequest: function(request){
        var promise = this.queueManager.add(request);

        this.requestThrottler.destabilize();

        return promise;
    },

    addHold: function(){
        return this.holdManager.add();
    },

    handleTransition: function(event){
        this.log("Master: transitioned from", event.from, "to", event.to);

        if (event.to === "ready"){
            this.queueManager.flushAll();
        }
    },

    log: function(){
        if (!this.options.debug) return;
        console.log.apply(console, arguments);
    }
});
