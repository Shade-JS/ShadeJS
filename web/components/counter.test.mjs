import test from 'node:test'
import assert from 'node:assert'

import Counter from './counter'

test('Counter tests', (t) => {
	test('has template function', (t) => {
		const counter = new Counter()
		assert.strictEqual(typeof counter.template, 'function')
	})
})
