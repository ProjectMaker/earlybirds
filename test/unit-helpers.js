/**
 * Unit Tests
 *
 */

// Dependencies
const assert = require('assert')
const helpers = require('./../lib/helpers')
const path = require('path')

// Holder for the tests
const unit = {}

// Assert that the readCsvFile function is returning 499 items
unit['helpers.readCsvFile should return 499 items'] = (done) => {
    let baseDir = path.join(__dirname)
    helpers.readCsvFile(`${baseDir}/.file-to-import/products.csv`)
        .then(result => {
            assert.equal(result.length, 499)
            done()
        })
        .catch((err) => {
            console.log('err', err)
            done()
        })
}

// Assert that the parseJsonToObject function is returning an object with key called name
unit['helpers.parseJsonToObject should return an object with key name'] = (done) => {
    let product = { name: 'Lacoste' }
    let productParsed = helpers.parseJsonToObject(JSON.stringify(product))
    assert.ok(productParsed.hasOwnProperty('name'))
    done()
}

// Assert that the convertRgbToHew function is returning #000000
unit['helpers.convertRgbToHex should return #000000'] = (done) => {
    assert.equal(helpers.convertRgbToHex(0,0,0), '#000000')
    done()
}
// Export the tests to the runner
module.exports = unit