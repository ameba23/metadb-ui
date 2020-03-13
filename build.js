const browserify = require('browserify')
const sheetify = require('sheetify')
const indexhtmlify = require('indexhtmlify')
const fs = require('fs')

const b = browserify('./index.js', { transform: [ sheetify ] })
b.bundle().pipe(indexhtmlify()).pipe(process.stdout)
