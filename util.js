function readableBytes (bytes) {
  if (bytes < 1) return 0 + ' B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i]
}

const S_IFMT = 61440
const S_IFDIR = 16384

function isDir (mode) {
  return (mode & S_IFMT) === S_IFDIR
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

function secondsToHms (d) {
  d = Number(d)
  const h = Math.floor(d / 3600)
  const m = Math.floor(d % 3600 / 60)
  const s = Math.floor(d % 3600 % 60)

  const hDisplay = h > 0 ? h + ' h ' : ''
  const mDisplay = (h > 0 || m > 0) ? m + ' m ' : ''
  const sDisplay = s + ' s'
  return hDisplay + mDisplay + sDisplay
}

module.exports = {
  isDir,
  readableBytes,
  formData,
  createOnSubmit,
  secondsToHms,
  IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/gif'],
  AUDIO_VIDEO_TYPES: ['audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/wav', 'video/mp4', 'video/webm']
}
