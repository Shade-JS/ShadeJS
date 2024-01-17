import fs from 'node:fs'
import path from 'node:path'

const headers = {
	'.html': 'text/html',
	'.mjs': 'application/javascript',
	'.css': 'text/css',
}

const removeDoubleSlashes = (url) => url.map((url) => url.replace(/(^\/)\/+/g, '$1'))

const rewritePaths = (pathname) =>
	removeDoubleSlashes([
		`${pathname}.mjs`,
		`${pathname}/index.html`,
		`${pathname}/index.mjs`,
		`${pathname}.html`,
		`${pathname}.css`,
		`${pathname}/index.css`,
	])

const getStat = (location) => {
	let stat = false
	try {
		stat = fs.statSync(location)
	} catch (error) {
		console.warn(`WARNING: ${error.message})`)
	}

	return stat
}

const stripStartSlash = (str) => (str[0] === '/' ? str.slice(1) : str)

const rewrite = (pathname, root, extension) => {
	// console.error({pathname})
	const rewrites = extension ? removeDoubleSlashes([pathname]) : rewritePaths(pathname)

	for (const rewrite of rewrites) {
		const rewriteTarget = stripStartSlash(rewrite)
		const location = path.resolve(root, rewriteTarget)

		// console.error({root, pathname, location})

		const stat = getStat(location)
		const {ext} = path.parse(rewriteTarget, true)
		const contentType = headers[ext]

		if (stat) {
			return {
				location,
				stat,
				contentType,
			}
		}
	}

	return {stat: false}
}

export default rewrite
