/**
 * Solid fake terminal shell for electerm-web-demo.
 *
 * No real server exists in the demo, so this emulates a small but
 * convincing Linux shell: line editing (echo, backspace, ctrl-c/u/l,
 * history via up/down, tab completion), a nested fake filesystem,
 * ~40 commands, pipes (| grep/head/tail/wc/sort), chaining (; && ||),
 * redirects (> >>), env vars and a live-ish `top`-style output.
 *
 * Transport note: FakeWs.send() no longer echoes client input back to the
 * terminal (like a real socket). This module owns the echo: printable chars
 * are echoed via sendToTerminal, control keys update the line buffer and
 * rewrite the line with `\x1b[2K\r<prompt>...`.
 */

const USER = 'demo'
const HOST = 'electerm-demo'

const BOOT_TIME = Date.now() - (14 * 86400 + 6 * 3600 + 22 * 60) * 1000

// ---------------------------------------------------------------------------
// Fake filesystem (nested). `type: 'dir' | 'file'`, files hold text content.
// ---------------------------------------------------------------------------

function F (content) {
  return { type: 'file', content }
}
function D (children = {}) {
  return { type: 'dir', children }
}

function buildFs () {
  return D({
    home: D({
      demo: D({
        'README.md': F('# Electerm Web Demo\n\nThis is a fully client-side demo terminal.\nTry `help` to see available commands.\n'),
        'a.jpg': F('[binary image data: a.jpg, 128KB]'),
        Documents: D({
          'notes.txt': F('TODO:\n- try the SSH demo\n- star electerm on GitHub\n- check the monitor bar (cpu/mem/net) at the top\n'),
          'todo.md': F('# TODO\n\n- [x] open demo\n- [ ] deploy electerm\n')
        }),
        Downloads: D({
          'electerm-linux-x64.tar.gz': F('[binary archive data]')
        }),
        projects: D({
          demo: D({
            'package.json': F('{\n  "name": "demo",\n  "version": "1.0.0"\n}\n'),
            'index.js': F('console.log("hello from electerm demo")\n')
          })
        }),
        '.bashrc': F('# fake bashrc\nexport PATH=$PATH:/usr/local/bin\n'),
        '.profile': F('# fake profile\n')
      })
    }),
    etc: D({
      hostname: F('electerm-demo\n'),
      hosts: F('127.0.0.1 localhost\nelecterm-demo\n'),
      os_release: F('PRETTY_NAME="Ubuntu 24.04 LTS (Demo)"\nNAME="Ubuntu"\nVERSION="24.04 LTS (Demo)"\n'),
      passwd: F('root:x:0:0:root:/root:/bin/bash\ndemo:x:1000:1000:demo:/home/demo:/bin/bash\n'),
      group: F('root:x:0:\ndemo:x:1000:\n')
    }),
    proc: D({}),
    tmp: D({}),
    var: D({
      log: D({
        syslog: F('demo syslog (fake)\n')
      })
    }),
    usr: D({
      bin: D({}),
      local: D({ bin: D({}) })
    })
  })
}

let FS = buildFs()

export function resetFakeFs () {
  FS = buildFs()
}

// Resolve a path (absolute or relative to cwd) to { node, absPath }.
export function resolvePath (cwd, input) {
  let p = (input || '').trim()
  if (!p || p === '~') return { node: getNode('/home/demo'), absPath: '/home/demo' }
  if (p.startsWith('~/')) p = '/home/demo/' + p.slice(2)
  else if (p === '~user') p = '/home/demo'
  const abs = p.startsWith('/')
    ? normalizePath(p)
    : normalizePath(cwd + '/' + p)
  return { node: getNode(abs), absPath: abs }
}

function normalizePath (p) {
  const parts = []
  for (const seg of p.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') parts.pop()
    else parts.push(seg)
  }
  return '/' + parts.join('/')
}

function getNode (absPath) {
  if (absPath === '/') return FS
  const parts = absPath.split('/').filter(Boolean)
  let node = FS
  for (const part of parts) {
    if (!node || node.type !== 'dir') return null
    node = node.children[part]
    if (!node) return null
  }
  return node
}

function parentOf (absPath) {
  const idx = absPath.lastIndexOf('/')
  const dir = idx <= 0 ? '/' : absPath.slice(0, idx)
  const base = absPath.slice(idx + 1)
  return { dir, base, parent: getNode(dir) }
}

function shortCwd (cwd) {
  if (cwd === '/home/demo') return '~'
  if (cwd.startsWith('/home/demo/')) return '~' + cwd.slice('/home/demo'.length)
  return cwd
}

// ---------------------------------------------------------------------------
// Per-connection shell state
// ---------------------------------------------------------------------------

const sessions = new WeakMap()

export function getShellState (ws) {
  let st = sessions.get(ws)
  if (!st) {
    st = {
      cwd: '/home/demo',
      env: {
        USER,
        LOGNAME: USER,
        HOME: '/home/demo',
        HOSTNAME: HOST,
        SHELL: '/bin/bash',
        PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        LANG: 'en_US.UTF-8',
        PWD: '/home/demo',
        OLDPWD: '/home/demo',
        TERM: 'xterm-256color'
      },
      history: ['ls', 'uptime', 'df -h'],
      historyIndex: -1,
      buffer: '',
      // network counters for `exec-cmd` monitor + fake `cat /proc` style cmds
      rxBytes: 128456789,
      txBytes: 42345678
    }
    sessions.set(ws, st)
  }
  return st
}

export function promptFor (st, colored = true) {
  const cwd = shortCwd(st.cwd)
  if (!colored) return `${USER}@${HOST}:${cwd}$ `
  return `\x1b[32m${USER}@${HOST}\x1b[0m:\x1b[34m${cwd}\x1b[0m$ `
}

