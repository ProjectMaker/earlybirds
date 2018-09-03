/**
 * Products service
 *
 */

// Dependencies
const colourProximity = require('colour-proximity')
const helpers = require('../helpers')

// Instanciate the products service module object
const products = {}

/**
 * Compare product color for a giver color
 *  ( add a score for each products )
 *
 * @param color
 * @param products
 * @returns {Array} products with the score
 */
products.compareColors = (color, products) => {
    return products
        .filter(product => {
            return product.hasOwnProperty('dominantColors')
        })
        .map(product => {
            const { red, green, blue } = product.dominantColors.color

            return Object.assign({}, product, {score: colourProximity.proximity(color, helpers.convertRgbToHex(red, green, blue))})
        })
}

// Export the module
module.exports = products