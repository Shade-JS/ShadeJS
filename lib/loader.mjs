import * as url from 'url'
import path from 'path'
import fs from 'fs'

import rewrite from './rewrites.mjs'

const toFilePath = (specifier) => specifier.replace(/^file:\/\//, '')

let cwd = process.cwd()

export async function load(url, context, defaultLoad) {
	const {format} = context
	const source = /* javascript */ `
		const HTMLElement = function () {};
		const window = {};
		${fs.readFileSync(toFilePath(url))}
	`
	return {format, source, shortCircuit: true}
}

export function resolve(specifier, context, nextResolve) {
	let filePath = path.relative(cwd, toFilePath(specifier))

	if (typeof context.parentURL === 'string') {
		const {dir} = path.parse(toFilePath(context.parentURL))
		const absPath = path.resolve(dir, specifier)
		filePath = path.relative(cwd, absPath)
	}

	const {ext} = path.parse(filePath)
	const file = rewrite(filePath, cwd, ext)
	const resolvedSpecifier = `file://${file.location}`

	return nextResolve(resolvedSpecifier)
}
