import test from 'ava'

// Const MyCounter = await import('./counter.mjs')
import MyCounter from './counter.mjs'

test('Has render function', (t) => {
	t.is(typeof MyCounter.render, 'function')
})
