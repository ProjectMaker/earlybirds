/*
 * Helpers for various tasks
 *
 */

// Dependencies
const fs = require('fs')


// Instantiate the helpers module object
const helpers = {}

/*
 * Parse a csv content and and return it in json format
 * @params {String} csv to parse
 *
 * @return {Array} content parsed with header's keys
 */
helpers._parseCsv = (csv) => {
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

/*
 * Read and parse csv file
 * @params {String} path - path of the file
 *
 * @return {Promise} file parsed on json format
 */
helpers.readCsvFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (!err) {
                resolve(helpers._parseCsv(data))
            } else {
                reject('Could not find the specified file')
            }

        })
    })
}
/*
 * Parse a json string to an object
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

module.exports = helpers