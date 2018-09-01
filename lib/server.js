/**
 * Server-related task
 *
 */

// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const handlers = require('./handlers')
const helpers = require('./helpers')
const util = require('util')
const debug = util.debuglog('server')

// Instantiate the server module object
const server = {}

/**
 * Define a request router
 *
 */
server.router = {
    'products/reconciliation/color': handlers.productsReconciliationColor,
}

/**
 * Instantiate the http server
 */
server.httpServer = http.createServer((req, res) => {
    // Get the url and parse it
    const parsedUrl = url.parse(req.url, true)

    // Get the path
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // Get the query string as an object
    const queryStringObject = parsedUrl.query

    // Get the http method
    const method = req.method.toLowerCase()

    // Get the headers as an object
    const headers = req.headers

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8')
    let buffer = ''
    req.on('data', (data) => {
        buffer += decoder.write(data)
    })
    req.on('end', () => {
        buffer += decoder.end()

        // Choose the handler this request should go to
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        }

        try {
            // Route the request to the handler specified in the router
            chosenHandler(data, (statusCode, payload, contentType) => {
                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType)
            })
        }
        catch (ex) {
            debug(ex)
            server.processHandlerResponse(res, method, trimmedPath, 500, { err: 'An unknown error has occured' }, 'json')
        }
    })
})

/**
 * Process the response from the handler
 *
 * @param {object} res
 * @param {string} method
 * @param {string} trimmedPath
 * @param {number} statusCode
 * @param {object} payload
 */
server.processHandlerResponse = (res, method, trimmedPath, statusCode, payload) => {
    // Determine the type of response of  (fallback to JSON)
    contentType = typeof(contentType) == 'string' ? contentType : 'json'

    // Use the status code called back by the handler, or default to 200
    statusCode = typeof(statusCode) == 'number' ? statusCode : 200

    // set content type and stringify payload
    res.setHeader('Content-Type', 'application/json')
    payload = typeof(payload) == 'object' ? payload : {}
    let payloadString = JSON.stringify(payload)


    res.writeHead(statusCode)
    res.end(payloadString)

    // If the response is 200, print greem otherwise print red
    if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()}/${trimmedPath} ${statusCode}`)
    } else {
        debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()}/${trimmedPath} ${statusCode}`)
    }
}

// Init script
server.init = () => {
    // Start the Http server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `The server listen on port ${config.httpPort} in config ${config.envName} mode`)
    })
}
module.exports = server