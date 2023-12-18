
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

const rewritePaths = (path) => [
	`${path}/index.html`,
	`${path}.html`,
	`${path}.mjs`,
	`${path}/index.mjs`,
	`${path}.css`,
	`${path}/index.css`,
]

const getStat = (location) => {
    let stat
    try {
        stat = fs.statSync(location)
    } catch (error) {
        console.warn('ERROR: ' + error.messgae)
    }
    return stat
}

const stripStartSlash = str => str[0] === '/' ? str.slice(1) : str

const rewrite = (pathname, extension) => {
    const requestPath = stripStartSlash(pathname)
    const rewrites = extension ? [requestPath] : rewritePaths(requestPath)

	for (const rewrite of rewrites) {
        const rewriteTarget  = stripStartSlash(rewrite)
		const location = path.resolve('./web', rewriteTarget)
        const stat = getStat(location)
        const {ext} = path.parse(rewriteTarget, true)
        const contentType = headers[ext]

		if (stat) {
            return {location, stat, contentType}
		}
	}
}

const NotFound404 = (req, res) => {
	res.writeHead(404, {'Content-Type': 'text/plain'})
    res.write('404 Not Found')
	console.error(`404: ${req.url}`)
	res.end()
}

const CouldNotStream = (req, res) => {
    res.writeHead(500, {'Content-Type': 'text/plain'})
    console.error(`505: ${req.url}`)
    res.write('500 Internal Server Error')
    res.end()
    }

const requestHandler = (req, res) => {
	const {pathname, ext} = url.parse(req.url)

    const file = rewrite(pathname, ext)

    if (!file) {
        return NotFound404(req, res)
    }

    console.log(`REQUEST: ${pathname}`)
	console.log(`SERVING: ${pathname}`)
    
	res.writeHead(200, {
		'Content-Type': file.contentType,
		'Content-Length': file.stat.size,
		'Cache-Control': 'no-store',
		Pragma: 'no-cache',
		'Content-Security-Policy': `default-src 'self' http://localhost:${PORT} ;`,
	})

	const readStream = fs.createReadStream(file.location)
	readStream.pipe(res).on('error', () => CouldNotStream(res, req))
	return
}

http.createServer(requestHandler).listen(PORT)
console.log(`Running HTTP server at: ${BASE_URL}:${PORT}`)
