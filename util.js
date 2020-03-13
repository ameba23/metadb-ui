function readableBytes (bytes) {
  if (bytes < 1) return 0 + ' B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i]
}

function formData (form) {
  const data = {}
  new FormData(form).forEach((v, k) => {
    data[k] = v
  })
  return data
}

function createOnSubmit (requestFn, route, emit, event) {
  return function onSubmit (e) {
    e.preventDefault()
    var form = e.currentTarget
    requestFn(route, formData(form))
      .then((res) => {
        emit(event, res)
      })
      .catch(console.log) // TODO
  }
}

module.exports = { readableBytes, formData, createOnSubmit }
