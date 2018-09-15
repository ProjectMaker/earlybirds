/*
 * Primary file for the API
 *
 */

// Dependencies
const CliProduct = require('./lib/cli/cli-product')
const localStorage = require('./lib/local-storage')
const server = require('./lib/server/server')

// Declare the app
const app = {}

/**
 * Init app
 *
 * @param {function} cb
 */
app.init = (cb) => {

    // Init the server
    // server.init()

    // Init the local storage
    // localStorage.init(['products'])

    // Start the CLI, but make sure it start last

    setTimeout(() => {
        let cli = new CliProduct()
        cli.start()
        cb()
    }, 50)
}

// Self invoking only if required directly
if (require.main === module) {
    app.init(() => {})
}

// NODE_DEBUG=http node index.js
// --use_strict


// Export the app
module.exports = app
