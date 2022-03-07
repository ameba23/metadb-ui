const { ClientMessage, ServerMessage } = require('./messages')
// const Pbf = require('pbf')
// const { createError } = require('../util')
const EventEmitter = require('events')
// const { WebSocket } = require('ws')
// const ws = require('ws')


module.exports = class WsClient extends EventEmitter {
  constructor (host, port) {
    super()
    this.host = host || 'localhost'
    this.port = port || 8124
    this.client = new WebSocket(`ws://${this.host}:${this.port}`)
    this.client.binaryType = 'arraybuffer'
    // this.wsStream = createWebSocketStream(this.client)
    this.idCounter = 0
    this.requests = {}

    const self = this
    this.client.addEventListener('error', (err) => {
      self.emit('error', err)
    })
    this.client.addEventListener('message', (event) => {
      console.log(event.data)
      let message
      try {
        // message = ServerMessage.read(new Pbf(event.data))
        message = ServerMessage.decode(Buffer.from(event.data))
        console.log('ws:', message) // temp

        // if this is the final message, remove it from requests
        if (message.success && message.success.endResponse) {
          delete this.requests[message.id]
        }

        message.request = this.requests[message.id]
        self.emit('message', message)
      } catch (err) {
        console.log('Error parsing ws message', err) // TODO
      }
    })
    this._connect()
  }

  async request (reqMessage) {
    // TODO id should be a random 32 bit integer
    reqMessage.id = this.idCounter++
    // TODO add timeout
    if (!this.connected) await this._connect()
    this.client.send(ClientMessage.encode(reqMessage))
    this.requests[reqMessage.id] = reqMessage
    return reqMessage.id
  }

  async _connect () {
    const self = this
    return new Promise((resolve, reject) => {
      self.client.addEventListener('open', () => {
        self.connected = true
        resolve()
      })
    })
  }
}
