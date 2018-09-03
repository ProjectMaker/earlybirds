/**
 * CLI-related tasks
 *
 */

// Dependencies
const readline = require('readline')
const events = require('events')
const helpers = require('./helpers')
const gcpVision = require('./gcp-vision')
const localStorage = require('./local-storage')
class TaskEvents extends events {}

// Instanciate the CLI module object
const cli = {}

/**
 * Create a vertical space
 *
 * @param lines
 */
cli.verticalSpace = (lines) => {
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1
    for (let i = 0; i < lines; i++) {
        console.log('')
    }
}

/**
 * Create a horizontal line across the screen
 *
 */
cli.horizontalLine = () => {
    // Get the available screen size
    const width = process.stdout.columns

    let line = ''
    for (let i = 0; i < width; i++) {
        line += '-'
    }
    console.log(line)
}

/**
 * Create centered text on the screen
 *
 * @param str
 */
cli.centered = (str) => {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : ''

    // Get the available screen size
    const width = process.stdout.columns

    // Calculate the left padding their should be
    const leftPadding = Math.floor((width - str.length) / 2)

    let line = ''
    for (let i = 0; i < leftPadding; i++) {
        line += ' '
    }
    line += str
    console.log(line)
}

let taskEvents = new TaskEvents()

// Input handlers
taskEvents.on('man', () => {
    cli.responders.help()
})
taskEvents.on('help', () => {
    cli.responders.help()
})
taskEvents.on('exit', () => {
    cli.responders.exit()
})
taskEvents.on('import products', (path) => {
    cli.responders.importProducts(path)
})
taskEvents.on('list products', () => {
    cli.responders.listProducts()
})
taskEvents.on('show product', (id) => {
    cli.responders.showProduct(id)
})
taskEvents.on('analyze products', () => {
    cli.responders.analyzeProducts()
})
taskEvents.on('analyze product', (id) => {
    cli.responders.analyzeProduct(id)
})

// Responders object
cli.responders = {}

/**
 * Help / Man
 *
 */
cli.responders.help = () => {
    const commands = {
        'exit': 'Kill the CLI ( and the rest of the application )',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'import products': 'import products for given file ( absolute path )',
        'show product': 'Show a product given by id',
        'list products': 'List all products',
        'analyze products': 'Call api vision and update all products',
        'analyze product': 'Call api vision and update the given id product',

    }

    // Show a header for the help page that is a wide as the screen
    cli.horizontalLine()
    cli.centered('CLI MANUAL')
    cli.horizontalLine()
    cli.verticalSpace(2)

    // Show each command, followed by its explanation, in white and yellow
    for (const commandKey in commands) {
        let line = '\x1b[33m' + commandKey + '\x1b[0m'
        const padding = 60 - line.length
        for (let i = 0; i < padding; i++) {
            line += ' '
        }
        line += commands[commandKey]
        console.log(line)
        cli.verticalSpace()
    }

    cli.verticalSpace(1)

    // End with an another horizontal line
    cli.horizontalLine()
}

/**
 * Exit cli
 *
 */
cli.responders.exit = () => {
    process.exit(0)
}

/**
 * Import catalog product
 *
 * @param {String} path file
 */
cli.responders.importProducts = (path) => {
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
 * Show all products
 *
 */
cli.responders.listProducts = () => {
    localStorage.list('products')
        .then(productIds => {
            cli.verticalSpace()
            productIds.forEach(productId => {
                localStorage.read('products', productId)
                    .then(product => {
                        console.dir(product)
                        cli.verticalSpace()
                    })
            })
        })
        .catch(err => console.log('\x1b[31m%s\x1b[0m', err.message))
}

/**
 * Show a product associated with the id
 *
 * @param {String} productId
 */
cli.responders.showProduct = (productId) => {
    productId = typeof(productId) == 'string' ? productId.trim() : false

    if (productId) {
        localStorage.read('products', productId)
            .then(data => {
                cli.verticalSpace()
                console.dir(data, { colors: true })
                cli.verticalSpace()
            })
            .catch(err => console.log('\x1b[31m%s\x1b[0m', 'Product not found for the given id'))
    } else console.log('\x1b[31m%s\x1b[0m', 'Param productId is invalid')
}

cli.responders.analyzeProducts = () => {
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

cli.responders.analyzeProduct = (productId) => {
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

/**
 * Input processor
 *
 * @param str
 */
cli.processInput = (str) => {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
    // Only process the input if the user actually wrote something. Otherwise ignore
    if (str) {
        // Codify the unique strings that identify the unique questions allowed
        const uniqueInputs = [
            'exit',
            'man',
            'help',
            'import products',
            'show product',
            'list products',
            'analyze products',
            'analyze product'
        ]

        // Go through the possible inputs, emit an event when a match is found
        let matchFound = false
        uniqueInputs.some((input) => {
            if (str.toLowerCase().indexOf(input) > -1) {
            matchFound = true
            // Emit an event matching the unique input, and include the full string given
            taskEvents.emit(input, str.replace(`${input} `, ''))

            return true
        }
    })

        // If no match is found, tell the user try again
        if (!matchFound) {
            console.log("Sorry, try again")
        }
    }
}

/**
 * Init the cli
 *
 */
cli.init = () => {
    // Send start messsage, dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')

    // Start the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    })

    // Greate a initial prompt
    _interface.prompt()

    // Handle each line of input separately
    _interface.on('line', (str) => {
        // Send to the input processor
        cli.processInput(str)

        // Re-Initialize the prompt afterwards
        _interface.prompt()
    })

    // If the user stop the CLI, kill the associated process
    _interface.on('stop', () => {
        process.exit(0)
    })
}

// Export the module
module.exports = cli
