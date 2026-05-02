/**
 * build
 */
import pkg from 'shelljs'
const { exec, echo } = pkg

echo('start build')

const timeStart = Date.now()

// echo('clean')
exec('npm run clean')
echo('js/css file')
exec('npm run vb')
echo('copy file')
exec('node ./build/bin/copy.js')
echo('generate sitemap')
exec('node ./build/bin/build-sitemap.js')

const endTime = Date.now()
echo(`done build in ${(endTime - timeStart) / 1000} s`)
