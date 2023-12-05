import {
  cwd
} from '../vite/common.js'
import { resolve } from 'path'
import express from 'express'
import morgan from 'morgan'

const app = express()
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// parse application/json
app.use(express.json())

app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms'
))
app.use(express.static(
  resolve(cwd, 'public')
))
const {
  DEV_HOST = '127.0.0.1',
  DEV_PORT = 5589
} = process.env

app.listen(DEV_PORT, DEV_HOST, () => {
  console.log(`server runs on http://${DEV_HOST}:${DEV_PORT}`)
})
