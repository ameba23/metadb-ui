const axios = require('axios')

const port = 3000

module.exports = axios.create({
  baseURL: `http://localhost:${port}/`,
  timeout: 1000,
  headers: { 'Content-type': 'application/json' }
})
