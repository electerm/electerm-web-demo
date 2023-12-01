import { WebSocket, Server } from 'mock-socket'

window.WebSocket = WebSocket

const mockServer = new Server('ws://localhost:8080', { mock: false })

mockServer.on('connection', socket => {
  socket.on('message', () => {
    // how to get request path
  })
  socket.on('close', () => {})
  socket.on('error', () => {})
})
