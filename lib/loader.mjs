import * as url from 'url'
import path from 'path'
import fs from 'fs'

import rewrite from './rewrites.mjs'

const toFilePath = (specifier) => specifier.replace(/^file:\/\//, '')

let cwd = process.cwd()

const isWebURL = (url) => toFilePath(url).includes(`${cwd}/web`)
const isNodeURL = (url) => {
	console.log({isNodeURL: url.includes('/:node'), url})
	return url.includes('node:')
}

export async function load(url, context, defaultLoad) {
	if (isNodeURL(url)) {
		return defaultLoad(url)
	}

	const {format} = context

	let source = fs.readFileSync(toFilePath(url))

	if (isWebURL(url)) {
		const mockWeb = fs.readFileSync(path.resolve(cwd, 'lib/mock-web.mjs'))
		source = `${mockWeb};\n${source}`
	}

	return {format, source, shortCircuit: true}
}

export function resolve(specifier, context, nextResolve) {
	if (isNodeURL(specifier)) {
		console.log({isNode: specifier, val: isNodeURL(specifier)})
		return nextResolve(specifier)
	}

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
