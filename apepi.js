define([
    "jquery",
    "fsm",
    "hold_manager",
    "queue_manager",
    "request_throttler"
], function (
    jQuery,
    FsmModule,
    HoldManager,
    QueueManager,
    RequestThrottler
) {
    var ApePI = function(options){
        var self = this;

        this.options = jQuery.extend({
            debug:    false,
            debounce: false
        }, options);

        this.initTransitionBus();
        this.initHoldManager();
        this.initQueueManager();

        this.onTransition(function(){
            self.handleTransition.apply(self, arguments);
        });

        if (this.options.debounce){
            this.initRequestThrottler();

            this.requestThrottler.onTransition(function(){
                self.evaluateReadiness();
            });
        }

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
            var isThrottled = this.requestThrottler && this.requestThrottler.state === "unstable";
            var isReady     = !isThrottled && this.holdManager.state === "ready";

            var newState = isReady ? "ready" : "settling";

            if (this.state === newState) return;

            this.transitionState(newState);
        },

        addRequest: function(request){
            var promise = this.queueManager.add(request);

            if (this.options.debounce){
                this.requestThrottler.destabilize();
            }

            this.onRequestAdd(promise);

            return promise;
        },

        onRequestAdd: function(promise){
            if (this.state !== "ready") return;

            promise.queue.flush();
        },

        addHold: function(){
            return this.holdManager.add();
        },

        handleTransition: function(event){
            this.log("ApePI Master: transitioned from", event.from, "to", event.to);

            if (event.to === "ready"){
                this.queueManager.flushAll();
            }
        },

        log: function(){
            if (!this.options.debug) return;
            console.log.apply(console, arguments);
        }
    });

    return ApePI;
});
