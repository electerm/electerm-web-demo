/**
 * build common files with react module in it
 */
import fs from 'fs'
import pug from 'pug'
import { resolve } from 'path'
import {
  cwd,
  base,
  viewData
} from '../vite/common.js'

const h = process.env.HOST
const dt = {
  ...base(),
  server: h,
  cdn: h
}

export const buildPug = async (from, to) => {
  const pugContent = await fs.readFileSync(from, 'utf8')
  const htmlContent = pug.render(pugContent, {
    filename: from,
    ...viewData(dt)
  })
  await fs.writeFileSync(to, htmlContent, 'utf8')
}

buildPug(
  resolve(cwd, 'src/client/views/index.pug'),
  resolve(cwd, 'public/index.html')
)
