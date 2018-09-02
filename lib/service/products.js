/**
 * Products service
 *
 */

// Dependencies
const colourProximity = require('colour-proximity')
const helpers = require('../helpers')

// Instanciate the products service module object
const products = {}


products.compareColors = (color, products) => {
    return products
        .map(product => {
            const { red, green, blue } = product.dominantColors.color

            return Object.assign({}, product, {score: colourProximity.proximity(color, helpers.convertRgbToHex(red, green, blue))})
        })
}

// Export the module
module.exports = products