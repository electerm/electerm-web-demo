import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  toCRLF,
  normalizeEchoOpts,
  normalizeTypeOpts,
  resolveTermWrapper,
  echoToTerminalWith,
  clearTerminalWith,
  stopTypingWith,
  typeInTerminalWith
} from '../../../src/client/web-components/terminal-echo.js'

function mockTerm () {
  const writes = []
  return {
    writes,
    term: {
      write (s) {
        writes.push(s)
      },
      focus () {}
    }
  }
}

function mockRefs (map) {
  return {
    get (key) {
      return map[key] || null
    }
  }
}

describe('terminal-echo pure helpers', () => {
  it('toCRLF normalizes lone LF without doubling CRLF', () => {
    assert.equal(toCRLF('a\nb'), 'a\r\nb')
    assert.equal(toCRLF('a\r\nb'), 'a\r\nb')
    assert.equal(toCRLF('a\rb'), 'a\rb')
    assert.equal(toCRLF(''), '')
    assert.equal(toCRLF(null), '')
  })

  it('normalizes echo/type options', () => {
    assert.deepEqual(normalizeEchoOpts('tab1'), { tabId: 'tab1' })
    assert.deepEqual(normalizeEchoOpts(undefined), {})
    assert.deepEqual(normalizeTypeOpts(60), { cps: 60 })
    assert.deepEqual(normalizeTypeOpts(undefined), {})
  })

  it('resolveTermWrapper prefers explicit tabId, falls back to active', () => {
    const t1 = mockTerm()
    const t2 = mockTerm()
    const refs = mockRefs({ 'term-t1': t1, 'term-t2': t2 })
    assert.equal(resolveTermWrapper(refs, 't1'), t1)
    assert.equal(resolveTermWrapper(refs, 't1', 't2'), t2)
    assert.equal(resolveTermWrapper(refs, ''), null)
    assert.equal(resolveTermWrapper(null, 't1'), null)
    assert.equal(resolveTermWrapper(mockRefs({}), 't1'), null)
  })
})

describe('echo/clear', () => {
  it('echoToTerminal writes CRLF to active terminal', () => {
    const t = mockTerm()
    const refs = mockRefs({ 'term-active': t })
    const ok = echoToTerminalWith(
      { refsObj: refs, activeTabId: 'active' },
      'hi\nthere'
    )
    assert.equal(ok, true)
    assert.deepEqual(t.writes, ['hi\r\nthere'])
  })

  it('echoToTerminal targets explicit tabId', () => {
    const t1 = mockTerm()
    const t2 = mockTerm()
    const refs = mockRefs({ 'term-t1': t1, 'term-t2': t2 })
    echoToTerminalWith({ refsObj: refs, activeTabId: 't1' }, 'yo', { tabId: 't2' })
    assert.deepEqual(t1.writes, [])
    assert.deepEqual(t2.writes, ['yo'])
  })

  it('echoToTerminal throws with no terminal', () => {
    assert.throws(
      () => echoToTerminalWith({ refsObj: mockRefs({}), activeTabId: 'x' }, 'hi'),
      /no active terminal/
    )
  })

  it('clearTerminal writes clear sequence', () => {
    const t = mockTerm()
    const refs = mockRefs({ 'term-a': t })
    assert.equal(clearTerminalWith({ refsObj: refs, activeTabId: 'a' }), true)
    assert.deepEqual(t.writes, ['\x1b[2J\x1b[H'])
  })
})

describe('typeInTerminal hacker effect', () => {
  it('types display mode char by char and appends newline on enter', async () => {
    const t = mockTerm()
    const refs = mockRefs({ 'term-a': t })
    const ok = await typeInTerminalWith(
      { refsObj: refs, activeTabId: 'a', state: {} },
      'ab',
      { cps: 100000, enter: true }
    )
    assert.equal(ok, true)
    assert.deepEqual(t.writes, ['a', 'b', '\r\n'])
  })

  it('supports newline option and high-cps fast path', async () => {
    const t = mockTerm()
    const refs = mockRefs({ 'term-a': t })
    await typeInTerminalWith(
      { refsObj: refs, activeTabId: 'a', state: {} },
      'x',
      { cps: 100000, newline: true }
    )
    assert.deepEqual(t.writes, ['x', '\r\n'])
  })

  it('input mode sends through attachAddon and converts LF to CR', async () => {
    const sent = []
    const wrapper = {
      term: { focus () {} },
      attachAddon: { _sendData (s) { sent.push(s) } }
    }
    const refs = mockRefs({ 'term-a': wrapper })
    const ok = await typeInTerminalWith(
      { refsObj: refs, activeTabId: 'a', state: {} },
      'a\nb',
      { cps: 100000, mode: 'input', enter: true }
    )
    assert.equal(ok, true)
    assert.deepEqual(sent, ['a', '\r', 'b', '\r'])
  })

  it('input mode falls back to runQuickCommand and throws when unavailable', async () => {
    const sent = []
    const refs = mockRefs({ 'term-a': { runQuickCommand (s) { sent.push(s) } } })
    await typeInTerminalWith(
      { refsObj: refs, activeTabId: 'a', state: {} },
      'hi',
      { cps: 100000, mode: 'input' }
    )
    assert.deepEqual(sent, ['h', 'i'])
    await assert.rejects(
      typeInTerminalWith(
        { refsObj: mockRefs({ 'term-a': {} }), activeTabId: 'a', state: {} },
        'hi',
        { cps: 100000, mode: 'input' }
      ),
      /terminal input not available/
    )
  })

  it('second call cancels the first (stopTyping)', async () => {
    const t = mockTerm()
    const refs = mockRefs({ 'term-a': t })
    const state = {}
    const slow = typeInTerminalWith(
      { refsObj: refs, activeTabId: 'a', state },
      'abcdef',
      { cps: 20 }
    )
    // let first char land, then cancel
    await new Promise(resolve => setTimeout(resolve, 60))
    stopTypingWith(state)
    const first = await slow
    assert.equal(first, false)
    assert.ok(t.writes.length < 6)
    // fresh call after cancel works
    const ok = await typeInTerminalWith(
      { refsObj: refs, activeTabId: 'a', state },
      'z',
      { cps: 100000 }
    )
    assert.equal(ok, true)
    assert.ok(t.writes.includes('z'))
  })

  it('throws with no terminal', async () => {
    await assert.rejects(
      typeInTerminalWith({ refsObj: mockRefs({}), activeTabId: 'x', state: {} }, 'hi'),
      /no active terminal/
    )
  })
})
