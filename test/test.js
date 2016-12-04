let assert = require('assert');
let m = require('..');

function testOperation(operation, initialState, expectedState) {
	var backup = JSON.stringify(initialState);
	assert.deepEqual(operation.applyTo(initialState), expectedState);
	assert.deepEqual(initialState, JSON.parse(backup));
}

describe('patch()', function() {
	it('must add new member', function() {
		testOperation(m.patch({a: 1}), {b: 2}, {a: 1, b: 2});
	});
	
	it('must update existing member', function() {
		testOperation(m.patch({a: 1}), {a: 0, b: 2}, {a: 1, b: 2});
	});
	
	it('must recursively update member', function() {
		testOperation(m.patch({a: m.patch({b: 0})}), {a: {b: 2}}, {a: {b: 0}});
	});
	
	it('must suppress existing member', function() {
		testOperation(m.patch({a: m.removed}), {a: 0, b: 2}, {b: 2});
	});
});

describe('set()', function() {
	it('must update existing element', function() {
		testOperation(m.set(1, 0), [1,2,3], [1,0,3]);
	});
	
	it('must recursively update existing element', function() {
		testOperation(m.set(1, m.patch({a: 0})), [1,{a:1,b:2},3], [1,{a:0,b:2},3]);
	});
	
	it('must grow array', function() {
		testOperation(m.set(0, 0), [], [0]);
	});
});

describe('remove()', function() {
	it('must remove element at the middle', function() {
		testOperation(m.remove(1), [1,2,3], [1,3]);
	});

	it('must remove first element', function() {
		testOperation(m.remove(0), [1,2,3], [2,3]);
	});

	it('must remove last element', function() {
		testOperation(m.remove(2), [1,2,3], [1,2]);
	});
});

describe('insert()', function() {
	it('must insert at the middle', function() {
		testOperation(m.insert(1, 0), [1,2,3], [1,0,2,3]);
	});

	it('must insert at the beginning', function() {
		testOperation(m.insert(0, 0), [1,2,3], [0,1,2,3]);
	});

	it('must insert at the end', function() {
		testOperation(m.insert(3, 0), [1,2,3], [1,2,3,0]);
	});
});

describe('concat()', function() {
	it('must concatenate new elements at the end', function() {
		testOperation(m.concat([4,5,6]), [1,2,3], [1,2,3,4,5,6]);
	});
});

describe('compose()', function() {
	it('must compose two operations in the right order', function() {
		testOperation(m.compose(m.insert(0, 4), m.set(1, 5)), [1,2,3], [4,5,2,3]);
	});
});
