/*
 * Local storage
 *
 */

// Dependencies
const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

// Instanciate the CLI module object
const localStorage = {}

// Base directory of the data folder
localStorage.baseDir = path.join(__dirname, '/../.data/')

/**
 * Write data to a file
 *
 * @params {String} Entity's directory
 * @params {String} File name
 * @params {Object} Json
 *
 * @return {Promise}
 */
localStorage.create = (dir, file, data) => {
    return new Promise((resolve, reject) => {
        // open the file for writing
        fs.open(`${localStorage.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // Convert data to string
                const stringData = JSON.stringify(data)

                // Write to file and close it
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        fs.close(fileDescriptor, (err) => {
                            if (!err) {
                                resolve()
                            } else {
                                reject(new Error('Error closing new file'))
                            }
                        })
                    } else {
                        reject(new Error('Error writing to the new file'))
                    }
                })
            } else {

                reject(new Error('Could not create new file, it may already exists'))
            }
        })
    })
}

/**
 * Read data from a file
 *
 * @params {String} Entity's directory
 * @params {String} File name
 *
 * @return {Promise} json object
 */
localStorage.read = (dir, file) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${localStorage.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
            if (!err && data) {
                resolve(helpers.parseJsonToObject(data))
            } else {
                reject(err)
            }

        })
    })
}

/**
 * Update data inside a file
 *
 * @params {String} Entity's directory
 * @params {String} File name
 * @params {Object} Json
 *
 * @return {Promise}
 */
localStorage.update = (dir, file, data) => {
    return new Promise((resolve, reject) => {
        // Open the file for writing
        fs.open(`${localStorage.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // Convert data to string
                const stringData = JSON.stringify(data)

                // Truncate the file
                fs.truncate(fileDescriptor, (err) => {
                    if (!err) {
                        // Write to file and close it
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err) {
                                fs.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        resolve()
                                    } else {
                                        reject(new Error('Error closing new file'))
                                    }
                                })
                            } else {
                                reject(new Error('Error writing to the new file'))
                            }
                        })
                    } else {
                        reject(new Error('Error truncating file'))
                    }
                })
            } else {
                reject(new Error('Could not open the file for updating, it may not exist'))
            }
        })
    })

}

/**
 * Delete a file
 *
 * @params {String} Entity's directory
 * @params {String} File name
 *
 * @return {Promise}
 */
localStorage.delete = (dir, file) => {
    return new Promise((resolve, reject) => {
        // Unlink the file
        fs.unlink(`${localStorage.baseDir}${dir}/${file}.json`, (err) => {
            if (!err) {
                resolve()
            } else {
                reject(new Error('Error deleting the file'))
            }
        })
    })
}

/**
 * List all the items in a directory
 *
 * @params {String} Entity's directory
 *
 * @return {Promise} File list
 */
localStorage.list = (dir) => {
    return new Promise((resolve, reject) => {
        fs.readdir(`${localStorage.baseDir}${dir}/`, (err, data) => {
            if (!err && data && data.length > 0) {
                const trimmedFileNames = []
                data.forEach((fileName) => {
                    trimmedFileNames.push(fileName.replace('.json', ''))
                })
                resolve(trimmedFileNames)
            } else {
                reject(new Error('No products created'))
            }
        })
    })
}

/**
 * Initialize context
 *
 * @params {Array} list of entities
 */
localStorage.init = (entities) => {
    let paths = entities.map(entity => `${localStorage.baseDir}${entity}`)
    paths.unshift(localStorage.baseDir)
    paths.forEach(path => {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
    })
}

// export the module
module.exports = localStorage