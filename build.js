const browserify = require('browserify')
const sheetify = require('sheetify')
const indexhtmlify = require('indexhtmlify')
const envify = require('envify/custom')

module.exports = function (options) {
  return browserify(require.resolve('./index.js'), {
    transform: [ sheetify, envify(options) ]
  }).bundle().pipe(indexhtmlify())
}
