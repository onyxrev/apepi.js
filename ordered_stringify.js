// an 'ordered JSON.stringify' implementation from http://stamat.wordpress.com/2013/07/03/javascript-object-ordered-property-stringify
define([
], function(){
    var orderedStringify = function(o, fn) {
        var val = o;
        var type = types[whatis(o)];
        if(type === 3) {
            val = _objectOrderedStringify(o, fn);
        } else if(type === 2) {
            val = _arrayOrderedStringify(o, fn);
        } else if(type === 1) {
            val = '"'+val+'"';
        }

        if(type !== 4)
            return val;
    };

    var _objectOrderedStringify = function(o, fn) {
        var res = '{';
        var props = keys(o);
        props = fn ? props.sort(fn) : props.sort();

        for(var i = 0; i < props.length; i++) {
            var val = orderedStringify(o[props[i]], fn);
            if(val !== undefined)
                res += '"'+props[i]+'":'+ val+',';
        }
        var lid = res.lastIndexOf(',');
        if (lid > -1)
            res = res.substring(res, lid);
        return res+'}';
    };

    var _arrayOrderedStringify = function(a, fn) {
        var res = '[';
        for(var i = 0; i < a.length; i++) {
            var val = orderedStringify(a[i], fn);
            if(val !== undefined)
                res += ''+ val+',';
        }
        var lid = res.lastIndexOf(',');
        if (lid > -1)
            res = res.substring(res, lid);
        return res+']';
    };

    //HELPER FUNCTIONS

    var keys = function(o) {
        if(Object.keys)
            return Object.keys(o);
        var res = [];
        for (var i in o) {
            res.push(i);
        }
        return res;
    };

    var types = {
        'integer': 0,
        'float': 0,
        'string': 1,
        'array': 2,
        'object': 3,
        'function': 4,
        'regexp': 5,
        'date': 6,
        'null': 7,
        'undefined': 8,
        'boolean': 9
    }

    var getClass = function(val) {
        return Object.prototype.toString.call(val)
            .match(/^\[object\s(.*)\]$/)[1];
    };

    var whatis = function(val) {

        if (val === undefined)
            return 'undefined';
        if (val === null)
            return 'null';

        var type = typeof val;

        if (type === 'object')
            type = getClass(val).toLowerCase();

        if (type === 'number') {
            if (val.toString().indexOf('.') > 0)
                return 'float';
            else
                return 'integer';
        }

        return type;
    };

    return orderedStringify;
});
