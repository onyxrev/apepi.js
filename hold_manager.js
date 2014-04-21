define([
    "jquery",
    "fsm"
], function(
    jQuery,
    FsmModule
){
    var HoldManager = function(options){
        this.options = jQuery.extend({
            debug: false
        }, options);

        this.promises = [];

        this.initTransitionBus();
        this.transitionState("ready");
    };

    FsmModule(HoldManager);

    jQuery.extend(HoldManager.prototype, {
        add: function(){
            var self = this;
            var promise = this.createPromise();

            promise.done(function(){
                self.onResolvedPromise(promise);
            });

            this.addPromise(promise);

            return promise;
        },

        addPromise: function(promise){
            this.log("ApePI HoldManager: adding hold");

            this.promises.push(promise);
            this.destabilize();
        },

        removePromise: function(promise){
            var index = this.promises.indexOf(promise);
            this.promises.splice(index, 1);
        },

        onResolvedPromise: function(promise){
            this.removePromise(promise);

            if (this.promises.length === 0){
                this.stabilize();
            }
        },

        destabilize: function(){
            this.log("ApePI HoldManager: now holding for", this.promises.length, "outstanding holds");

            this.transitionState("holding");
        },

        stabilize: function(){
            this.log("ApePI HoldManager: now ready");

            this.transitionState("ready");
        },

        createPromise: function(){
            return new jQuery.Deferred();
        },

        log: function(){
            if (!this.options.debug) return;
            console.log.apply(console, arguments);
        }
    });

    return HoldManager;
});
