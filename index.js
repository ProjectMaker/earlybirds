/*
 * Primary file for the API
 *
 */

// Dependencies
const cli = require('./lib/cli')

// Declare the app
const app = {}

// Init function
app.init = (cb) => {
    setTimeout(() => {
        cli.init()
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
