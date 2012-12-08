!function(undf,k){
	'use strict';

	self.q1 = {};
	q1.ext = function(src, target){ target=target||{}; for(k in src) target[k]===undf && (target[k] = src[k]); return target; };
	/* usefull */
	RegExp.q1Escape = function(text){
	    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	Function.prototype.q1Multi = function(){
        var fn = this;
        return function(a,b){
            if(b === undf && typeof a == 'object'){
                for(var i in a)
                    if(a.hasOwnProperty(i))
                        fn.call(this,i,a[i]);
                return;
            }
            return fn.apply(this,arguments);
        };
	};
	Function.prototype.q1Throttle = function(time, cb){ /* cb useful? */
		var fn = this;
		var timeout = null;
		return function(){
			var inst = this;
			var args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout( function(){
					var ret = fn.apply(inst,args);
					cb && cb(ret);
			}, time);
		};
	};
	Function.prototype.q1Wait = function(min,max){ // waits for the execution of the function (min) and then executes the last call, but waits maximal (max) millisecunds
        var fn = this, minTimer, maxTimer, inst, args
        ,wait = function(){
            clearTimeout(maxTimer)
console.log(maxtimer)
            maxTimer = 0;
            fn.apply(inst,args);
        };
        return function(){
            inst=this, args=arguments;
            clearTimeout(minTimer)
            minTimer = setTimeout(wait, min);
            !maxTimer && max && (maxTimer = setTimeout(wait, max));
        };
    }	
	
	/*
	Function.prototype.q1Limit = function(times){
		var accessCount = times || 1;
		var fn = this; 
		return function(){
			return accessCount-- > 0 ? fn.apply(this,arguments) : function(){}; 
		};
	};
	*/

	/* polyfils */
	if(!String.prototype.trim){
		String.prototype.trim = function(){
			  return this.replace(/^\s+|\s+$/g,'');
		};
	}
	if(!Function.prototype.bind){
		Function.prototype.bind = (function(){
			  var _slice = Array.prototype.slice;
			  return function(context) {
			    var fn = this,
			        args = _slice.call(arguments, 1);

			    if (args.length) { 
			      return function() {
			        return arguments.length
			          ? fn.apply(context, args.concat(_slice.call(arguments)))
			          : fn.apply(context, args);
			      };
			    } 
			    return function() {
			      return arguments.length
			        ? fn.apply(context, arguments)
			        : fn.call(context);
			    }; 
			  };
		})();		
	}
	if( !Array.prototype.forEach ){
		Array.prototype.forEach = function( callback, thisArg ){
			var T, k;
			if ( this == null ){
				throw new TypeError( "this is null or not defined" );
			}
			var O = Object(this);
			var len = O.length >>> 0; // Hack to convert O.length to a UInt32
			if ( {}.toString.call(callback) != "[object Function]" ){
				throw new TypeError( callback + " is not a function" );
			}
			if ( thisArg ){
				T = thisArg;
			}
			k = 0;
			while( k < len ){
				var kValue;
				if ( k in O ){
					kValue = O[ k ];
					callback.call( T, kValue, k, O );
				}
				k++;
			}
		};
	}

	/* ie8 does not support negative values (splice?)
	if('ab'.substr(-1) != 'b'){ 
		String.prototype.substr = function(substr){
			return function(start, length){
				if (start < 0) start = this.length + start;
				return substr.call(this, start, length);
			};
		}(String.prototype.substr);
	}	
	*/
	
	q1.Eventer = {
	    initEvent : function(n){
	        !this._Es && (this._Es={});
	        !this._Es[n] && (this._Es[n]=[]);
	        return this._Es[n];
	    }
	    ,on:function(ns,fn){
	    	ns = ns.split(' ');
	    	for(var i=0, n; n = ns[i++];){
		        this.initEvent(n).push(fn);
	    	}
	    }.q1Multi()
	    ,off:function(ns,fn){
	    	ns = ns.split(' ');
	    	for(var i=0, n; n = ns[i++];){
		        var Events = this.initEvent(n);
		        Events.splice( Events.indexOf(fn) ,1);
	    	}
	    }.q1Multi()
	    ,trigger:function(ns,e){
	    	e = e || {};
	    	e.scope = this;
	    	ns = ns.split(' ');
	    	var self = this;
	    	for(var i=0, n; n = ns[i++];){
		    	e.type = n;
		    	var Events = this.initEvent(n);
		        Events.forEach(function(E){
		            E.bind(self)(e);
		        });
	    	}
	    }
	};
	
	/* rect */
	q1.rect = function(obj){
		this.x = obj.x || 0;
		this.y = obj.y || 0;
		this.w = obj.w || 0;
		this.h = obj.h || 0;
	};
	q1.rect.prototype = {
        x:0,y:0,w:0,h:0
        ,r:function(){ return this.x + this.w; }
        ,b:function(){ return this.y + this.h; }
        //,relative:function(rct){ return new $.tct(this.x-rct.x,this.y-rct.y,this.w,this.h); }
        ,isInX: function(rct){ rct.x > this.x && rct.r() < this.r(); }
        ,isInY: function(rct){ rct.y > this.y && rct.r() < this.r(); }
        ,isIn: function(rct){ return this.isInX(rct) && this.isInY(rct); }
        ,touchesX: function(rct){ return rct.x < this.r() && rct.r() > this.x; }
        ,touchesY: function(rct){ return rct.y < this.b() && rct.b() > this.y; }
        ,touches: function(rct){ return this.touchesX(rct) && this.touchesY(rct); }
        ,grow: function(value){ this.x += value; this.y += value; this.w += value; this.h += value; }
	};
	
	
	
}();