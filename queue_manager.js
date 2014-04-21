define([
    "jquery"
], function(jQuery){
    var QueueManager = function(options){
        this.options = jQuery.extend({
            requestHandler: jQuery.ajax,
            debug:          false
        }, options)

        this.queues = {};
    };

    jQuery.extend(QueueManager.prototype, {
        add: function(requestParams){
            return this.enqueue(requestParams);
        },

        // we'll take the request URL, params, data, headers and produce a
        // hash of all that information so that in the future we can
        // determine whether the request is unique or redundant
        hashRequest: function(requestParams){
            return this.hash(requestParams);
        },

        hash: function hash(value) {
            return (typeof value) + ' ' + (value instanceof Object ?
                                           (value.__hash || (value.__hash = ++arguments.callee.current)) :
                                           value.toString());
        },

        enqueue: function(requestParams){
            var promise = this.createPromise();
            var queue   = this.getOrCreateQueue(requestParams);

            // add on the queue
            promise.queue = queue;

            queue.promises.push(promise);

            this.log("ApePI QueueManager: enqueued request", requestParams);

            return promise;
        },

        getOrCreateQueue: function(requestParams){
            var hashKey = this.hash(requestParams);
            var queue   = this.getQueue(hashKey);

            if (!queue){
                queue = this.queues[hashKey] = this.createQueue(requestParams, hashKey);
            }

            return queue;
        },

        getQueue: function(hashKey){
            return this.queues[hashKey];
        },

        createQueue: function(requestParams, hashKey){
            var self = this;

            return {
                requestParams: requestParams,

                hash: hashKey,

                promises: [],

                destroy: function(){
                    self.destroyQueue(hashKey);
                },

                flush: function(){
                    self.flushQueue(hashKey);
                }
            };
        },

        destroyQueue: function(hashKey){
            this.queues[hashKey] = null;
            delete(this.queues[hashKey]);
        },

        createPromise: function(){
            return new jQuery.Deferred();
        },

        flushAll: function(){
            this.log("ApePI QueueManager: flushing all queues");

            for(var hashKey in this.queues) {
                if(this.queues.hasOwnProperty(hashKey)){
                    this.queues[hashKey].flush();
                }
            }
        },

        flushQueue: function(hashKey){
            var self          = this;
            var queue         = this.getQueue(hashKey);

            this.log("ApePI QueueManager: flushing queue for", queue.requestParams);

            this.options.requestHandler(queue.requestParams).
                done(function(response){
                    self.resolveQueue.call(this, queue, arguments);
                }).
                fail(function(response){
                    self.failQueue.call(this, queue, arguments);
                }).
                always(function(){
                    queue.destroy();
                });
        },

        resolveQueue: function(queue, args){
            for(var i = 0; i < queue.promises.length; i++){
                queue.promises[i].resolveWith(this, args);
            }
        },

        failQueue: function(queue, args){
            for(var i = 0; i < queue.promises.length; i++){
                queue.promises[i].resolveWith(this, args);
            }
        },

        log: function(){
            if (!this.options.debug) return;
            console.log.apply(console, arguments);
        }
    });

    return QueueManager;
});
