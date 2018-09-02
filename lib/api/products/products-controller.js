/**
 * Controller for all product's routes
 */

// Instantiate the controller module
const controller = {}

/**
 * Return the products with the same colors
 *
 * @param id
 * @returns {Promise}
 */
controller.getProductsColor = ({id}) => {
    return Promise.resolve({ status: 200, payload: { id }})
}

// Export the module
module.exports = controller