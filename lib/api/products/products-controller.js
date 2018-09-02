/**
 * Controller for all product's routes
 */

// Dependencies
const localStorage = require('../../local-storage')
const helpers = require('../../helpers')
const serviceProducts = require('../../service/products')
const config = require('../../config')

// Instantiate the controller module
const controller = {}

/**
 * Return the products with the approximate colors
 *
 * @param id
 * @returns {Promise}
 */
controller.getProductsColor = ({id}) => {
    let productColor
    console.log('id', id)
    return localStorage.read('products', id)
        .then(product => {
            const { red, green, blue } = product.dominantColors.color
            productColor = helpers.convertRgbToHex(red, green, blue)
            return localStorage.list('products')
        })
        .then(producIds => {
            let promises = producIds.map(productId => localStorage.read('products', productId))
            return Promise.all(promises)
        })
        .then(products => {
            let result = serviceProducts.compareColors(productColor, products)
            result = result
                .filter(product => product.id !== id && product.score < config.maxScoreColor)
                .sort((a,b) => a.score > b.score)
            return {status: 200, payload: result}
        })
}

// Export the module
module.exports = controller