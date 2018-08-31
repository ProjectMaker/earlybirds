/*
 * Test runner
 *
 */

// Override the NODE_ENV variable
process.env.NODE_ENV = 'testing'

// Application for the test runner
const _app = {}

// Container for the tests
_app.tests = {}

// Add on the unit tests
_app.tests['unit-helpers'] = require('./unit-helpers')

/**
 * Count all the tests
 *
 * @returns {number}
 */
_app.countTests = () => {
    let counter = 0
    for (const key in _app.tests) {
        const subTests = _app.tests[key]
        for (const testName in subTests) {
            if (subTests.hasOwnProperty(testName)) {
                counter++
            }
        }
    }

    return counter
}

/**
 * Run all the tests, collecting the errors and successes
 *
 */
_app.runTests = () => {
    const errors = []
    let successes = 0
    const limit = _app.countTests()
    let counter = 0
    for (const key in _app.tests) {
        const subTests = _app.tests[key]
        for (const testName in subTests) {
            (() => {
                // Call the test
                try {
                    subTests[testName](() => {
                        // If it call backs without throwing, then it succeeded, so log it in green
                        console.log('\x1b[32m%s\x1b[0m', testName)
                        counter++
                        successes++
                        if (counter == limit) {
                            _app.produceTestReport(limit, successes, errors)
                        }
                    })
                } catch (ex) {
                    // If it throws, then it failed, so capture the error thrown and log it in red
                    errors.push({
                        name: testName,
                        error: ex
                    })
                    console.log('\x1b[31m%s\x1b[0m', testName)
                    counter++
                    if (counter == limit) {
                        _app.produceTestReport(limit, successes, errors)
                    }
                }
            })()
        }
    }
}

//
/**
 * Produce a test outcome report
 *
 * @param {number} limit
 * @param {Array} sucesses
 * @param {Array} errors
 */
_app.produceTestReport = (limit, sucesses, errors) => {
    console.log('')
    console.log('------------ BEGIN TEST REPORT ------------')
    console.log('')
    console.log('Total tests : ', limit)
    console.log('Pass : ', sucesses)
    console.log('Fail : ', errors.length)
    console.log('')

    // If they are errors, print them in detail
    if (errors.length > 0) {
        console.log('------------ BEGIN ERRORS DETAILS ------------')
        console.log('')
        errors.forEach(err => {
            console.log('\x1b[31m%s\x1b[0m', err.name)
            console.log(err.error)
        })
        console.log('')
        console.log('------------ END ERRORS DETAILS ------------')
    }

    console.log('')
    console.log('------------ END TEST REPORT ------------')
    process.exit(0)
}

_app.runTests()