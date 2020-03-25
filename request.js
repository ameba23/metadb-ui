const axios = require('axios')

module.exports = function createRequest ({ host, port, timeout }) {
  console.log(host, port)
  return axios.create({
    baseURL: `${host}:${port}/`,
    timeout: timeout || 1000,
    headers: { 'Content-type': 'application/json' }
  })
}
