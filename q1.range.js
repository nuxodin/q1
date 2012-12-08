!function(){
	'use strict';
	
	var sel = getSelection();

	q1.range = function(oRange){
		if (!(this instanceof q1.range)) return new q1.range(oRange);
		this.oR = oRange || document.createRange();
	};
	q1.range.prototype = {
		container: function(){
			return this.oR.commonAncestorContainer;
		}
		,containerElement: function(){
			var node = this.oR.commonAncestorContainer;
			return node.nodeType === 1 ? node : node.parentNode;
		}
		,startContainer: function(){
			return this.oR.startContainer;
		}
		,startOffset: function(){
			return this.oR.startOffset;
		}
		,endContainer: function(){
			return this.oR.endContainer;
		}
		,endOffset: function(){
			return this.oR.endOffset;
		}
		,clone: function(){
			return q1.range( this.oR.cloneRange() );
		}
		,extractContents: function(){
			return this.oR.extractContents();
		}
		,rect: function(){
			var pos = this.oR.getClientRects()[0];
			pos = pos || this.oR.getBoundingClientRect();
			
			/*
			var pos = this.oR.getBoundingClientRect();
			pos = pos || this.oR.getClientRects()[0] || {x:0,y:0};
			*/
	        return q1.rect({
	        	x:pos.left+pageXOffset,
	        	y:pos.top+pageYOffset,
	        	w:pos.width,
	        	h:pos.height
	        });
		}
		,select: function(){
			sel.removeAllRanges();
			sel.addRange( this.oR );
		}
		,toString: function(){
			return this.oR.toString();
		}
		,toCleanString: function(){
			var fragment = this.oR.cloneContents();
			var div = document.createElement('div');
			[].slice.call(fragment.querySelectorAll('script, style')).forEach( function(el){
				el.remove();
			});
			div.appendChild(fragment);
			return div.textContent.replace(/\s+/g, ' ');
		}
	};
	var setters = {
		setStart: function(node,offset){
			this.oR.setStart(node,offset);
			return this;
		}
		,setStartBefore: function(node){
			this.oR.setStartBefore(node);
			return this;
		}
		,setEnd: function(node,offset){
			this.oR.setEnd(node,offset);
			return this;
		}
		,setEndAfter: function(node){
			this.oR.setEndAfter(node);
			return this;
		}
		,toNode: function(node){
			this.oR.selectNode(node);
			return this;
		}
		,toContents: function(node){
			this.oR.selectNodeContents(node);
			return this;
		}
		,insert: function(node){
			if( typeof node === 'string' ){ node = document.createTextNode(node); }
			this.oR.insertNode(node);
			return this;
		}
		,collapse: function(toStart){
			this.oR.collapse(toStart);
			return this;
		}
	};
	q1.ext(setters, q1.range.prototype);

	q1.selection = function(){
		if (!(this instanceof q1.selection)) return new q1.selection();
		this.oR = sel.rangeCount ? sel.getRangeAt(0) : document.createRange();
	};
	q1.selection.prototype = new q1.range();
	q1.selection.prototype.constructor = q1.selection;
	for(var i in setters){
		q1.selection.prototype[i] = function(fn){
			return function(){
				var ret = fn.apply(this, arguments);
				sel.removeAllRanges();
				sel.addRange( this.oR );
				return ret;
			};
		}(setters[i]);
	}
	q1.selection.prototype.range = function(){
		return q1.range(this.oR);
	};
	q1.selection.prototype.toString = function(){
		return sel.toString();
	};
	
	
	
	
	
	/* extensions *
	q1.range.prototype.element1 = function(){
		if ( !this.oR.collapsed && this.startContainer().childNodes.length ){ // images
			el = this.startContainer().childNodes[ this.startOffset() ];
		} else {
			el = this.containerElement();
		}
		//while (el.nodeType == 3) el = el.parentNode;
		return el;
	};
	/**/

	var nextNode = function(node){
		if(node.firstChild){
			return node.firstChild;
		}
		while(node){
			if(node.nextSibling){
				return node.nextSibling;
			}
			node = node.parentNode;
		}
		return false;
	};
	var nextTextNode = function(node){
		do{
			var node = nextNode(node);
			if( node.nodeType === 3 ){
				return node;
			};
		} while( node );
		return false;
	};
	var nextPosition = function(node,offset){
		offset++;
		if( node.data===undefined || offset >= node.data.length ){
			node = nextTextNode(node);
			offset = 0;
		}
		return [node,offset];
	};
	
	/* prototype */
	q1.range.prototype.walkChar = function(){
		var before = this.toCleanString();
		do{
			var pos = nextPosition(this.oR.endContainer, this.oR.endOffset );
			this.oR.setEnd(pos[0],pos[1]);
		} while( this.toCleanString() === before );
		this.setEnd(pos[0], pos[1]);
	};
	
	q1.range.prototype.affectedRootNodes = function(){
		var el = this.oR.startContainer;
		var end = this.oR.endContainer;
		var els = [];
		var prev = null;
		do {
			if( el===end ){ break; }
			if( el.contains && el.contains(end) ){ continue; }
			if( prev && prev.contains && prev.contains(el) ){ continue; }
			prev = el;
			els.push(el);
		} while( el = nextNode(el) )
		els.push(el);
		return els;
	};
	q1.range.prototype.splitTextNodes = function(){
		var node = this.oR.startContainer;
		if(node.data){
			var startNode = node.splitText( this.oR.startOffset );
			this.setStart(startNode,0);
		}
		node = this.oR.endContainer;
		if(node.data){
			node.splitText( this.oR.endOffset );
			this.setEnd(node,node.data.length);
		}
	};
	q1.range.prototype.containingRootNodes = function(){
		this.splitTextNodes();
		return this.affectedRootNodes();
	};
	q1.range.prototype.containingRootNodesForceElements = function(){
		var nodes = this.containingRootNodes();
		var newNodes = [];
		for(var i=0, el; el=nodes[i++];){
			if(el.data){
				if(el.data.trim() === ''){ continue; }
				var nEl = document.createElement('span');
				el.parentNode.insertBefore( nEl, el );
				nEl.appendChild(el);
				el = nEl;
			}
			newNodes.push(el);
		}
		if(newNodes[0]){
			this.setStartBefore(nodes[0]);
			this.setEndAfter(nodes[nodes.length-1]);
		}
		return newNodes;
	};
	
	q1.range.prototype.collapseToPoint = function(x, y){
		var r = this.oR;
		var el = document.q1NodeFromPoint(x,y);
		if(el.nodeType!==3){
			return this.setStart(el, 0).setEnd(el, 0);
		}
		r.setStart(el,0);
		r.setEnd(el,0);
		var rect = this.rect();
		while (rect.y+rect.h < y || rect.x < x){
			if(r.startOffset-1 > el.data.length){ break; }
			r.setStart(r.startContainer, r.startOffset+1);
			rect = this.rect();
		}
		return this.collapse(true); //.setStart(el,)collapse(true);
	};
	
	/* alpha (not working) */
	q1.range.prototype.findElement = function(){
		if( this.oR.toString().trim() === this.oR.commonAncestorContainer.textContent.trim() ){ // not perfect
			return this.oR.commonAncestorContainer;
		}
		var start = this.oR.startContainer;
		var end = this.oR.endContainer;
		if( nextNode(start) === prevNode(end) && start.data.trim() === '' && end.data.trim() === '' ){
			return nextNode(start);
		}
		return false;
	};
	
	/*
	q1.range.prototype.extendWordEnd = function(){
		var node = this.endContainer();
		var data = node.data;
		var offset = this.endOffset();
		while( data[offset+1] && !data[offset].match(/\s/) ){
			offset++;
		}
		this.setEnd(node,offset);
	};
	
	q1.range.prototype.extendWordStart = function(){
		var node = this.startContainer();
		var data = node.data;
		var offset = this.startOffset();
		while( data[offset-1] && !data[offset-1].match(/\s/) ){
			offset--;
		}
		this.setStart(node,offset);
	};
	*/
	
	
}();