// ---------------------------------------------------------------------------
// Input handling (called from dispatch-center for /terminals/ sockets)
// ---------------------------------------------------------------------------

export function handleTerminalInput (ws, data) {
  const st = getShellState(ws)
  // data may be a multi-char paste or a single escape sequence
  let i = 0
  const s = String(data)
  while (i < s.length) {
    // CSI sequences like \x1b[A (arrows), \x1b[3~ (delete), etc.
    if (s[i] === '\x1b' && s[i + 1] === '[') {
      let j = i + 2
      while (j < s.length && !/[A-Za-z~]/.test(s[j])) j++
      j = Math.min(j + 1, s.length)
      const seq = s.slice(i, j)
      handleEscape(ws, st, seq)
      i = j
      continue
    }
    const ch = s[i]
    if (ch === '\r' || ch === '\n') {
      submitLine(ws, st)
    } else if (ch === '\x7f' || ch === '\b') {
      // backspace
      if (st.buffer.length) {
        st.buffer = st.buffer.slice(0, -1)
        ws.sendToTerminal('\b \b')
      }
      st.historyIndex = -1
    } else if (ch === '\x03') {
      // Ctrl-C
      ws.sendToTerminal('^C\r\n' + promptFor(st))
      st.buffer = ''
      st.historyIndex = -1
    } else if (ch === '\x04') {
      // Ctrl-D
      if (!st.buffer) {
        ws.sendToTerminal('exit\r\n')
        ws.sendToTerminal('🔌 Demo session ended — type anything to start a new one.\r\n')
        st.ended = true
      }
    } else if (ch === '\x0c') {
      // Ctrl-L: clear screen
      ws.sendToTerminal('\x1b[2J\x1b[H' + promptFor(st) + st.buffer)
    } else if (ch === '\x15') {
      // Ctrl-U: kill line
      st.buffer = ''
      ws.sendToTerminal('\x1b[2K\r' + promptFor(st))
    } else if (ch === '\t') {
      handleTab(ws, st)
    } else if (ch >= ' ' || ch === '\x1b') {
      // printable (paste may include many chars)
      st.buffer += ch
      ws.sendToTerminal(ch)
      st.historyIndex = -1
    }
    // ignore other control chars (e.g. \x00)
    i++
  }
}

function handleEscape (ws, st, seq) {
  if (seq === '\x1b[A') {
    // up: older history
    if (!st.history.length) return
    if (st.historyIndex === -1) {
      st.historyIndex = st.history.length - 1
    } else if (st.historyIndex > 0) {
      st.historyIndex--
    } else {
      return
    }
    st.buffer = st.history[st.historyIndex] || ''
    ws.sendToTerminal('\x1b[2K\r' + promptFor(st) + st.buffer)
  } else if (seq === '\x1b[B') {
    // down: newer history
    if (st.historyIndex === -1) return
    if (st.historyIndex < st.history.length - 1) {
      st.historyIndex++
      st.buffer = st.history[st.historyIndex]
    } else {
      st.historyIndex = -1
      st.buffer = ''
    }
    ws.sendToTerminal('\x1b[2K\r' + promptFor(st) + st.buffer)
  } else if (seq === '\x1b[C' || seq === '\x1b[D') {
    // left/right: single-line editor without cursor tracking — ignore
  } else if (seq === '\x1b[3~') {
    // delete key: treat like backspace at end
    if (st.buffer.length) {
      st.buffer = st.buffer.slice(0, -1)
      ws.sendToTerminal('\b \b')
    }
  }
  // ignore everything else (Home/End etc.)
}

function handleTab (ws, st) {
  const completed = completeInput(st)
  if (!completed) return
  if (completed.display) {
    // ambiguous: list candidates
    ws.sendToTerminal('\r\n' + completed.display + '\r\n' + promptFor(st) + st.buffer)
  } else if (completed.append) {
    st.buffer += completed.append
    ws.sendToTerminal(completed.append)
  }
}

function completeInput (st) {
  const m = st.buffer.match(/^(.*\s)?(\S*)$/)
  if (!m) return null
  const prefix = m[1] || ''
  const frag = m[2] || ''
  const isFirst = !prefix.trim()
  if (isFirst) {
    const cmds = allCommandNames().filter(c => c.startsWith(frag)).sort()
    if (cmds.length === 1) return { append: cmds[0].slice(frag.length) + ' ' }
    if (cmds.length > 1) {
      const common = commonPrefix(cmds)
      if (common.length > frag.length) return { append: common.slice(frag.length) }
      return { display: cmds.join('  ') }
    }
    return null
  }
  // file completion
  let dirPart = ''
  let fileFrag = frag
  const slash = frag.lastIndexOf('/')
  if (slash !== -1) {
    dirPart = frag.slice(0, slash + 1)
    fileFrag = frag.slice(slash + 1)
  }
  const { node } = resolvePath(st.cwd, dirPart || '.')
  if (!node || node.type !== 'dir') return null
  const cands = Object.keys(node.children).filter(n => n.startsWith(fileFrag)).sort()
  if (!cands.length) return null
  if (cands.length === 1) {
    const full = cands[0]
    const child = node.children[full]
    return { append: full.slice(fileFrag.length) + (child.type === 'dir' ? '/' : ' ') }
  }
  const common = commonPrefix(cands)
  if (common.length > fileFrag.length) return { append: common.slice(fileFrag.length) }
  return { display: cands.join('  ') }
}

function commonPrefix (arr) {
  if (!arr.length) return ''
  let p = arr[0]
  for (let i = 1; i < arr.length; i++) {
    while (!arr[i].startsWith(p)) p = p.slice(0, -1)
  }
  return p
}

// ---------------------------------------------------------------------------
// Line execution: chaining, pipes, redirects
// ---------------------------------------------------------------------------

