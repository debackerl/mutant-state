let assert = require('assert');
let m = require('..');

function testOperation(operation, initialState, expectedState) {
	var backup = JSON.stringify(initialState);
	assert.deepEqual(m.applyTo(operation, initialState), expectedState);
	assert.deepEqual(initialState, JSON.parse(backup));
}

function testReplace(newState, initialState, areEqual) {
	var res = m.applyTo(m.replace(newState), initialState);
	if(areEqual)
		assert.equal(res, initialState);
	else
		assert.equal(res, newState);
}

describe('applyTo()', function() {
	it('must copy constant', function() {
		testOperation(123, "abc", 123);
	});
});

describe('replace()', function() {
	it('must replace object with array', function() {
		testReplace([], {}, false);
	});

	it('must replace array with object', function() {
		testReplace({}, [], false);
	});

	it('must keep empty array', function() {
		testReplace([], [], true);
	});

	it('must keep empty object', function() {
		testReplace({}, {}, true);
	});

	it('must keep array', function() {
		testReplace([1,2], [1,2], true);
	});

	it('must keep object', function() {
		testReplace({a:1,b:2}, {a:1,b:2}, true);
	});

	it('must replace array', function() {
		testReplace([1], [1,2], false);
	});

	it('must replace object', function() {
		testReplace({a:1}, {a:1,b:2}, false);
	});

	it('must return new date', function() {
		testReplace(new Date(), {}, false);
	});

	it('must return new boolean', function() {
		testReplace(true, {}, false);
	});

	it('must return new number', function() {
		testReplace(4, {}, false);
	});
});

describe('patch()', function() {
	it('must create new object', function() {
		testOperation(m.patch({}), null, {});
	});

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
	it('must create new array', function() {
		testOperation(m.set(0, 8), null, [8]);
	});
	
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

describe('removeAt()', function() {
	it('must create a new array', function() {
		testOperation(m.removeAt(0), null, []);
	});

	it('must remove element at the middle', function() {
		testOperation(m.removeAt(1), [1,2,3], [1,3]);
	});

	it('must remove first element', function() {
		testOperation(m.removeAt(0), [1,2,3], [2,3]);
	});

	it('must remove last element', function() {
		testOperation(m.removeAt(2), [1,2,3], [1,2]);
	});
});

describe('remove()', function() {
	it('must remove element at the middle', function() {
		testOperation(m.remove(2), [1,2,3], [1,3]);
	});

	it('must remove first element', function() {
		testOperation(m.remove(1), [1,2,3], [2,3]);
	});

	it('must remove last element', function() {
		testOperation(m.remove(3), [1,2,3], [1,2]);
	});

	it('must remove two elements', function() {
		testOperation(m.remove(2), [1,2,3,2], [1,3]);
	});
});

describe('insert()', function() {
	it('must create new array', function() {
		testOperation(m.insert(0, 8), null, [8]);
	});

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
	it('must create new array', function() {
		testOperation(m.concat([1,2,3]), null, [1,2,3]);
	});

	it('must concatenate new elements at the end', function() {
		testOperation(m.concat([4,5,6]), [1,2,3], [1,2,3,4,5,6]);
	});
});

describe('push()', function() {
	it('must create new array', function() {
		testOperation(m.push(1), null, [1]);
	});

	it('must concatenate new value at the end', function() {
		testOperation(m.push(4), [1,2,3], [1,2,3,4]);
	});
});

describe('compose()', function() {
	it('must compose two operations in the right order', function() {
		testOperation(m.compose(m.insert(0, 4), m.set(1, 5)), [1,2,3], [4,5,2,3]);
	});
});
