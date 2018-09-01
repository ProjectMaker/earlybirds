/*
 * Helpers for various tasks
 *
 */

// Dependencies
const fs = require('fs')

// Instantiate the helpers module object
const helpers = {}

/**
 * Parse a csv content and and return it in json format
 *
 * @params {String} csv to parse
 *
 * @return {Array} content parsed with header's keys
 */
helpers.parseCsv = (csv) => {
    let [headers, ...products] = csv.split('\r\n')
    let parsedCsv = []
    headers = headers.split(';')
    products.forEach(productStr => {
        let product = {}
        let [...productValues] = productStr.split(';')
        // Push only if productValues is complete
        if (headers.length === productValues.length) {
            for (let idx = 0; idx < headers.length; idx++) {
                product[headers[idx]] = productValues[idx]
            }
            parsedCsv.push(product)
        }

    })
    return parsedCsv
}

/**
 * Read and parse csv file
 *
 * @params {String} path - path of the file
 *
 * @return {Promise} file parsed on json format
 */
helpers.readCsvFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (!err) {
                resolve(helpers.parseCsv(data))
            } else {
                reject('Could not find the specified file')
            }

        })
    })
}

/**
 * Parse a json string to an object
 *
 * @params {String} json
 *
 * @return {Object} json object
 */
helpers.parseJsonToObject = (json) => {
    try {
        return JSON.parse(json)
    } catch (ex) {
        return {}
    }

}

/**
 * Convert rgb to hex
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
helpers.convertRgbToHex = (r, g, b) => {
    const rgbToHex = function (rgb) {
        let hex = Number(rgb).toString(16)
        if (hex.length < 2) {
            hex = "0" + hex
        }
        return hex
    }
    return `#${rgbToHex(r)}${rgbToHex(g)}${rgbToHex(b)}`
}

// Export the module
module.exports = helpers