const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

fs.writeFileSync(path.join(__dirname, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script
src="bundle.js?ver=${crypto.randomBytes(11).toString('hex')}"></script>
  </head>
  <body>
  </body>
</html>
`)
