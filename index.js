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
	
	if(this.value === removed) {
		array.copyWithin(this.index, this.index+1);
		--array.length;
	} else {
		if(this.index >= array.length)
			array.length = this.index + 1;
		array[this.index] = applyTo(this.value, array[this.index]);
	}
	
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
	return array.concat(this.array);
};

function Composition(operations) {
	this.operations = operations;
}

Composition.prototype.applyTo = function(value) {
	let mutated = false;
	for(let op of this.operations) {
		value = op.applyTo(value, mutated);
		mutated = true;
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

function remove(index) {
	return new ArraySetter(index, removed);
}

function insert(index, value) {
	return new ArrayInserter(index, value);
}

function concat(array) {
	return new ArrayConcatenater(array);
}

function compose(/*...*/) {
	return new Composition(Array.apply(null, arguments));
}

function applyTo(operation, value) {
	if(operation.__proto__.applyTo !== undefined)
		return operation.applyTo(value);
	return operation;
}

module.exports = { removed, patch, set, remove, insert, concat, compose, applyTo };
