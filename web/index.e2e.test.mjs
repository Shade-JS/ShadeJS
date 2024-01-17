import puppeteer from 'puppeteer'
import test from 'node:test'
import assert from 'assert'

import '/server/server.mjs'

test('Index.html', async (t) => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	await page.goto('http://localhost:3000')

	await page.setViewport({width: 1080, height: 1024})

	await page.type('h1', 'Index')

	// Locate the full title with a unique string
	const textSelector = await page.waitForSelector('h1')
	const fullTitle = await textSelector?.evaluate((el) => el.textContent)

	assert.strictEqual(fullTitle, 'Index')

	await browser.close()
})
