'use strict';

var hasOwn = Object.prototype.hasOwnProperty;

function tp(v) {
	var type = typeof(v);
	if(v instanceof Array)
		type = 'array';
	else if(v instanceof Date)
		type = 'date';
	return type;
}

function Replacer(value) {
	this.value = value;
}

Replacer.prototype.applyTo = function(object) {
	var type = tp(this.value);
	
	if(type !== tp(object))
		return this.value;
	
	switch(type) {
	case 'object':
		var n = 0;
		for(var key in object)
			if(hasOwn.call(object, key))
				++n;
		
		for(var key in this.value) {
			if(hasOwn.call(this.value, key)) {
				--n;
				if(this.value[key] !== object[key])
					return this.value;
			}
		}
		
		if(n !== 0)
			return this.value;
		
		break;
	
	case 'array':
		if(this.value.length !== object.length)
			return this.value;
		
		for(var i in this.value)
			if(this.value[i] !== object[i])
				return this.value;
		
		break;
	
	default:
		return this.value;
	}
	
	return object;
};

function ObjectMerger() { }

ObjectMerger.prototype.applyTo = function(object, mutate) {
	var twin;
	if(mutate)
		twin = object;
	else {
		twin = {};
		if(typeof(object) === 'object') {
			for(var k in object) {
				if(hasOwn.call(object, k)) {
					twin[k] = object[k];
				}
			}
		}
	}
	
	var mutated = object === null || typeof(object) !== 'object' || object instanceof Array || object instanceof Date;
	for(var k in this) {
		if(hasOwn.call(this, k)) {
			var v = this[k];
			if(v === removed) {
				if(k in twin) {
					mutated = true;
					delete twin[k];
				}
			} else {
				var prev = twin[k];
				var next = applyTo(v, prev);
				mutated = mutated || prev !== next;
				twin[k] = next;
			}
		}
	}
	
	return mutated ? twin : object;
};

function ArraySetter(index, value) {
	this.index = index;
	this.value = value;
}

ArraySetter.prototype.applyTo = function(array, mutate) {
	if(!mutate)
		array = Array.apply(null, array);
	
	if(this.value !== removed) {
		if(this.index >= array.length)
			array.length = this.index + 1;
		var prev = array[this.index];
		var next = applyTo(this.value, prev);
		if(prev === next)
			return array;
		array[this.index] = next;
	} else if(array.length) {
		array.copyWithin(this.index, this.index+1);
		--array.length;
	}
	
	return array;
};

function ArrayRemover(value) {
	this.value = value;
}

ArrayRemover.prototype.applyTo = function(array, mutate) {
	var twin = mutate ? array : Array.apply(null, array);
	
	var w = 0;
	for(var i = 0, n = twin.length; i < n; ++i) {
		var v = twin[i];
		if(v !== this.value)
			twin[w++] = v;
	}
	
	if(w === array.length)
		return array;
	
	twin.length = w;
	
	return twin;
};

function ArrayInserter(index, value) {
	this.index = index;
	this.value = value;
}

ArrayInserter.prototype.applyTo = function(array, mutate) {
	if(this.value === removed)
		return array;
	if(!mutate)
		array = Array.apply(null, array);
	
	++array.length;
	array.copyWithin(this.index+1, this.index);
	array[this.index] = this.value;
	
	return array;
};

function ArrayConcatenater(array) {
	this.array = array;
}

ArrayConcatenater.prototype.applyTo = function(array) {
	if(!array)
		return this.array;
	if(this.array.length === 0)
		return array;
	return array.concat(this.array);
};

function ArrayPusher(value) {
	this.value = value;
}

ArrayPusher.prototype.applyTo = function(array, mutate) {
	if(!mutate)
		array = Array.apply(null, array);
	array.push(this.value);
	return array;
};

function Composition(operations) {
	this.operations = operations;
}

Composition.prototype.applyTo = function(value) {
	var mutated = false;
	for(var i = 0, n = this.operations.length; i < n; ++i) {
		var op = this.operations[i];
		var prev = value;
		value = op.applyTo(prev, mutated);
		mutated = mutated || value !== prev;
	}
	return value;
};

const removed = Object.freeze({});

function replace(value) {
	return new Replacer(value);
}

function patch(diff) {
	diff.__proto__ = ObjectMerger.prototype;
	return diff;
}

function set(index, value) {
	return new ArraySetter(index, value);
}

function removeAt(index) {
	return new ArraySetter(index, removed);
}

function remove(value) {
	return new ArrayRemover(value);
}

function insert(index, value) {
	return new ArrayInserter(index, value);
}

function concat(array) {
	return new ArrayConcatenater(array);
}

function push(value) {
	return new ArrayPusher(value);
}

function compose(/*...*/) {
	return new Composition(Array.apply(null, arguments));
}

function applyTo(operation, value) {
	if(operation && operation.__proto__.applyTo)
		return operation.applyTo(value);
	return operation;
}

module.exports = { removed:removed, replace:replace, patch:patch, set:set, removeAt:removeAt, remove:remove, insert:insert, concat:concat, push:push, compose:compose, applyTo:applyTo };
