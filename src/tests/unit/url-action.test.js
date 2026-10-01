import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  encodeDemoAction,
  decodeDemoAction,
  buildDemoUrl,
  normalizeDemoActions,
  getActFromLocation,
  runStoreMethod,
  runDemoActions,
  runActFromString
} from '../../../src/client/web-components/url-action.js'

async function withWindow (value, fn) {
  const had = 'window' in globalThis
  const prev = globalThis.window
  globalThis.window = value
  try {
    return await fn()
  } finally {
    if (had) {
      globalThis.window = prev
    } else {
      delete globalThis.window
    }
  }
}

describe('encode/decode', () => {
  it('round-trips single method call', () => {
    const p = { method: 'setLayout', args: ['c2'] }
    assert.deepEqual(decodeDemoAction(encodeDemoAction(p)), p)
  })

  it('round-trips utf-8 + emoji', () => {
    const p = { method: 'addItem', args: [{ title: '中文测试 🎨' }, 'bookmarks'] }
    assert.deepEqual(decodeDemoAction(encodeDemoAction(p)), p)
  })

  it('produces url-safe base64 without padding', () => {
    const s = encodeDemoAction({ method: 'a', args: [1] })
    assert.match(s, /^[A-Za-z0-9-_]+$/)
  })

  it('decodes standard base64 with +/= padding', () => {
    const p = { method: 'setLayout', args: ['c2'] }
    const std = Buffer.from(JSON.stringify(p), 'utf8').toString('base64')
    assert.deepEqual(decodeDemoAction(std), p)
  })

  it('decodes URI-encoded and full-URL paste', () => {
    const p = { method: 'setLayout', args: ['c2'] }
    const s = encodeDemoAction(p)
    assert.deepEqual(decodeDemoAction(encodeURIComponent(s)), p)
    assert.deepEqual(decodeDemoAction(`https://demo.electerm.org/#act=${s}`), p)
  })

  it('throws on empty / invalid input', () => {
    assert.throws(() => decodeDemoAction(''), /empty act/)
    assert.throws(() => decodeDemoAction('!!!'), /invalid base64|not JSON/)
  })

  it('buildDemoUrl appends #act=', () => {
    const url = buildDemoUrl({ method: 'setLayout', args: ['c2'] }, 'https://demo.electerm.org/')
    assert.match(url, /^https:\/\/demo\.electerm\.org\/#act=[A-Za-z0-9-_]+$/)
    assert.deepEqual(decodeDemoAction(url), { method: 'setLayout', args: ['c2'] })
  })
})

describe('normalizeDemoActions', () => {
  it('accepts {method,args}', () => {
    assert.deepEqual(normalizeDemoActions({ method: 'setLayout', args: ['c2'] }), {
      actions: [{ method: 'setLayout', args: ['c2'], delay: 0 }],
      clearHash: false
    })
  })

  it('accepts action/params aliases and wraps single arg', () => {
    const r = normalizeDemoActions({ action: 'setLayout', params: 'c2' })
    assert.deepEqual(r.actions, [{ method: 'setLayout', args: ['c2'], delay: 0 }])
  })

  it('accepts shorthand {storeMethod: value} and {storeMethod: [...]}', () => {
    assert.deepEqual(
      normalizeDemoActions({ setLayout: 'c2' }).actions,
      [{ method: 'setLayout', args: ['c2'], delay: 0 }]
    )
    assert.deepEqual(
      normalizeDemoActions({ handleOpenAIPanel: [] }).actions,
      [{ method: 'handleOpenAIPanel', args: [], delay: 0 }]
    )
    assert.deepEqual(
      normalizeDemoActions({ setConfig: { theme: 'defaultLight' } }).actions,
      [{ method: 'setConfig', args: [{ theme: 'defaultLight' }], delay: 0 }]
    )
  })

  it('accepts batch array and batch objects', () => {
    const batch = [
      { method: 'setLayout', args: ['c2'] },
      { action: 'handleOpenAIPanel', args: [] }
    ]
    assert.equal(normalizeDemoActions(batch).actions.length, 2)
    assert.equal(normalizeDemoActions({ actions: batch }).actions.length, 2)
    assert.equal(normalizeDemoActions({ actionList: batch }).actions.length, 2)
    assert.equal(normalizeDemoActions({ list: batch }).actions.length, 2)
  })

  it('passes through clearHash and delay variants', () => {
    const r = normalizeDemoActions({
      actions: [{ method: 'a', args: [], wait: 100 }],
      clearHash: true
    })
    assert.equal(r.clearHash, true)
    assert.equal(r.actions[0].delay, 100)
    assert.equal(normalizeDemoActions({ method: 'a', args: [], delay: 5 }).actions[0].delay, 5)
    assert.equal(normalizeDemoActions({ method: 'a', args: [], waitBefore: 7 }).actions[0].delay, 7)
  })

  it('rejects invalid payloads', () => {
    assert.throws(() => normalizeDemoActions({}), /empty action|invalid action/)
    assert.throws(() => normalizeDemoActions({ method: 123 }), /invalid action/)
    assert.throws(() => normalizeDemoActions('nope'), /must be an object or array/)
    assert.throws(() => normalizeDemoActions([null]), /must be an object/)
  })
})

describe('getActFromLocation', () => {
  it('parses #act=, #/act=, multi-param hash and ?act= fallback', () => {
    const s = encodeDemoAction({ method: 'a', args: [] })
    assert.equal(getActFromLocation({ hash: `#act=${s}`, search: '' }), s)
    assert.equal(getActFromLocation({ hash: `#/act=${s}`, search: '' }), s)
    assert.equal(getActFromLocation({ hash: `#foo=1&act=${s}`, search: '' }), s)
    assert.equal(getActFromLocation({ hash: '', search: `?act=${s}` }), s)
    // hash wins over query
    assert.equal(
      getActFromLocation({ hash: `#act=${s}`, search: '?act=other' }),
      s
    )
  })

  it('returns empty string when absent', () => {
    assert.equal(getActFromLocation({ hash: '', search: '' }), '')
    assert.equal(getActFromLocation({ hash: '#foo=1', search: '' }), '')
  })
})

describe('runStoreMethod / runDemoActions', () => {
  it('calls store methods and awaits async results', async () => {
    const calls = []
    await withWindow({
      store: {
        async setLayout (v) {
          calls.push(v)
          return 'ok-' + v
        }
      }
    }, async () => {
      const res = await runStoreMethod('setLayout', ['c2'])
      assert.equal(res, 'ok-c2')
      assert.deepEqual(calls, ['c2'])
    })
  })

  it('throws for missing store / method', async () => {
    await withWindow({}, async () => {
      await assert.rejects(runStoreMethod('x', []), /store not ready/)
    })
    await withWindow({ store: {} }, async () => {
      await assert.rejects(runStoreMethod('nope', []), /no method/)
    })
  })

  it('runs batches in order and collects per-action results', async () => {
    const order = []
    await withWindow({
      store: {
        async a () {
          order.push('a')
          return 1
        },
        async b () {
          order.push('b')
          return 2
        },
        async boom () {
          throw new Error('kaput')
        }
      },
      dispatchEvent () {}
    }, async () => {
      const results = await runDemoActions(
        [{ method: 'a', args: [] }, { method: 'boom', args: [] }, { method: 'b', args: [] }],
        { silent: true }
      )
      assert.deepEqual(order, ['a', 'b'])
      assert.equal(results[0].ok, true)
      assert.equal(results[1].ok, false)
      assert.match(results[1].error, /kaput/)
      assert.equal(results[2].ok, true)
      assert.deepEqual(globalThis.window.__demoActionResult, results)
    })
  })

  it('honors per-action delay', async () => {
    await withWindow({
      store: { async a () { return 1 } },
      dispatchEvent () {}
    }, async () => {
      const t0 = Date.now()
      await runDemoActions({ method: 'a', args: [], delay: 60 }, { silent: true })
      assert.ok(Date.now() - t0 >= 50)
    })
  })

  it('runActFromString decodes then runs', async () => {
    await withWindow({
      store: { async setLayout (v) { return v } },
      dispatchEvent () {}
    }, async () => {
      const s = encodeDemoAction({ method: 'setLayout', args: ['c2'] })
      const results = await runActFromString(s, { silent: true })
      assert.equal(results[0].result, 'c2')
    })
  })

  it('clearHash replaces history and strips hash', async () => {
    let replaced = ''
    await withWindow({
      store: { async a () { return 1 } },
      location: { href: 'https://demo.electerm.org/#act=xyz' },
      history: { replaceState: (a, b, url) => { replaced = url } },
      dispatchEvent () {}
    }, async () => {
      await runDemoActions({ actions: [{ method: 'a', args: [] }], clearHash: true }, { silent: true })
      assert.equal(replaced, 'https://demo.electerm.org/')
    })
  })
})
