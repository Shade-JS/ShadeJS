import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const BASE_URL = 'localhost'
const PORT = 3000
const WEB_DIR = './web'

const headers = {
	'.html': 'text/html',
	'.mjs': 'application/javascript',
	'.css': 'text/css',
}

const removeDoubleSlashes = (url) => url.map((url) => url.replace(/(^\/)\/+/g, '$1'))

const rewritePaths = (pathname) =>
	removeDoubleSlashes([
		`${pathname}/index.html`,
		`${pathname}.html`,
		`${pathname}.mjs`,
		`${pathname}/index.mjs`,
		`${pathname}.css`,
		`${pathname}/index.css`,
	])

const getStat = (location) => {
	let stat
	try {
		stat = fs.statSync(location)
	} catch (error) {
		console.warn(`ERROR: ${error})`)
	}

	return stat
}

const stripStartSlash = (str) => (str[0] === '/' ? str.slice(1) : str)

const rewrite = (pathname, extension) => {
	const rewrites = extension ? removeDoubleSlashes([pathname]) : rewritePaths(pathname)

	for (const rewrite of rewrites) {
		const rewriteTarget = stripStartSlash(rewrite)
		const location = path.resolve('./web', rewriteTarget)

		const stat = getStat(location)
		const { ext } = path.parse(rewriteTarget, true)
		const contentType = headers[ext]

		if (stat) {
			return {
				location,
				stat,
				contentType,
			}
		}
	}
}

const notFound404 = (req, res) => {
	res.writeHead(404, {
		'Content-Type': 'text/plain',
	})
	res.write('404 Not Found')
	console.error(`404: ${req.url}`)
	res.end()
}

const couldNotStream500 = (req, res) => {
	res.writeHead(500, {
		'Content-Type': 'text/plain',
	})
	console.error(`505: ${req.url}`)
	res.write('500 Internal Server Error')
	res.end()
}

const movedPermanently301 = (res, location) => {
	res.writeHead(301, {
		Location: `http://localhost:${PORT}/${location}`,
	})
	res.write('301 Moved Permanently')
	res.end()
}

const hasNoEndSlash = (url) => url.slice(-1) !== '/'

const wasRewritten = (url, location) => url.slice(1) !== path.relative(WEB_DIR, location)

const requestHandler = (req, res) => {
	console.log(`REQUEST: ${req.url}`)

	const { pathname } = url.parse(req.url)
	const { ext } = path.parse(pathname)

	const file = rewrite(pathname, ext)

	if (!file) {
		return notFound404(req, res)
	}

	if (hasNoEndSlash(pathname) && wasRewritten(pathname, file.location)) {
		const relativeLocation = path.relative(WEB_DIR, file.location)
		return movedPermanently301(res, relativeLocation)
	}

	console.log(`SERVING: ./${path.relative(path.resolve(WEB_DIR, '../'), file.location)}`)

	res.writeHead(200, {
		'Content-Type': file.contentType,
		'Content-Length': file.stat.size,
		'Cache-Control': 'no-store',
		Pragma: 'no-cache',
		'Content-Security-Policy': `default-src 'self' http://localhost:${PORT} ;`,
	})

	const readStream = fs.createReadStream(file.location)
	readStream.pipe(res).on('error', () => couldNotStream500(res, req))
}

http.createServer(requestHandler).listen(PORT)
console.log(`Running HTTP server at: ${BASE_URL}:${PORT}`)
