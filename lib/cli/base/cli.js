
// Dependencies
const readline = require('readline')

class Cli {
    constructor(taskEvents) {
        this.taskEvents = taskEvents
    }

    /**
     * Process the input
     *
     * @param str
     */
    processInput(str) {
        str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false
        // Only process the input if the user actually wrote something. Otherwise ignore
        if (str) {
            // Go through the possible inputs, emit an event when a match is found
            let matchFound = false
            this.taskEvents.eventNames().some((input) => {
                if (str.toLowerCase().indexOf(input) > -1) {
                    matchFound = true
                    // Emit an event matching the unique input, and include the full string given
                    this.taskEvents.emit(input, str.replace(`${input} `, ''))

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
     * Start interface
     *
     */
    start() {
        // Send start messsage, dark blue
        console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')

        // Start the interface
        const mainInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ''
        })

        // Greate a initial prompt
        mainInterface.prompt()

        // Handle each line of input separately
        mainInterface.on('line', (str) => {
            // Send to the input processor
            this.processInput(str)

            // Re-Initialize the prompt afterwards
            mainInterface.prompt()
        })

        // If the user stop the CLI, kill the associated process
        mainInterface.on('stop', () => {
            process.exit(0)
        })
    }

    /**
     * Create a vertical space
     *
     * @param lines
     */
    static verticalSpace(lines) {
        lines = typeof(lines) == 'number' && lines > 0 ? lines : 1
        for (let i = 0; i < lines; i++) {
            console.log('')
        }
    }

    /**
     * Create a horizontal line across the screen
     *
     */
    static horizontalLine() {
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
    static centered(str) {
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
}



module.exports = Cli