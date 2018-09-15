// Dependencies
const events = require('events')
const helpers = require('../helpers')
const gcpVision = require('../gcp-vision')
const localStorage = require('../local-storage')

const CliTasks = require('./base/cli-tasks')
const Cli = require('./base/cli')

class CliTasksProduct extends CliTasks {
    constructor() {
        super({
            'import products': 'import products for given file ( absolute path )',
            'show product': 'Show a product given by id',
            'list products': 'List all products',
            'analyze products': 'Call api vision and update all products',
            'analyze product': 'Call api vision and update the given id product'
        })
    }

    subscribe() {
        super.subscribe()
        this.taskEvents.on('import products', (path) => {
            this.importProducts(path)
        })
        this.taskEvents.on('list products', () => {
            this.listProducts()
        })
        this.taskEvents.on('show product', (id) => {
            this.showProduct(id)
        })
        this.taskEvents.on('analyze products', () => {
            this.analyzeProducts()
        })
        this.taskEvents.on('analyze product', (id) => {
            this.analyzeProduct(id)
        })
    }

    /**
     * Import product catalog
     *
     * @param {string} path
     */
    importProducts(path) {
        let countProduct = 0
        helpers.readCsvFile(path)
            .then(products => {
                return products.map(product => {
                    return localStorage.create('products', product.id, product)
                        .then(() => countProduct++)
                        .catch(err => console.log('\x1b[31m%s\x1b[0m', err))
                })
            })
            .then(promises => {
                Promise.all(promises)
                    .then(() => console.log('\x1b[36m%s\x1b[0m', `Import ${countProduct} products`))
                    .catch(err => console.log(err.Error))
            })
            .catch(err => console.log('\x1b[31m%s\x1b[0m', err))
    }

    /**
     * Show product catalog
     *
     * @param {string} path
     */
    listProducts(path) {
        localStorage.list('products')
            .then(productIds => {
                Cli.verticalSpace()
                productIds.forEach(productId => {
                    localStorage.read('products', productId)
                        .then(product => {
                            console.dir(product)
                            Cli.verticalSpace()
                        })
                })
            })
            .catch(err => console.log('\x1b[31m%s\x1b[0m', err.message))
    }

    /**
     * Show a product associated with the id
     *
     * @param {string} productId
     */
    showProduct(productId) {
        productId = typeof(productId) == 'string' ? productId.trim() : false
        if (productId) {
            localStorage.read('products', productId)
                .then(data => {
                    Cli.verticalSpace()
                    console.dir(data, { colors: true })
                    Cli.verticalSpace()
                })
                .catch(err => console.log('\x1b[31m%s\x1b[0m', 'Product not found for the given id'))
        } else console.log('\x1b[31m%s\x1b[0m', 'Param productId is invalid')
    }

    /**
     * Call gcp-vision for recover dominant color for each product
     *
     */
    analyzeProducts() {
        localStorage.list('products')
            .then(productIds => {
                let promises = productIds.map(productId => {
                    return localStorage.read('products', productId)
                })
                return Promise.all(promises)
            })
            .then(products => {
                // Calls to the API are not done in parallel to not do deny service
                function callApi() {
                    while (products.length) {
                        let product = products.pop()
                        return gcpVision.getColor(`https:${product.photo}`)
                            .then(color => {
                                product.dominantColors = color
                                return localStorage.update('products', product.id, product)
                            })
                            .then(() => {
                                console.log('\x1b[36m%s\x1b[0m', `Success for ${product.id}`)
                                callApi()
                            })
                            .catch(err => {
                                console.log('\x1b[31m%s\x1b[0m', `Fail for ${product.id} ${err}`)
                                callApi()
                            })
                    }
                    console.log('\x1b[36m%s\x1b[0m', `Analyze completed`)
                }
                callApi()
            })
            .catch(err => console.log('\x1b[31m%s\x1b[0m', err.message))
    }

    /**
     * Call gcp-vision for recover dominant color for given id
     *
     * @param productId
     */
    analyzeProduct(productId) {
        productId = typeof(productId) == 'string' ? productId.trim() : false
        if (productId) {
            let product
            localStorage.read('products', productId)
                .then(_product => {
                    product = _product
                    return gcpVision.getColor(`https:${product.photo}`)
                })
                .then(color => {
                    product.dominantColors = color
                    return localStorage.update('products', productId, product)
                })
                .then(() => console.log('\x1b[36m%s\x1b[0m', `Sucess for ${productId}`))
                .catch((err) => console.log('\x1b[31m%s\x1b[0m',  `Fail for ${productId} ${err}`))
        } else console.log('\x1b[31m%s\x1b[0m', 'Param productId is invalid')
    }
}

module.exports = CliTasksProduct