/**
 * Router module
 *
 */

// Instanciate the router module object
const router = {}

/**
 * Return true if entity is like :id
 *
 * @param entity
 * @returns {boolean}
 */
const isParam = (entity) => {
    return entity.indexOf(':') === 0
}

/**
 * Create a regular expression to extract entitie's tree
 *
 * @param {string} uri
 * @returns {RegExp}
 */
const buildUriRegEx = (uri) => {
    let exp = ''
    const [...entities] = uri.split('/')
    entities.forEach(() => exp += '(:?[a-z]+)\\/')

    return new RegExp(`^${exp}?$`, 'g')
}
/**
 * Search route and if exists build his entities's tree
 *
 * @param {string} inputUri
 * @param {object} router
 *
 * @returns {Array}
 */
const matchRoute = (inputUri, router) => {
    const inputUriRegEx = buildUriRegEx(inputUri)
    const inputEntities = inputUri.split('/')
    // Search the matching route and built tree
    let matchingRoute = { path: '', tree: [], params: {}}
    for (let path of Object.keys(router)) {
        let execTree = inputUriRegEx.exec(path)
        if (execTree) {
            let [...entities] = execTree
            // Path of matching route
            matchingRoute.path = entities[0]
            // Built tree
            for (let idx=0; idx < entities.length; idx++) {
                // First index is the route path
                if (idx > 0) {
                    let entity = entities[idx]
                    if (!isParam(entity)) {
                        if ( entity !== inputEntities[idx-1]) {
                            return
                        }
                    } else {
                        matchingRoute.params[entity.substr(1)] = inputEntities[idx-1]
                    }
                    matchingRoute.tree.push(entities)
                }
            }

            return matchingRoute
        }
    }
}

/**
 * Return the route for the given uri
 *
 * @param {string} uri
 * @param {object} router
 *
 * @returns {object}
 */
router.getRoute = (uri, router) => {
    let route = matchRoute(uri, router)
    if (route) {
        return { path: route.path, params: route.params }
    }
}


// Export the module
module.exports = router