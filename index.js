'use strict';

function ObjectMerger() { }

ObjectMerger.prototype.applyTo = function(object, mutate) {
	if(!mutate) {
		let merged = {};
		if(typeof(object) === 'object') {
			for(let k in object) {
				if(Object.prototype.hasOwnProperty.call(object, k)) {
					merged[k] = object[k];
				}
			}
		}
		object = merged;
	}
	
	for(let k in this) {
		if(Object.prototype.hasOwnProperty.call(this, k)) {
			let v = this[k];
			if(v === removed)
				delete object[k];
			else
				object[k] = applyTo(v, object[k]);
		}
	}
	
	return object;
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
		array[this.index] = applyTo(this.value, array[this.index]);
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
	if(!mutate)
		array = Array.apply(null, array);
	
	let w = 0;
	for(let v of array)
		if(v !== this.value)
			array[w++] = v;
	array.length = w;
	
	return array;
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
	let mutated = false;
	for(let op of this.operations) {
		if(op) {
			value = op.applyTo(value, mutated);
			mutated = true;
		}
	}
	return value;
};

const removed = Object.freeze({});

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
	if(typeof(operation) !== 'undefined' && operation !== null && typeof(operation.__proto__.applyTo) !== 'undefined')
		return operation.applyTo(value);
	return operation;
}

module.exports = { removed, patch, set, removeAt, remove, insert, concat, push, compose, applyTo };
