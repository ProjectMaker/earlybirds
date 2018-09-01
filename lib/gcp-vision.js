/**
 * Google Cloud Platform - API wrapper
 *
 */

// Dependencies
const Buffer = require('buffer').Buffer
const https = require('https')
const url = require('url')
const helpers = require('./helpers')
const config = require('./config')

// Instantiate the gcpVsion module object
const gcpVision = {}

/**
 * Call vision api vision color (private)
 *
 * @param {String} url
 * @returns {Object}
 */
gcpVision._callApi = (contentApi, resolve, reject) => {
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
            'Content-Length': Buffer.byteLength(JSON.stringify(contentApi))
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
            // responseApi.responses[0] correspond of api spec
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
    req.write(JSON.stringify(contentApi))
    req.end()
}

/**
 * Wrapper for _callApi
 *
 * @param imageUrl
 *
 * @returns {Promise<object>}
 */
gcpVision.getColor = (imageUrl) => {
    return new Promise((resolve, reject) => {
        if (!process.env.VISION_API_KEY) {
            reject(new Error('You must declare VISION_API_KEY like an environment variable'))
        }
        // Content expected by the API
        let contentApi = {
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

        gcpVision._callApi(contentApi, resolve, reject)
    })
}

// Export the module
module.exports = gcpVision
