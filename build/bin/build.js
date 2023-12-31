/**
 * build
 */
import pkg from 'shelljs'
const { exec, echo, mkdir } = pkg

echo('start build')

const timeStart = Date.now()

// echo('clean')
exec('npm run clean')
mkdir('-p', 'public/iTerm2-Color-Schemes')
echo('js/css file')
exec('npm run vb')
echo('copy file')
exec('node ./build/bin/copy.js')

const endTime = Date.now()
echo(`done build in ${(endTime - timeStart) / 1000} s`)
