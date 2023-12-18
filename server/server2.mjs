
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


const removeDupeSlashes = (url) => url.map(url => url.replace(/(^\/)\/+/g, "$1"))

const relative = url => url[0] !== '/'

const rewritePaths = (pathname, context) => {
	const rewriteStack = [
		`${pathname}/index.html`,
		`${pathname}.html`,
		`${pathname}.mjs`,
		`${pathname}/index.mjs`,
		`${pathname}.css`,
		`${pathname}/index.css`,
	]

	console.log({pathname, rel:relative(pathname)})

	if (relative(pathname)) {
		const rel = path.relative(pathname, context)
		console.log({rel});
		const contextualStack = rewriteStack.forEach(pathname => `${context}${pathname}`)
		const sanitized = removeDupeSlashes(contextualStack)
		return sanitized
	}

	const sanitized = removeDupeSlashes(rewriteStack)
	return sanitized
}


const getStat = (location) => {
    let stat
    try {
        stat = fs.statSync(location)
    } catch (error) {
        // console.warn(`ERROR: ${error})`)
    }
    return stat
}

const stripStartSlash = str => str[0] === '/' ? str.slice(1) : str


const rewrite = (pathname, extension, context) => {
    // const requestPath = stripStartSlash(pathname)
    const rewrites = extension ? removeDupeSlashes([pathname]) : rewritePaths(pathname, context)

	console.log({pathname, context, extension, rewrites})

	for (const rewrite of rewrites) {
        const rewriteTarget  = stripStartSlash(rewrite)
		const location = path.resolve('./web', rewriteTarget)

		console.log({location})

        const stat = getStat(location)
        const {ext} = path.parse(rewriteTarget, true)
        const contentType = headers[ext]
		
		// console.log({location, stat, contentType})

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

	const {pathname} = url.parse(req.url)
	const {ext} = path.parse(pathname)
	
	const {referer} = req.headers 
	const context = referer ? url.parse(referer).pathname.slice(1) : '/'

	console.log({pathname, context, url: req.url, ref: req.headers.referer})

    const file = rewrite(pathname, ext, context)

    if (!file) {
        return NotFound404(req, res)
    }

    console.log(`REQUEST: ${pathname}`)
	console.log(`SERVING: ${file.location}`)
    
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
