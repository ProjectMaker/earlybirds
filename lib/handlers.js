/**
 * Request handlers
 *
 */

// Define the handlers
const handlers = {}


/**
 * Handler for product reconciliation color
 *
 * @param {object} data sent by server
 * @param cb
 */
handlers.productsReconciliationColor = (data, cb) => {
    const acceptableMethods = ['get']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers.productsReconciliationColor._methods[data.method](data, cb)
    } else {
        cb(405)
    }
}

// Container for the product reconciliation color submethods
handlers.productsReconciliationColor._methods = {}

/**
 * Method GET
 *
 * @param {object} data sent by server
 * @param cb
 */
handlers.productsReconciliationColor._methods.get = (data, cb) => {
    cb(200)
}

/**
 * Not found handler
 *
 * @param {object} data sent by server
 * @param cb
 */
handlers.notFound = (data, cb) => {
    cb(404)
}

// export the module
module.exports = handlers