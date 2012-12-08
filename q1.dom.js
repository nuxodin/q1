!function(){
	'use strict';

	/* polyfill (test w3c conformance) */
	if(!Node.prototype.remove){
		Node.prototype.remove = function( removeChildren ){
			this.parentNode && this.parentNode.removeChild( this );
		};
	}

	/* ie10 contains-bug, textNodes are not containing */
	var t = document.createTextNode(''), el = document.createElement('span');
	el.appendChild(t);
	if(!el.contains(t)){
		HTMLElement.prototype.contains = function(contains){
			return function(el){
				return el.parentNode === this ? true : contains.call(this,el);
			};
		}(HTMLElement.prototype.contains);
	}
	t.remove();
	el.remove();

	
	
	
	/* usefull */
	Node.prototype.q1RemoveNode = function( removeChildren ){
		if ( removeChildren ){
			return this.remove();
		} else {
			var range = document.createRange();
			range.selectNodeContents( this );
			return this.parentNode.replaceChild( range.extractContents(), this );
		}
	};
	Node.prototype.q1ReplaceNode = function( el ){
		this.parentNode && this.parentNode.insertBefore(this, el);
		el.appendChild(this);
		this.remove();
	};
	Node.prototype.q1Rect = function( rct ){
		if(rct){
			this.style.top = rct.y+'px';
			this.style.left = rct.x+'px';
			this.style.width = rct.w+'px';
			this.style.height = rct.h+'px';
		} else {
	        var pos = this.getBoundingClientRect();
	        return q1.rect({
	        	x:pos.left+pageXOffset,
	        	y:pos.top+pageYOffset,
	        	w:pos.width,
	        	h:pos.height
	        });
		}
	};
	Node.prototype.q1Position = function( rct ){
		if(rct){
			this.style.top = rct.y+'px';
			this.style.left = rct.x+'px';
		} else {
	        var pos = this.getBoundingClientRect();
	        return q1.rect({
	        	x:pos.left+pageXOffset,
	        	y:pos.top+pageYOffset,
	        	w:0,
	        	h:0
	        });
		}
	};
	document.q1NodeFromPoint = function(x, y){
		if(y===undefined){
			y = x.y;
			x = x.x;
		}
		var el = document.elementFromPoint(x, y);
		var nodes = el.childNodes;
		for ( var i = 0, n; n = nodes[i++];) {
			if (n.nodeType === 3) {
				var r = document.createRange();
				r.selectNode(n);
				var rects = r.getClientRects();
				for ( var j = 0, rect; rect = rects[j++];) {
					if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
						return n;
					}
				}
			}
		}
		return el;
	};

	/*	
	var proto;
	if( window.Element && (proto = Element.prototype) && !proto.matchesSelector ){
		proto.matchesSelector = proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
	}
	*/
}();