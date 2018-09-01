/**
 * Create and export configugration variables
 *
 */

// Container for all environments
const environments = {}

// Dev ( default ) environment
environments.dev = {
    vision: {
        url: 'https://vision.googleapis.com/v1/images:annotate?key=',
        key: process.env.VISION_API_KEY
    }
}

// AIzaSyBCX0YUeuWx2sW2kXroidPSXydE1CJkeyk

// Testing environment
environments.testing = {
    vision: {
        url: 'https://vision.googleapis.com/v1/images:annotate?key=',
        key: 'AIzaSyBCX0YUeuWx2sW2kXroidPSXydE1CJkeyk'
    }
}

// Production environment
environments.production = {
    vision: {
        url: 'https://vision.googleapis.com/v1/images:annotate?key=',
        key: 'AIzaSyBCX0YUeuWx2sW2kXroidPSXydE1CJkeyk'
    }
}

// Determiner which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.dev

// Export the module
module.exports = environmentToExport