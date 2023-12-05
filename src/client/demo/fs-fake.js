// A fake nodejs fs module
import data from './init-data.json'

export const fs = {
  constants: data.fsConstants,
  // A fake data object that stores the file names and types
  data: {
    Downloads: 'folder',
    Documents: 'folder',
    'a.jpg': 'file'
  },

  // A fake stat method that returns a fake stats object
  stat: (path, cb) => {
    // Check if the path exists in the data object
    if (fs.data[path]) {
      // Create a fake stats object with some properties
      const stats = {
        isFile: () => fs.data[path] === 'file',
        isDirectory: () => fs.data[path] === 'folder',
        size: Math.floor(Math.random() * 1000) // A random size in bytes
      }
      // Call the callback with no error and the stats object
      cb(null, stats)
    } else {
      // Call the callback with an error
      cb(new Error("ENOENT: no such file or directory, stat '" + path + "'"))
    }
  },

  run: (cmd) => {
    return ''
  },

  // A fake access method that checks if the path exists in the data object
  access: (path, mode, cb) => {
    // Check if the path exists in the data object
    if (fs.data[path]) {
      // Call the callback with no error
      cb(null)
    } else {
      // Call the callback with an error
      cb(new Error("ENOENT: no such file or directory, access '" + path + "'"))
    }
  },

  // A fake open method that returns a fake file descriptor
  open: (path, flags, mode, cb) => {
    // Check if the path exists in the data object
    if (fs.data[path]) {
      // Create a fake file descriptor with a random number
      const fd = Math.floor(Math.random() * 100)
      // Call the callback with no error and the file descriptor
      cb(null, fd)
    } else {
      // Call the callback with an error
      cb(new Error("ENOENT: no such file or directory, open '" + path + "'"))
    }
  },

  // A fake read method that reads some fake data from the file descriptor
  read: (fd, buffer, offset, length, position, cb) => {
    // Check if the file descriptor is valid
    if (typeof fd === 'number') {
      // Create some fake data as a string
      const data = 'This is some fake data from the file.'
      // Copy the data to the buffer
      buffer.write(data, offset, length, 'utf8')
      // Call the callback with no error, the number of bytes read, and the buffer
      cb(null, data.length, buffer)
    } else {
      // Call the callback with an error
      cb(new Error('EBADF: bad file descriptor, read'))
    }
  },

  // A fake close method that closes the file descriptor
  close: (fd, cb) => {
    // Check if the file descriptor is valid
    if (typeof fd === 'number') {
      // Call the callback with no error
      cb(null)
    } else {
      // Call the callback with an error
      cb(new Error('EBADF: bad file descriptor, close'))
    }
  },

  // A fake readdir method that returns the list of files in the data object
  readdir: (path, cb) => {
    // Check if the path is the root directory
    // Get the keys of the data object as an array
    const files = Object.keys(fs.data)
    // Call the callback with no error and the files array
    cb(null, files)
  },

  readdirAsync: (path) => {
    return Object.keys(fs.data)
  },

  statAsync: (path) => {
    const pp = path.split('/')
    const p = pp[pp.length - 1]
    if (fs.data[p]) {
      // Create a fake stats object with some properties
      const stats = {
        isFile: fs.data[p] === 'file',
        isDirectory: fs.data[p] === 'folder',
        size: Math.floor(Math.random() * 1000) // A random size in bytes
      }
      // Call the callback with no error and the stats object
      return stats
    }
  },

  lstatAsync: (path) => {
    return fs.statAsync(path)
  },

  // A fake mkdir method that creates a new folder in the data object
  mkdir: (path, mode, cb) => {
    // Check if the path already exists in the data object
    if (fs.data[path]) {
      // Call the callback with an error
      cb(new Error("EEXIST: file already exists, mkdir '" + path + "'"))
    } else {
      // Add the path and the type to the data object
      fs.data[path] = 'folder'
      // Call the callback with no error
      cb(null)
    }
  },

  // A fake write method that writes some fake data to the file descriptor
  write: (fd, buffer, offset, length, position, cb) => {
    // Check if the file descriptor is valid
    if (typeof fd === 'number') {
      // Create some fake data as a string
      const data = 'This is some fake data to the file.'
      // Copy the data to the buffer
      buffer.write(data, offset, length, 'utf8')
      // Call the callback with no error, the number of bytes written, and the buffer
      cb(null, data.length, buffer)
    } else {
      // Call the callback with an error
      cb(new Error('EBADF: bad file descriptor, write'))
    }
  },

  // A fake realpath method that returns the absolute path of the file
  realpath: (path, cb) => {
    // Check if the path exists in the data object
    if (fs.data[path]) {
      // Prepend the root directory to the path
      const realpath = '/' + path
      // Call the callback with no error and the realpath
      cb(null, realpath)
    } else {
      // Call the callback with an error
      cb(new Error("ENOENT: no such file or directory, realpath '" + path + "'"))
    }
  }
}
