const Cli = require('./base/cli')
const CliTasksProduct = require('./cli-tasks-product')

class CliProduct extends Cli {
    constructor() {
        super(new CliTasksProduct().taskEvents)
    }
}

module.exports = CliProduct