// Dependencies
const events = require('events')
const Cli = require('./cli')

class TaskEvents extends events {}

class CliTasks {
    constructor(commands = {}) {
        this.commands = Object.assign({
            'exit': 'Kill the CLI ( and the rest of the application )',
            'man': 'Show this help page',
            'help': 'Alias of the "man" command'
        }, commands)

        this.taskEvents = new TaskEvents()
        this.subscribe()
    }

    subscribe() {
        this.taskEvents.on('help', () => {
            this.help()
        })
        this.taskEvents.on('man', () => {
            this.help()
        })
        this.taskEvents.on('exit', () => {
            process.exit(0)
        })
    }

    help() {
        // Show a header for the help page that is a wide as the screen
        Cli.horizontalLine()
        Cli.centered('CLI MANUAL')
        Cli.horizontalLine()
        Cli.verticalSpace(2)

        // Show each command, followed by its explanation, in white and yellow
        for (const commandKey in this.commands) {
            let line = '\x1b[33m' + commandKey + '\x1b[0m'
            const padding = 60 - line.length
            for (let i = 0; i < padding; i++) {
                line += ' '
            }
            line += this.commands[commandKey]
            console.log(line)
            Cli.verticalSpace()
        }

        Cli.verticalSpace(1)

        // End with an another horizontal line
        Cli.horizontalLine()
    }
}

module.exports = CliTasks