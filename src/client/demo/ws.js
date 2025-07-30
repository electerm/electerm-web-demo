// A fake WebSocket class
import { extractInfoFromURL } from './ws-handler'
import handler from '../app/server/dispatch-center.js'
export class FakeWs {
  static OPEN = 1
  // A constructor that takes a URL as an argument
  constructor (url) {
    // Set the url property
    this.url = url
    this.opts = extractInfoFromURL(url)
    // Set the readyState property to 0 (CONNECTING)
    this.readyState = 0
    // Set the onopen, onclose, and onmessage properties to null
    this.onopen = null
    this.onclose = null
    // Create an empty object to store the event listeners
    this.listeners = {}
    // Simulate the connection process
    setTimeout(() => {
      // Set the readyState property to 1 (OPEN)
      this.readyState = 1
      // Create a fake event object
      const event = {
        type: 'open',
        target: this
      }
      // Call the onopen method if it is a function
      if (typeof this.onopen === 'function') {
        this.onopen(event)
      }
      // Call the event listeners for the open event if they exist
      if (this.listeners.open) {
        for (const listener of this.listeners.open) {
          listener(event)
        }
      }
      if (this.url.includes('/terminals/')) {
        this.init()
      }
    }, 1) // Wait for 1 second
  }

  init () {
    this.sendToTerminal(
      '\r\n🚀 Welcome to Electerm Demo Terminal! 🚀\r\n'
    )
    this.sendToTerminal(
      '\r\n📖 About Electerm:\r\n'
    )
    this.sendToTerminal(
      '   A modern, open-sourced terminal/ssh/sftp/ftp/telnet/serialport/RDP/VNC client(linux, mac, win)\r\n'
    )
    this.sendToTerminal(
      '\r\n🔗 Links:\r\n'
    )
    this.sendToTerminal(
      '   • GitHub: https://github.com/electerm/electerm\r\n'
    )
    this.sendToTerminal(
      '   • Website: https://electerm.html5beta.com\r\n'
    )
    this.sendToTerminal(
      '\r\n💡 Demo Commands:\r\n'
    )
    this.sendToTerminal(
      '   • Type "ls" to list files\r\n'
    )
    this.sendToTerminal(
      '   • This is a limited demo - download the full version for complete features!\r\n'
    )
    this.sendToTerminal(
      '\r\n────────────────────────────────────────────────────────────────\r\n'
    )
    this.sendToTerminal(
      '\r\nelecterm demo terminal $ '
    )
  }

  // Method to send messages directly to terminal without triggering command processing
  sendToTerminal (data) {
    if (this.readyState === 1) {
      setTimeout(() => {
        const event = {
          type: 'message',
          data,
          target: this
        }
        // Only call event listeners (for terminal display), not onmessage (for command processing)
        if (this.listeners.message) {
          for (const listener of this.listeners.message) {
            listener(event)
          }
        }
      }, 1)
    }
  }

  onmessage (e) {
    handler(this, e.data)
  }

  on (...args) {
    this.addEventListener(...args)
  }

  // A method to add an event listener
  addEventListener (type, listener) {
    // Check if the type is a valid event type
    if (type === 'open' || type === 'close' || type === 'message') {
      // Check if the listener is a function
      if (typeof listener === 'function') {
        // Check if the listeners object has an array for the type
        if (!this.listeners[type]) {
          // Create an empty array for the type
          this.listeners[type] = []
        }
        // Push the listener to the array
        this.listeners[type].push(listener)
      }
    }
  }

  // A method to remove an event listener
  removeEventListener (type, listener) {
    // Check if the type is a valid event type
    if (type === 'open' || type === 'close' || type === 'message') {
      // Check if the listener is a function
      if (typeof listener === 'function') {
        // Check if the listeners object has an array for the type
        if (this.listeners[type]) {
          // Find the index of the listener in the array
          const index = this.listeners[type].indexOf(listener)
          // Check if the index is valid
          if (index !== -1) {
            // Remove the listener from the array
            this.listeners[type].splice(index, 1)
          }
        }
      }
    }
  }

  // A method to send a message
  send (data, notify) {
    // Check if the readyState is 1 (OPEN)
    if (this.readyState === 1) {
      // Simulate the sending process
      setTimeout(() => {
        // Create a fake event object
        const event = {
          type: 'message',
          data,
          target: this
        }
        // Call the onmessage method if it is a function
        if (notify !== false && typeof this.onmessage === 'function') {
          this.onmessage(event)
        }
        // Call the event listeners for the message event if they exist
        if (this.listeners.message) {
          for (const listener of this.listeners.message) {
            listener(event)
          }
        }
      }, 1) // Wait for 1 second
    }
  }

  _send (data, notify) {
    // Check if the readyState is 1 (OPEN)
    if (this.readyState === 1) {
      // Simulate the sending process
      setTimeout(() => {
        // Create a fake event object
        const event = {
          type: 'message',
          data,
          target: this
        }
        // Call the onmessage method if it is a function
        if (notify !== false && typeof this.onmessage === 'function') {
          this.onmessage(event)
        }
        // Call the event listeners for the message event if they exist
        if (this.listeners.message) {
          for (const listener of this.listeners.message) {
            listener(event)
          }
        }
      }, 1) // Wait for 1 second
    }
  }

  sendJSON (data, notify) {
    // Convert the data to a JSON string
    const json = JSON.stringify(data)
    // Send the JSON string
    this.send(json, notify)
  }

  // A method to close the connection
  close (code, reason) {
    // Check if the readyState is 1 (OPEN)
    if (this.readyState === 1) {
      // Set the readyState property to 2 (CLOSING)
      this.readyState = 2
      // Simulate the closing process
      setTimeout(() => {
        // Set the readyState property to 3 (CLOSED)
        this.readyState = 3
        // Create a fake event object
        const event = {
          type: 'close',
          code: code || 1000, // Default code is 1000 (Normal Closure)
          reason: reason || '', // Default reason is empty string
          target: this
        }
        // Call the onclose method if it is a function
        if (typeof this.onclose === 'function') {
          this.onclose(event)
        }
        // Call the event listeners for the close event if they exist
        if (this.listeners.close) {
          for (const listener of this.listeners.close) {
            listener(event)
          }
        }
      }, 1) // Wait for 1 second
    }
  }
}
