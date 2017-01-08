QUnit.test("getOptions", function(assert) {
    assert.equal(slider.getOption('numCards'), 3);
    assert.equal(slider.getOption('dataUrl'), 'http://dummy-api.alima.pt/cards');
    assert.equal(slider.getOption('lazyLoad'), true);
    assert.equal(slider.getOption('randomOption'), null);
});
QUnit.test("isInArray", function(assert) {
    assert.equal(slider.isInArray('abc', ['a', 'c', 'abc']), true);
    assert.equal(slider.isInArray('imNotInArray', ['a', 'c', 'abc']), false);
});
QUnit.test("extend", function(assert) {
    assert.deepEqual(slider.extend({a: 'hello', b: 'world'}, {b: 'jscardslider'}), {a: 'hello', b: 'jscardslider'});
    assert.deepEqual(slider.extend({a: 'I am'}, {b: 'André'}), {a: 'I am', b: 'André'});
});
