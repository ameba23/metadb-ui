const axios = require('axios')

module.exports = function createRequest ({ host, port, timeout }) {
  return axios.create({
    baseURL: `${host}:${port}/`,
    timeout: timeout || 5000,
    headers: { 'Content-type': 'application/json' }
  })
}
