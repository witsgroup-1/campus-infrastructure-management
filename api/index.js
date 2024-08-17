const indexRouter = require('express').Router()
console.log("api/index.js")
indexRouter.get('/', (request, response) => {
    console.log("GET /api")
    response.json({ message: 'Hello World' })
})

module.exports = indexRouter