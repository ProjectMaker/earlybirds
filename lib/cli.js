/*
 * CLI-related tasks
 *
 */

// Dependencies
const readline = require('readline')
const events = require('events')

class TaskEvents extends events {}

// Instanciate the CLI module object
const cli = {}

// Create a vertical space
cli.verticalSpace = (lines) => {
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1
    for (let i = 0; i < lines; i++) {
        console.log('')
    }
}

// Create a horizontal line across the screen
cli.horizontalLine = () => {
    // Get the available screen size
    const width = process.stdout.columns

    let line = ''
    for (let i = 0; i < width; i++) {
        line += '-'
    }
    console.log(line)
}

// Create centered text on the screen
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
taskEvents.on('man', (str) => {
    cli.responders.help()
})
taskEvents.on('help', (str) => {
    cli.responders.help()
})
taskEvents.on('exit', (str) => {
    cli.responders.exit()
})
taskEvents.on('import', (str) => {
    cli.responders.import()
})
taskEvents.on('analyze', (str) => {
    cli.responders.analyze()
})


// Responders object
cli.responders = {}

// Help / Man
cli.responders.help = (str) => {
    const commands = {
        'exit': 'Kill the CLI ( and the rest of the application )',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'import': 'Get statistics on the underlying operating system and resource utilization',
        'analyse': 'Show a list of all registered users in the system'
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

// Exit
cli.responders.exit = (str) => {
    process.exit(0)
}

// Analyze product's color
cli.responders.analyze = () => {
    console.log('analyze coming soon')
}

// Import catalog product
cli.responders.import = () => {
    console.log('import coming soon')
}


// Input processor
cli.processInput = (str) => {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
    // Only process the input if the user actually wrote something. Otherwise ignore
    if (str) {
        // Codify the unique strings that identify the unique questions allowed
        const uniqueInputs = [
            'man',
            'help',
            'import',
            'analyze'
        ]

        // Go through the possible inputs, emit an event when a match is found
        let matchFound = false
        uniqueInputs.some((input) => {
            if (str.toLowerCase().indexOf(input) > -1) {
            matchFound = true
            // Emit an event matching the unique input, and include the full string given
            taskEvents.emit(input, str)

            return true
        }
    })

        // If no match is found, tell the user try again
        if (!matchFound) {
            console.log("Sorry, try again")
        }
    }
}

// Init script
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


// 5846239H