function submitLine (ws, st) {
  const line = st.buffer
  st.buffer = ''
  ws.sendToTerminal('\r\n')
  const trimmed = line.trim()
  if (st.ended) {
    st.ended = false
    ws.sendToTerminal('🚀 New demo shell started. Type "help".\r\n' + promptFor(st))
    return
  }
  if (!trimmed) {
    ws.sendToTerminal(promptFor(st))
    return
  }
  st.history.push(line)
  if (st.history.length > 200) st.history.shift()
  st.historyIndex = -1
  try {
    const out = runLine(st, line)
    if (out) ws.sendToTerminal(out)
  } catch (e) {
    ws.sendToTerminal(`bash: unexpected error: ${e.message}\r\n`)
  }
  ws.sendToTerminal(promptFor(st))
}

function runLine (st, line) {
  const tokens = tokenizeChain(line)
  let out = ''
  let lastOk = true
  let pendingOp = ';'
  for (const tok of tokens) {
    if (pendingOp === '&&' && !lastOk) {
      pendingOp = tok.opAfter
      continue
    }
    if (pendingOp === '||' && lastOk) {
      pendingOp = tok.opAfter
      continue
    }
    const res = execPipeline(st, tok.text)
    out += res.output
    lastOk = res.ok
    pendingOp = tok.opAfter
    if (tok.text.trim() === 'exit' || tok.text.trim() === 'logout') break
  }
  return out
}

// Split `a && b || c; d` into segments, respecting quotes
function tokenizeChain (line) {
  const tokens = []
  let cur = ''
  let q = null
  let i = 0
  const push = (opAfter) => {
    tokens.push({ text: cur, opAfter })
    cur = ''
  }
  while (i < line.length) {
    const c = line[i]
    if (q) {
      cur += c
      if (c === q) q = null
      i++
    } else if (c === '"' || c === "'") {
      q = c
      cur += c
      i++
    } else if (c === ';') {
      push(';')
      i++
    } else if (c === '&' && line[i + 1] === '&') {
      push('&&')
      i += 2
    } else if (c === '|' && line[i + 1] === '|') {
      push('||')
      i += 2
    } else {
      cur += c
      i++
    }
  }
  push(';')
  return tokens
}

// pipeline: cmd1 | cmd2 | cmd3  +  redirect > >>
function execPipeline (st, text) {
  const stages = splitPipe(text)
  // handle redirect on last stage
  let redirect = null
  const last = stages[stages.length - 1]
  const rm = last.match(/^(.*?)(\s*(>>|>)\s*(\S+))\s*$/)
  if (rm && !hasUnquotedPipe(last)) {
    // ensure > is not part of something else; simple check ok
    stages[stages.length - 1] = rm[1]
    redirect = { mode: rm[3], target: rm[4] }
  }
  let input = null
  let output = ''
  let ok = true
  for (let i = 0; i < stages.length; i++) {
    const r = execSingle(st, stages[i].trim(), input)
    input = r.output
    output = r.output
    ok = r.ok
    if (!ok && i < stages.length - 1) {
      // pipe continues anyway with empty input
      input = ''
    }
  }
  if (redirect) {
    const writeRes = writeRedirect(st, redirect.target, output, redirect.mode === '>>')
    output = writeRes.ok ? '' : writeRes.output
    ok = writeRes.ok
  }
  return { output, ok }
}

function hasUnquotedPipe (s) {
  let q = null
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (q) {
      if (c === q) q = null
    } else if (c === '"' || c === "'") {
      q = c
    } else if (c === '|') {
      return true
    }
  }
  return false
}

function splitPipe (text) {
  const parts = []
  let cur = ''
  let q = null
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      cur += c
      if (c === q) q = null
    } else if (c === '"' || c === "'") {
      q = c
      cur += c
    } else if (c === '|' && text[i + 1] !== '|') {
      parts.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  parts.push(cur)
  return parts
}

function writeRedirect (st, target, content, append) {
  const { absPath, node } = resolvePath(st.cwd, target)
  if (node && node.type === 'dir') {
    return { ok: false, output: `bash: ${target}: Is a directory\r\n` }
  }
  const { parent, base } = parentOf(absPath)
  if (!parent || parent.type !== 'dir' || !base) {
    return { ok: false, output: `bash: ${target}: No such file or directory\r\n` }
  }
  const prev = parent.children[base]
  const next = append && prev && prev.type === 'file' ? prev.content + content : content
  // strip \r for stored content, keep \n
  parent.children[base] = F(next.replace(/\r/g, ''))
  return { ok: true, output: '' }
}

// ---------------------------------------------------------------------------
// Single command execution
// ---------------------------------------------------------------------------

function tokenize (cmd) {
  const args = []
  let cur = ''
  let q = null
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i]
    if (q) {
      if (c === q) {
        q = null
      } else if (c === '\\' && i + 1 < cmd.length) {
        cur += cmd[++i]
      } else {
        cur += c
      }
    } else if (c === '"' || c === "'") {
      q = c
    } else if (c === '\\' && i + 1 < cmd.length) {
      cur += cmd[++i]
    } else if (/\s/.test(c)) {
      if (cur) { args.push(cur); cur = '' }
    } else {
      cur += c
    }
  }
  if (cur) args.push(cur)
  return args
}

function expandEnv (st, arg) {
  return arg.replace(/\$([A-Za-z_][A-Za-z0-9_]*)|\${([^}]+)}/g, (m, a, b) => {
    const k = a || b
    if (k === '?') return '0'
    return st.env[k] !== undefined ? st.env[k] : ''
  })
}

