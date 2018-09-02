/**
 * Routes defined for products api
*/

// Dependencies
const controller = require('./products-controller')

// Instantiate the products routes module object
const router = {}

/**
 * Call controller method
 *
 * @param {object} data
 * @param {function) cb
 */
const handlerProductsColor = (data, cb) => {
    if (data.method === 'get') {
        controller.getProductsColor(data.params)
            .then(({status, payload}) => cb(status, payload))
            .catch(ex => cb(500, { err: ex.message }))
    } else cb(405)
}

// Define all product's route
router.paths = {
    'products/color/:id': handlerProductsColor
}

// Export the module
module.exports = router