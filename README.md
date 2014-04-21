ApePI: A Private Eye for Your API
=====

![Ape PI](http://i.imgur.com/d1JQNNC.jpg)

Javascript Client API middleware that handles throttling, queuing, request deduplication, and arbitrary holds

Get Started
----

Spark up an instance:

```javascript
apePI = new ApePI({
    requestHandler: $.ajax
});
```

You can use any request handler you like as long as you pass in args in the right format for it and as long as it returns a jQuery-like promise.

Add a Request:

```javascript
var request = apePI.addRequest({
    url: "/bananas/yellow",
    data: { potassium: true },
    dataType: "json"
});
```
... see your request get launched as usual because:

```javascript
> apePI.state
"ready"
```

... the Ape PI is ready.

Holds
----

Add a hold:

```javascript
var hold = apePI.addHold();
```

Add a request:

```javascript
var request = apiePI.addRequest({
    url: "/not/yet"
});
```

... no request.  Why?  Because we're holding.  All requests have been queuing.  You can have as many holds as you like but the requests won't fire until all the holds are resolved.

```javascript
hold.resolve()
```

BOOM. Erm, I mean OOOH AHH AHH AHH. Hold is resolved and the queued requests are made.

Deduplication
---

Add a hold:

```javascript
var hold = apePI.addHold();
```

Add two identical requests:

```javascript
var request1 = apiePI.addRequest({
    url: "/not/yet"
});

var request2 = apiePI.addRequest({
    url: "/not/yet"
});

request1.done(function(){ console.log(arguments); });
request2.done(function(){ console.log(arguments); });
```

Resolve the hold:

```
hold.resolve()
```

OOOH AHH AHHH. One ajax call is actually made because the requests are identical and the result is routed to both requests.

Debouncing
----

Invoke with debouncing true.

```javascript
var apePI = new ApePI({ debounce: true });

```

Fire off a bunch of requests in rapid succession:

```javascript
var requests = 5;

var interval = setInterval(function(){
    apiePI.addRequest({
        url: "/pick/lice"
    });

    requests++;

    if (requests === 5) clearInterval(interval);
}, 50);
```

... the requests are fired off when the requests stop coming in.
