define([
    "jquery"
], function(jQuery){
    return function(module){
        jQuery.extend(module.prototype, {
            initTransitionBus: function(){
                this.stateTransitionBus = new jQuery.Deferred();

                this.onTransition = this.stateTransitionBus.progress.bind(this);

                this.transitionState("initializing");
            },

            transitionState: function(newState){
                var oldState = this.state;

                this.state = newState;

                this.stateTransitionBus.notify({
                    from: oldState,
                    to:   newState
                });
            }
        });

        return module;
    };
});
