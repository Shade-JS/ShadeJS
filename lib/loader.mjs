import * as url from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

import rewrite from './rewrites.mjs'

const cwd = process.cwd()

const toFilePath = (specifier) => specifier.replace(/^file:\/\//, '')
const isWebURL = (url) => toFilePath(url).includes(`${cwd}/web`)
// const isNodeURL = (url) => url.slice(0, 5) === 'node:' || !url.slice(0, 1) === '/' ||
const isNodeURL = (url) => url.slice(0, 5) === 'node:' || url.includes('node_modules/')

export async function load(url, context, defaultLoad) {
	// console.error({url})

	if (isNodeURL(url)) {
		return defaultLoad(url)
	}

	const {format} = context

	let source = fs.readFileSync(toFilePath(url))

	if (isWebURL(url)) {
		const mockWeb = fs.readFileSync(path.resolve(cwd, 'lib/mock/web.mjs'))
		source = `${mockWeb};\n${source}`
	}

	return {format, source, shortCircuit: true}
}

const isAbsolute = (specifier) => specifier.slice(0, 1) === '/'

// check is node modules

const isNodeModule = (url) => url.includes('node_modules/')

export async function resolve(specifier, context, nextResolve) {
	// console.error({specifier}, '.')
	const originalSpecifier = specifier

	if (isNodeURL(specifier)) {
		return nextResolve(specifier)
	}

	if (typeof context.parentURL === 'string' && isNodeModule(context.parentURL)) {
		return nextResolve(specifier)
	}

	const absolute = isAbsolute(specifier)
	if (isAbsolute(specifier)) {
		specifier = specifier.slice(1)
	}

	let filePath = path.relative(cwd, toFilePath(specifier))

	if (typeof context.parentURL === 'string' && !absolute) {
		const {dir} = path.parse(toFilePath(context.parentURL))
		const absPath = path.resolve(dir, specifier)
		filePath = path.relative(cwd, absPath)
	}

	const {ext} = path.parse(filePath)
	const file = rewrite(filePath, cwd, ext)

	if (file.stat === false) {
		return nextResolve(originalSpecifier)
	}

	const resolvedSpecifier = `file://${file.location}`

	return nextResolve(resolvedSpecifier)
}
