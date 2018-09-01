/*
 * Helpers for various tasks
 *
 */

// Dependencies
const fs = require('fs')
const Buffer = require('buffer').Buffer
const https = require('https')
const url = require('url')

const config = require('./config')

// Instantiate the helpers module object
const helpers = {}

/**
 * Parse a csv content and and return it in json format
 *
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
                resolve(helpers._parseCsv(data))
            } else {
                reject('Could not find the specified file')
            }

        })
    })
}
/**
 *
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

/**
 * Call vision api vision color (private)
 *
 * @param {String} url
 * @returns {Object}
 */
helpers._callVisionApiColor = (imageUrl, resolve, reject) => {
    // Content expected by the API
    const body = {
        requests:[{
            image: {
                source: {
                    imageUri: imageUrl
                }
            },
            features:[
                {
                    type:"IMAGE_PROPERTIES",
                    maxResults:1
                }
            ]
        }]
    }


    // Parse the hostname and the path out of the original check data
    const urlApi = `${config.vision.url}${config.vision.key}`
    const parsedUrl = url.parse(urlApi, true)
    const hostname = parsedUrl.hostname
    const path = parsedUrl.path

    // Construct the request
    const requestDetails = {
        protocol: 'https:',
        hostname,
        method: 'POST',
        path,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(body))
        }
    }

    let responseApi = ''
    // Instanciate the request object
    const req = https.request(requestDetails, (res) => {
        res.on('data', (chunk) => {
            responseApi += chunk
        })

        res.on('end', () => {
            responseApi = helpers.parseJsonToObject(responseApi)
            // responseApi.responses[0] correspond of vision api spec
            // if not, parsing raise an error
            try {
                if (responseApi.responses[0].error) {
                    throw new Error(responseApi.responses[0].error.message)
                }
                let color = responseApi.responses[0].imagePropertiesAnnotation.dominantColors.colors[0]
                resolve(color)
            } catch (ex) {
                reject(ex)
            }

        })
    })

    // Bind to the error event so it get thrown
    req.on('error', (err) => {
        reject(err)
    })


    // End the request
    req.write(JSON.stringify(body))
    req.end()
}

/**
 * Wrapper for _callVisionApiColor
 *
 * @param imageUrl
 *
 * @returns {Promise<object>}
 */
helpers.callVisionApiColor = (imageUrl) => {
    return new Promise((resolve, reject) => {
        if (!process.env.VISION_API_KEY) {
            reject(new Error('You must declare VISION_API_KEY like an environment variable'))
        }

        helpers._callVisionApiColor(imageUrl, resolve, reject)
    })
}

// Export the module
module.exports = helpers