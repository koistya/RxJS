    /**
     *  Returns an array with the elements within the specified duration from the end of the observable source sequence, using the specified scheduler to run timers.
     *  
     * @example
     *  1 - res = source.takeLastBufferWithTime(5000, [optional scheduler]); 
     * @description
     *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
     *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
     *  result sequence. This causes elements to be delayed with duration.   
     * @param {Number} duration Duration for taking elements from the end of the sequence.
     * @param {Scheduler} scheduler Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
     * @returns {Observable} An observable sequence containing a single array with the elements taken during the specified duration from the end of the source sequence.
     */
    observableProto.takeLastBufferWithTime = function (duration, scheduler) {
        var source = this;
        scheduler || (scheduler = timeoutScheduler);
        return new AnonymousObservable(function (observer) {
            var q = [];

            return source.subscribe(function (x) {
                var now = scheduler.now();
                q.push({ interval: now, value: x });
                while (q.length > 0 && now - q[0].interval >= duration) {
                    q.shift();
                }
            }, observer.onError.bind(observer), function () {
                var now = scheduler.now(), res = [];
                while (q.length > 0) {
                    var next = q.shift();
                    if (now - next.interval <= duration) {
                        res.push(next.value);
                    }
                }

                observer.onNext(res);
                observer.onCompleted();
            });
        });
    };