function execSingle (st, cmdText, pipeInput) {
  if (!cmdText.trim()) return { output: '', ok: true }
  let argv = tokenize(cmdText).map(a => expandEnv(st, a))
  if (!argv.length) return { output: '', ok: true }
  // sudo prefix: strip and run
  if (argv[0] === 'sudo') argv = argv.slice(1)
  if (!argv.length) return { output: '', ok: true }
  const name = argv[0]
  const args = argv.slice(1)
  const fn = COMMANDS[name]
  if (!fn) {
    return { output: `bash: ${name}: command not found\r\n`, ok: false }
  }
  try {
    const out = fn(st, args, pipeInput)
    return { output: toCRLF(out || ''), ok: true }
  } catch (e) {
    return { output: `bash: ${name}: ${e.message}\r\n`, ok: false }
  }
}

function toCRLF (s) {
  if (!s) return ''
  return String(s).replace(/\r?\n/g, '\r\n')
}

function allCommandNames () {
  return Object.keys(COMMANDS)
}

// ---------------------------------------------------------------------------
// Command implementations
// ---------------------------------------------------------------------------

function listDir (node, showAll, long) {
  const names = Object.keys(node.children).sort()
  const filtered = showAll ? names : names.filter(n => !n.startsWith('.'))
  if (!long) {
    // colorize: dirs blue, archives red-ish
    return filtered.map(n => {
      const c = node.children[n]
      if (c.type === 'dir') return `\x1b[34m${n}/\x1b[0m`
      if (/\.(tar|gz|zip|tgz)$/.test(n)) return `\x1b[31m${n}\x1b[0m`
      if (/\.(jpg|png|gif)$/.test(n)) return `\x1b[35m${n}\x1b[0m`
      return n
    }).join('  ') + (filtered.length ? '\n' : '')
  }
  const lines = ['total ' + filtered.length]
  for (const n of filtered) {
    const c = node.children[n]
    const isDir = c.type === 'dir'
    const size = isDir ? 4096 : BufferByteLength(c.content)
    lines.push(`${isDir ? 'drwxr-xr-x' : '-rw-r--r--'}  1 demo demo ${String(size).padStart(8)} Sep 12 10:00 ${n}${isDir ? '/' : ''}`)
  }
  return lines.join('\n') + '\n'
}

function BufferByteLength (s) {
  try { return new TextEncoder().encode(s).length } catch { return String(s).length }
}

const COMMANDS = {
  help (st) {
    return [
      'Electerm demo shell — try these commands:',
      '',
      '  files:      ls  ll  la  cd  pwd  cat  head  tail  wc  du  find  touch  mkdir  rm  echo  grep  sort',
      '  system:     whoami  hostname  uname  date  uptime  df  free  ps  top  env  printenv  export  history  clear',
      '  network:    ping  curl  wget  ip  ifconfig  ss',
      '  tools:      git  node  npm  python3  docker  kubectl  vim  nano  neofetch  htop  lsblk',
      '',
      '  tips: ↑/↓ history · Tab completion · `echo hi > file` · pipes ( | grep ) · `cd ~/projects`',
      ''
    ].join('\n')
  },

  ls (st, args) {
    let showAll = false
    let long = false
    const paths = []
    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('a')) showAll = true
        if (a.includes('l')) long = true
      } else paths.push(a)
    }
    const targets = paths.length ? paths : ['.']
    let out = ''
    for (const t of targets) {
      const { node } = resolvePath(st.cwd, t)
      if (!node) return `ls: cannot access '${t}': No such file or directory\n`
      if (node.type === 'file') out += t + '\n'
      else out += listDir(node, showAll, long)
    }
    return out
  },
  ll (st, args) { return COMMANDS.ls(st, ['-l', ...args]) },
  la (st, args) { return COMMANDS.ls(st, ['-la', ...args]) },
  dir () { return COMMANDS.ls(...arguments) },

  cd (st, args) {
    const target = args[0] || '~'
    let next = target
    if (target === '-') {
      next = st.env.OLDPWD || '/home/demo'
    }
    const { node, absPath } = resolvePath(st.cwd, next)
    if (!node) return `bash: cd: ${target}: No such file or directory\n`
    if (node.type !== 'dir') return `bash: cd: ${target}: Not a directory\n`
    st.env.OLDPWD = st.cwd
    st.cwd = absPath
    st.env.PWD = absPath
    return ''
  },

  pwd (st) { return st.cwd + '\n' },

  cat (st, args, pipeInput) {
    if (!args.length) return (pipeInput || '').replace(/\r/g, '') + (pipeInput ? '' : '')
    let out = ''
    for (const a of args) {
      if (a === '-') { out += (pipeInput || ''); continue }
      const { node } = resolvePath(st.cwd, a)
      if (!node) return `cat: ${a}: No such file or directory\n`
      if (node.type === 'dir') return `cat: ${a}: Is a directory\n`
      out += node.content
      if (!out.endsWith('\n')) out += '\n'
    }
    return out
  },

  echo (st, args) {
    let newline = true
    let interpret = false
    const rest = []
    for (const a of args) {
      if (a === '-n') {
        newline = false
      } else if (a === '-e') {
        interpret = true
      } else if (/^-[ne]+$/.test(a)) {
        if (a.includes('n')) newline = false
        if (a.includes('e')) interpret = true
      } else {
        rest.push(a)
      }
    }
    let s = rest.join(' ')
    if (interpret) s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    return s + (newline ? '\n' : '')
  },

  head (st, args, pipeInput) {
    let n = 10
    const files = []
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        n = parseInt(args[++i], 10) || 10
      } else if (/^-\d+$/.test(args[i])) {
        n = parseInt(args[i].slice(1), 10)
      } else {
        files.push(args[i])
      }
    }
    const text = files.length ? readFiles(st, files) : (pipeInput || '')
    if (typeof text !== 'string') return text.output
    return text.split('\n').slice(0, n).join('\n') + '\n'
  },

  tail (st, args, pipeInput) {
    let n = 10
    const files = []
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        n = parseInt(args[++i], 10) || 10
      } else if (/^-\d+$/.test(args[i])) {
        n = parseInt(args[i].slice(1), 10)
      } else {
        files.push(args[i])
      }
    }
    const text = files.length ? readFiles(st, files) : (pipeInput || '')
    if (typeof text !== 'string') return text.output
    const lines = text.replace(/\n$/, '').split('\n')
    return lines.slice(Math.max(0, lines.length - n)).join('\n') + '\n'
  },

  wc (st, args, pipeInput) {
    const files = args.filter(a => !a.startsWith('-'))
    const text = files.length ? readFiles(st, files) : (pipeInput || '')
    if (typeof text !== 'string') return text.output
    const lines = text === '' ? 0 : text.replace(/\n$/, '').split('\n').length
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    const bytes = BufferByteLength(text)
    return ` ${lines}  ${words} ${bytes}\n`
  },

  grep (st, args, pipeInput) {
    let ignoreCase = false
    let invert = false
    let lineNum = false
    const files = []
    let pattern = null
    for (let i = 0; i < args.length; i++) {
      const a = args[i]
      if (a === '-i') {
        ignoreCase = true
      } else if (a === '-v') {
        invert = true
      } else if (a === '-n') {
        lineNum = true
      } else if (!pattern) {
        pattern = a
      } else {
        files.push(a)
      }
    }
    if (!pattern) return 'usage: grep [options] PATTERN [FILE...]\n'
    const text = files.length ? readFiles(st, files) : (pipeInput || '')
    if (typeof text !== 'string') return text.output
    const flags = ignoreCase ? 'i' : ''
    let re
    try {
      re = new RegExp(pattern, flags)
    } catch {
      re = new RegExp(escapeReg(pattern), flags)
    }
    const lines = text.split('\n')
    const out = []
    lines.forEach((ln, idx) => {
      if (!ln && idx === lines.length - 1) return
      const hit = re.test(ln)
      if ((hit && !invert) || (!hit && invert)) {
        out.push(lineNum ? `${idx + 1}:${ln}` : ln)
      }
    })
    return out.length ? out.join('\n') + '\n' : ''
  },

  sort (st, args, pipeInput) {
    const files = args.filter(a => !a.startsWith('-'))
    const reverse = args.includes('-r')
    const text = files.length ? readFiles(st, files) : (pipeInput || '')
    if (typeof text !== 'string') return text.output
    const lines = text.replace(/\n$/, '').split('\n').sort()
    if (reverse) lines.reverse()
    return lines.join('\n') + '\n'
  },

  find (st, args) {
    const start = args[0] && !args[0].startsWith('-') ? args[0] : '.'
    const { node, absPath } = resolvePath(st.cwd, start)
    if (!node) return `find: '${start}': No such file or directory\n`
    const results = []
    const walk = (n, p) => {
      results.push(p)
      if (n.type === 'dir') {
        for (const k of Object.keys(n.children).sort()) walk(n.children[k], p === '/' ? `/${k}` : `${p}/${k}`)
      }
    }
    walk(node, absPath)
    return results.join('\n') + '\n'
  },

  du (st, args) {
    const t = args.find(a => !a.startsWith('-')) || '.'
    const { node } = resolvePath(st.cwd, t)
    if (!node) return `du: cannot access '${t}': No such file or directory\n`
    return '4.0K\t' + t + '\n'
  },

  touch (st, args) {
    for (const a of args) {
      const { absPath, node } = resolvePath(st.cwd, a)
      if (node) continue
      const { parent, base } = parentOf(absPath)
      if (!parent || parent.type !== 'dir') return `touch: cannot touch '${a}': No such file or directory\n`
      parent.children[base] = F('')
    }
    return ''
  },

  mkdir (st, args) {
    const list = args.filter(a => !a.startsWith('-'))
    if (!list.length) return 'usage: mkdir DIRECTORY...\n'
    for (const a of list) {
      const { absPath, node } = resolvePath(st.cwd, a)
      if (node) return `mkdir: cannot create directory '${a}': File exists\n`
      const { parent, base } = parentOf(absPath)
      if (!parent || parent.type !== 'dir') return `mkdir: cannot create directory '${a}': No such file or directory\n`
      parent.children[base] = D({})
    }
    return ''
  },

  rm (st, args) {
    const list = args.filter(a => !a.startsWith('-'))
    if (!list.length) return 'usage: rm FILE...\n'
    for (const a of list) {
      const { absPath, node } = resolvePath(st.cwd, a)
      if (!node) return `rm: cannot remove '${a}': No such file or directory\n`
      const { parent, base } = parentOf(absPath)
      delete parent.children[base]
    }
    return ''
  },

  rmdir (st, args) { return COMMANDS.rm(st, args) },

  cp () { return 'cp: demo filesystem is simplified — use `echo text > file` to create files\n' },
  mv () { return 'mv: demo filesystem is simplified — use `cat` + redirect instead\n' },

  whoami () { return USER + '\n' },
  hostname (st, args) {
    if (args.includes('-f')) return HOST + '.local\n'
    return HOST + '\n'
  },
  id () { return `uid=1000(${USER}) gid=1000(${USER}) groups=1000(${USER})\n` },

  uname (st, args) {
    if (args.includes('-a')) return `Linux ${HOST} 6.8.0-demo-generic #1 SMP x86_64 GNU/Linux\n`
    if (args.includes('-r')) return '6.8.0-demo-generic\n'
    if (args.includes('-n')) return HOST + '\n'
    if (args.includes('-m')) return 'x86_64\n'
    if (args.includes('-s')) return 'Linux\n'
    return 'Linux\n'
  },

  date () { return new Date().toString() + '\n' },

  uptime () {
    const secs = Math.floor((Date.now() - BOOT_TIME) / 1000)
    const d = Math.floor(secs / 86400)
    const h = Math.floor((secs % 86400) / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return ` up ${d} weeks, ${h} hours, ${m} minutes\n`
  },

  df (st, args) {
    return [
      'Filesystem      Size  Used Avail Use% Mounted on',
      '/dev/sda1        24G   11G   12G  48% /',
      'tmpfs           483M     0  483M   0% /dev/shm',
      'tmpfs           5.0M     0  5.0M   0% /run/lock'
    ].join('\n') + '\n'
  },

  free () {
    return [
      '               total        used        free      shared  buff/cache   available',
      'Mem:         4024548      812340     1987456       12456     1224752     3100000',
      'Swap:        2097148           0     2097148'
    ].join('\n') + '\n'
  },

  ps (st, args) {
    return [
      '  PID USER     %CPU COMMAND',
      '    1 root      0.0 /sbin/init',
      '  457 demo      0.0 /lib/systemd/systemd --user',
      '  799 demo      0.3 node /home/demo/projects/demo/index.js',
      '  921 demo      0.1 sshd: demo@pts/0',
      ' 1337 demo      0.0 -bash',
      ' 2048 demo      0.0 ps'
    ].join('\n') + '\n'
  },

  top () {
    return [
      'top - 10:00:00 up 14 days,  6:22,  2 users,  load average: 0.12, 0.08, 0.05',
      'Tasks:  48 total,   1 running,  47 sleeping,   0 stopped,   0 zombie',
      '%Cpu(s):  4.2 us,  1.8 sy,  0.0 ni, 93.1 id,  0.9 wa,  0.0 hi,  0.0 si',
      'MiB Mem :   3930.2 total,   1940.8 free,    793.4 used,   1196.0 buff/cache',
      '',
      '  PID USER      PR  NI    VIRT    RES  %CPU %MEM     TIME+ COMMAND',
      '  799 demo      20   0  912344  88412   4.2  2.2   1:23.45 node',
      ' 1337 demo      20   0   22016   5320   0.7  0.1   0:00.03 bash',
      '    1 root      20   0  165632  11240   0.0  0.3   0:01.12 systemd',
      '',
      '(demo `top`: static snapshot — press q to get a new prompt)'
    ].join('\n') + '\n'
  },
  htop (st, args, pipe) { return COMMANDS.top(st, args, pipe) },

  env (st) {
    return Object.entries(st.env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n'
  },
  printenv (st, args) {
    if (!args.length) return COMMANDS.env(st)
    return args.map(a => st.env[a] || '').join('\n') + '\n'
  },
  export (st, args) {
    for (const a of args) {
      const m = a.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (m) st.env[m[1]] = m[2]
    }
    return ''
  },

  history (st) {
    return st.history.map((h, i) => `  ${i + 1}  ${h}`).join('\n') + '\n'
  },

  clear () { return '\x1b[2J\x1b[H' },
  reset () { return '\x1bc' },

  exit () { return 'logout\n(demo session persists — reconnect by typing anything)\n' },
  logout () { return COMMANDS.exit() },

  ping (st, args) {
    const host = args.find(a => !a.startsWith('-')) || 'electerm.org'
    return [
      `PING ${host} (93.184.216.34) 56(84) bytes of data.`,
      '64 bytes from 93.184.216.34: icmp_seq=1 ttl=55 time=12.4 ms',
      '64 bytes from 93.184.216.34: icmp_seq=2 ttl=55 time=11.8 ms',
      '64 bytes from 93.184.216.34: icmp_seq=3 ttl=55 time=12.1 ms',
      '',
      `--- ${host} ping statistics ---`,
      '3 packets transmitted, 3 received, 0% packet loss, time 2002ms'
    ].join('\n') + '\n(demo ping: simulated)\n'
  },

  curl (st, args) {
    const url = args.find(a => !a.startsWith('-')) || 'https://electerm.org'
    return `(demo curl: simulated GET ${url} — 200 OK, 1256 bytes)\n` +
      '<!doctype html><html><body>electerm.org (demo)</body></html>\n'
  },
  wget (st, args) {
    const url = args.find(a => !a.startsWith('-')) || 'https://electerm.org'
    return `-- contacting ${url} ... 200 OK\nsaving to 'index.html' (demo, not really saved)\n`
  },

  ip (st, args) {
    const sub = args[0]
    if (sub === 'route' || sub === 'r') return 'default via 192.168.1.1 dev eth0 proto dhcp\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100\n'
    return [
      '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN',
      '    inet 127.0.0.1/8 scope host lo',
      '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP',
      '    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0',
      '    inet6 fe80::1/64 scope link'
    ].join('\n') + '\n'
  },
  ifconfig () {
    return [
      'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500',
      '        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255',
      '        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)',
      'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536',
      '        inet 127.0.0.1  netmask 255.0.0.0'
    ].join('\n') + '\n'
  },
  ss () {
    return [
      'Netid  State   Local Address:Port   Peer Address:Port',
      'tcp    ESTAB   192.168.1.100:22    192.168.1.10:54321',
      'tcp    LISTEN  0.0.0.0:22          0.0.0.0:*'
    ].join('\n') + '\n'
  },

  git (st, args) {
    const sub = args[0]
    if (!sub) return 'usage: git <command> [<args>]\n'
    if (sub === 'status') return 'On branch main\nnothing to commit, working tree clean (demo)\n'
    if (sub === '--version' || sub === 'version') return 'git version 2.43.0 (demo)\n'
    if (sub === 'log') return 'commit 9f3a1c2 (HEAD -> main)\nAuthor: demo\nDate:   Sep 12 10:00 2026\n\n    demo commit\n'
    return `git ${sub}: demo repo — nothing to do\n`
  },

  node (st, args) {
    if (args.includes('--version') || args.includes('-v')) return 'v20.18.0\n'
    if (!args.length) return '(demo node: interactive REPL disabled — try `node --version`)\n'
    return `(demo node: would run ${args.join(' ')})\n`
  },
  npm (st, args) {
    if (args[0] === '--version' || args[0] === '-v') return '10.8.2\n'
    if (args[0] === 'ls') return 'demo@1.0.0 /home/demo/projects/demo\n└── (empty, demo)\n'
    return `(demo npm: \`${args.join(' ')}\` simulated)\n`
  },
  python3 (st, args) {
    if (args.includes('--version')) return 'Python 3.12.3\n'
    return '(demo python3: simulated — try `python3 --version`)\n'
  },
  python (st, args) { return COMMANDS.python3(st, args) },
  docker (st, args) {
    if (args[0] === 'ps') return 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES\n(demo: no containers)\n'
    if (args.includes('--version')) return 'Docker version 26.1.0, build demo\n'
    return '(demo docker: simulated — no daemon in browser)\n'
  },
  kubectl (st, args) {
    if (args[0] === 'get') return 'NAME         READY   STATUS    RESTARTS   AGE\npod/demo     1/1     Running   0          14d\n(demo output)\n'
    return '(demo kubectl: simulated)\n'
  },

  vim (st, args) { return `(demo vim: \`${args[0] || ''}\` would open here — try \`cat ${args[0] || 'README.md'}\` instead)\n` },
  nano (st, args) { return COMMANDS.vim(st, args) },
  code (st, args) { return '(demo code: VS Code is not inside the browser — files are listed with `ls`)\n' },
  less (st, args, pipe) { return runPipeFallback(st, args, pipe, 'less') },
  more (st, args, pipe) { return runPipeFallback(st, args, pipe, 'more') },

  neofetch () {
    return [
      '       _,met$$$$$gg.          demo@electerm-demo',
      '    ,g$$$$$$$$$$$$$$$P.       -----------------',
      '  ,g$$P"       """Y$$.".     OS: Ubuntu 24.04 LTS (Demo)',
      ' ,$$P\'              `$$$.     Host: browser',
      '\',$$P       ,ggs.     `$$b:   Kernel: 6.8.0-demo',
      '`d$$\'     ,$P"\'   .    $$$    Shell: bash (demo)',
      ' $$P      d$\'     ,    $$P    Terminal: electerm web',
      ' $$:      $$.   -    ,d$$\'    CPU: demo vCPU (4)',
      ' $$;      Y$b._   _,d$P\'      Memory: 3930MiB',
      ' Y$$.    `.`"Y$$$$P"\'         ',
      ' `$$b      "-.__              ',
      '  `Y$$                        ',
      '   `Y$$.                      ',
      '     `$$b.                    ',
      '       `Y$b._                 ',
      '          `"""               '
    ].join('\n') + '\n'
  },
  screenfetch (st, args, pipe) { return COMMANDS.neofetch(st, args, pipe) },

  lsblk () {
    return [
      'NAME   MAJ:MIN RM SIZE RO TYPE MOUNTPOINTS',
      'sda      8:0    0  24G  0 disk',
      '└─sda1   8:1    0  24G  0 part /'
    ].join('\n') + '\n'
  },

  who (st) {
    return 'demo     pts/0        2026-09-12 10:00 (192.168.1.10)\n'
  },
  users () { return 'demo\n' },
  w () {
    return ' 10:00:00 up 14 days,  6:22,  1 user,  load average: 0.12, 0.08, 0.05\nUSER     TTY      LOGIN@   WHAT\ndemo     pts/0    10:00    -bash (demo)\n'
  },

  sleep () { return '' },
  true () { return '' },
  false () { return '' },
  yes (st, args) { return Array(5).fill(args.join(' ') || 'y').join('\n') + '\n(demo yes: truncated)\n' },
  seq (st, args) {
    const n = parseInt(args[args.length - 1], 10) || 10
    const out = []
    for (let i = 1; i <= Math.min(n, 50); i++) out.push(String(i))
    return out.join('\n') + '\n'
  },

  basename (st, args) { return (args[0] || '').split('/').filter(Boolean).pop() + '\n' },
  dirname (st, args) {
    const p = args[0] || '.'
    const idx = p.replace(/\/$/, '').lastIndexOf('/')
    return (idx <= 0 ? (p.startsWith('/') ? '/' : '.') : p.slice(0, idx)) + '\n'
  },

  sudo (st, args, pipe) {
    if (!args.length) return ''
    return execSingle(st, args.join(' '), pipe).output
  },

  apt (st, args) { return '(demo apt: package manager disabled in browser — nothing installed)\n' },
  'apt-get' (st, args) { return COMMANDS.apt(st, args) },
  yum () { return '(demo yum: disabled)\n' },
  brew () { return '(demo brew: disabled)\n' },

  ssh () { return '(demo ssh: nested SSH disabled — open another bookmark to demo multi-tabs)\n' },
  scp () { return '(demo scp: use the SFTP file manager panel instead)\n' },
  sftp () { return '(demo sftp: use the SFTP file manager panel instead)\n' },
  ftp () { return '(demo ftp: use the file manager panel instead)\n' },

  electerm () { return 'electerm web demo — https://github.com/electerm/electerm\n' },

  kill (st, args) {
    if (!args.length) return 'usage: kill PID...\n'
    return ''
  }
}

function readFiles (st, files) {
  let out = ''
  for (const f of files) {
    const { node } = resolvePath(st.cwd, f)
    if (!node) return { output: `cat: ${f}: No such file or directory\n` }
    if (node.type === 'dir') return { output: `cat: ${f}: Is a directory\n` }
    out += node.content
    if (!out.endsWith('\n')) out += '\n'
  }
  return out
}

function escapeReg (s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function runPipeFallback (st, args, pipeInput) {
  const files = args.filter(a => !a.startsWith('-'))
  if (files.length) return readFiles(st, files)
  return pipeInput || ''
}

// ---------------------------------------------------------------------------
// Welcome banner
// ---------------------------------------------------------------------------

export function welcomeBanner () {
  return [
    '',
    '🚀 Welcome to Electerm Demo Terminal! 🚀',
    '',
    '📖 About Electerm:',
    '   A modern, open-sourced terminal/ssh/sftp/telnet/serial/RDP/VNC client',
    '',
    '🔗 Links:',
    '   • GitHub: https://github.com/electerm/electerm',
    '   • Website: https://electerm.org',
    '',
    '💡 Try:  help | ls -la | cat README.md | neofetch | uptime',
    '   ↑/↓ for history · Tab to complete · monitored by the top info bar',
    ''
  ].join('\r\n') + '\r\n'
}

// ---------------------------------------------------------------------------
// Server-info (monitor) fake: `exec-cmd` / `run-cmd` responses
// ---------------------------------------------------------------------------
// The remote-monitor bar + side info panel poll the server with execCmd()
// for a fixed set of commands (see monitor-model.js REMOTE_MONITOR_COMMANDS).
// Answer each with realistic fake output so CPU/mem/net/uptime/users/disks
// panels render live data in the demo.

let netTick = 0

export function fakeExecResult (cmd) {
  const c = String(cmd || '')
  netTick++
  if (c.includes('uname -s -n -r -m')) {
    return `Linux ${HOST} 6.8.0-demo-generic x86_64`
  }
  if (c.includes('PRETTY_NAME')) {
    return 'PRETTY_NAME="Ubuntu 24.04 LTS (Demo)"'
  }
  if (c.includes('/proc/stat')) {
    // two cpu samples; second slightly ahead so usage computes ~12-25%
    const a = 12000 + netTick * 37
    const b = a + 9
    const idleA = 88000 + netTick * 210
    const idleB = idleA + 62
    return `cpu  ${a} 120 3400 ${idleA} 400 0 120 0 0 0\ncpu  ${b} 120 3408 ${idleB} 400 0 120 0 0 0`
  }
  if (c.includes('/proc/meminfo')) {
    const jitter = (netTick * 7919) % 60000
    const total = 4024548
    const free = 1987456 - (jitter % 120000)
    const avail = 3100000 - (jitter % 80000)
    return [
      `MemTotal:        ${total} kB`,
      `MemFree:         ${free} kB`,
      `MemAvailable:    ${avail} kB`,
      'Buffers:           45678 kB',
      'Cached:          1179074 kB',
      'SwapTotal:       2097148 kB',
      'SwapFree:        2097148 kB'
    ].join('\n')
  }
  if (c.includes('/sys/class/net') || c.includes('rx_bytes') || c.includes('ip route show default')) {
    const rx = 128456789 + netTick * 46321
    const tx = 42345678 + netTick * 18907
    return [
      'default\teth0',
      `iface\teth0\tstate=up\tipv4=192.168.1.100/24\trx=${rx}\ttx=${tx}`,
      'iface\tlo\tstate=unknown\tipv4=127.0.0.1/8\trx=12345\ttx=12345'
    ].join('\n')
  }
  if (c.includes('/proc/uptime')) {
    const secs = Math.floor((Date.now() - BOOT_TIME) / 1000)
    return `${secs}.42 ${(secs / 4).toFixed(2)}`
  }
  if (c.trim() === 'who' || c.includes("'who'") || /(^|\s|;|&)who(\s|;|&|$)/.test(c)) {
    return 'demo     pts/0        2026-09-12 10:00 (192.168.1.10)'
  }
  if (c.includes('df -Pk')) {
    return [
      'Filesystem     1024-blocks      Used Available Capacity Mounted on',
      '/dev/sda1        25165824  11534336  13631488      46% /',
      'tmpfs              494592         0    494592       0% /dev/shm'
    ].join('\n')
  }
  if (c.includes('ps -eo')) {
    const rows = [
      '    1 root            0.0      11240 /sbin/init',
      '  457 demo            0.0       5320 /lib/systemd/systemd --user',
      '  799 demo            4.2      88412 node /home/demo/projects/demo/index.js',
      '  921 demo            0.1       4224 sshd: demo@pts/0',
      ' 1337 demo            0.7       5320 -bash',
      ' 2048 demo            0.0       3100 ps -eo pid=,user=,pcpu=,rss=,args= --sort=-pcpu'
    ]
    // vary cpu a bit so the activities panel feels alive
    if (netTick % 3 === 0) rows[2] = rows[2].replace('4.2', '5.8')
    return rows.join('\n')
  }
  // generic fallbacks for other exec probes (shell detect, owner lists, ...)
  if (c.includes('printf "%s\\n" "$SHELL"') || c.includes('$SHELL')) {
    return '/bin/bash'
  }
  if (c.includes('cat /etc/passwd')) {
    return 'root:x:0:0:root:/root:/bin/bash\ndemo:x:1000:1000:demo:/home/demo:/bin/bash\n'
  }
  if (c.includes('cat /etc/group')) {
    return 'root:x:0:\ndemo:x:1000:\n'
  }
  if (c.includes('cat /proc/meminfo') || c.includes('free')) {
    return 'MemTotal:        4024548 kB\nMemFree:         1987456 kB\nMemAvailable:    3100000 kB\n'
  }
  if (c.startsWith('kill ')) return ''
  return ''
}

export function fakeRunCmdResult (cmd) {
  // runCmd returns a plain string (not exec object)
  const s = fakeExecResult(cmd)
  if (s) return s
  // small extras for direct runCmd callers
  const c = String(cmd || '').trim()
  if (c === 'cmd.exe /d /s /c ver') return 'Microsoft Windows [Version 10.0.19045] (demo)\n'
  if (c.startsWith('kill ')) return ''
  return `demo output for: ${c}\n`
}
