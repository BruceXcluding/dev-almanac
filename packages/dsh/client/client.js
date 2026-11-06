// dsh-dev-almanac's browser half: a "程序员黄历" tab in dsh web's right
// sidebar, at parity with the Claude Code pane. The seasonal postcard, 宜/忌
// as a two-column table, 冲煞, 节气, the twelve 时辰, the horoscope for every
// sign, the birthday field and the 签筒.
//
// Plain JavaScript in the host's module-loader format (no build step); React
// comes from the host, colours from dsh's theme tokens (the drawings keep
// their own). Data comes from the plugin's own route, POST
// /api/dev-almanac/panel, behind dsh's browser authentication, so nothing is
// written into the chat.
window.__ModuleLoader__.load({
  id: 'dsh-dev-almanac',
  factory: function (require) {
    var module = { exports: {} }
    var React = require('react')
    var h = React.createElement

    var ID = 'dsh-dev-almanac'
    var KIND = 'dev-almanac'
    var PANEL_URL = '/api/dev-almanac/panel'
    var LINES = 5
    var SHAKE_MS = 1900

    // The language of the last view, for the tab's title; the title redraws when it changes.
    var lastLang = 'zh'
    var langListeners = []
    function setLang(lang) {
      if (lang === lastLang) return
      lastLang = lang
      langListeners.slice().forEach(function (f) {
        f(lang)
      })
    }

    var T = {
      zh: {
        title: '程序员黄历',
        guide: '今日宜忌、星运和求签',
        lang: '🌐 English',
        yi: '宜',
        ji: '忌',
        clash: '冲煞',
        term: '节气',
        hours: '吉时',
        now: '现在',
        more: function (n) {
          return '+' + n + ' 更多'
        },
        less: '收起',
        horoscope: '今日星运',
        you: '（你）',
        overall: '综合',
        coding: '编码',
        debugging: '调试',
        review: '评审',
        color: '幸运色',
        item: '幸运物',
        number: '幸运数字',
        tool: '语言工具',
        hour: '幸运时辰',
        partner: '结对星座',
        helper: '贵人',
        watch: '小心',
        noBirthday: '🎂 填上生日，解锁你的星座与生肖',
        birthday: '🎂 生日',
        save: '保存',
        edit: '修改生日',
        zodiac: '生肖',
        today: '🎋 今日一签',
        hint: '心诚则灵。摇出不满意的，可以再摇。',
        shake: '🎋 摇一摇 · 求签',
        again: '🎋 再摇一次',
        shaking: '摇签中',
        count: function (n) {
          return '今日第 ' + n + ' 摇'
        },
        reading: '解签：',
        nextRetro: function (d) {
          return '下次水逆：' + d
        },
        loading: '正在翻黄历…',
        failed: '黄历打不开：',
        retry: '重试',
        prev: '上一个星座',
        next: '下一个星座',
        moods: ['', '🫠 今日宜躺平', '😅 稳住别浪', '🙂 平平稳稳', '😎 手感火热', '🤩 天选码农'],
        feeds: function (a, b) {
          return a + '生' + b
        },
      },
      en: {
        title: "Programmer's almanac",
        guide: "Today's 宜/忌, horoscope and fortune slips",
        lang: '🌐 中文',
        yi: 'Do',
        ji: "Don't",
        clash: 'Clash',
        term: 'Solar term',
        hours: 'Lucky hours',
        now: 'now',
        more: function (n) {
          return '+' + n + ' more'
        },
        less: 'Show less',
        horoscope: 'Horoscope',
        you: ' (you)',
        overall: 'Overall',
        coding: 'Coding',
        debugging: 'Debugging',
        review: 'Review',
        color: 'Color',
        item: 'Item',
        number: 'Number',
        tool: 'Tool',
        hour: 'Hour',
        partner: 'Pair with',
        helper: 'Helper',
        watch: 'Watch out',
        noBirthday: '🎂 Add your birthday to unlock your sign and zodiac animal',
        birthday: '🎂 Birthday',
        save: 'Save',
        edit: 'Edit birthday',
        zodiac: 'Zodiac',
        today: "🎋 Today's slip",
        hint: 'Concentrate, then shake. Not happy? Shake again.',
        shake: '🎋 Shake · draw a slip',
        again: '🎋 Shake again',
        shaking: 'Shaking the tube',
        count: function (n) {
          return 'shake #' + n + ' today'
        },
        reading: 'Reading: ',
        nextRetro: function (d) {
          return 'Next retrograde: ' + d
        },
        loading: 'Opening the almanac…',
        failed: 'The almanac did not open: ',
        retry: 'Try again',
        prev: 'Previous sign',
        next: 'Next sign',
        moods: ['', '🫠 a couch day', '😅 steady now', '🙂 smooth sailing', '😎 on fire', '🤩 the chosen coder'],
        feeds: function (a, b) {
          var EN = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' }
          return (EN[a] || a) + ' feeds ' + (EN[b] || b)
        },
      },
    }

    // Slip grades, best first: gold, green, cyan, plain, amber, orange, gray.
    var SLIP_TONES = ['var(--da-gold)', 'var(--da-ok)', 'var(--da-accent)', 'var(--da-fg)', 'var(--da-warn)', '#f0883e', 'var(--da-fg3)']

    // ---------------------------------------------------------------- channel

    function ask(request) {
      return fetch(PANEL_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      }).then(function (res) {
        if (!res.ok) throw new Error('dsh refused the request (' + res.status + ')')
        return res.json().then(function (answer) {
          if (!answer || !answer.ok) throw new Error((answer && answer.error) || 'no answer')
          return answer.value
        })
      })
    }

    function svgUrl(svg) {
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    }

    // ---------------------------------------------------------------- styles

    var CSS = [
      '.da{--da-fg:var(--dsw-alias-label-primary,#0f1115);--da-fg2:var(--dsw-alias-label-secondary,#61666b);--da-fg3:var(--dsw-alias-label-tertiary,#81858c);',
      '--da-line:var(--dsw-alias-border-l2,#0000001a);--da-soft:var(--dsw-alias-border-l1,#0000000a);--da-hover:var(--dsw-alias-interactive-bg-hover,#0000000a);',
      '--da-accent:var(--dsw-alias-brand-primary-new-colorprimary-new-color,#4176e6);--da-ok:var(--dsw-alias-state-success-primary,#22a55e);',
      '--da-bad:var(--dsw-alias-state-danger-primary,#d14343);--da-warn:var(--dsw-alias-state-warn-primary,#d9921b);--da-gold:#c9962b;--da-r:var(--dsw-radius-md,8px);',
      'height:100%;overflow:auto;box-sizing:border-box;padding:10px 14px 24px;color:var(--da-fg);font-size:13px;line-height:1.55;font-family:var(--dsw-font-family,inherit)}',
      '.da *{box-sizing:border-box}',
      '.da-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
      '.da-date{flex:1;color:var(--da-fg2)}',
      '.da-btn{white-space:nowrap;border:1px solid var(--da-line);background:transparent;color:var(--da-fg);font:inherit;font-size:12px;padding:4px 10px;border-radius:var(--da-r);cursor:pointer}',
      '.da-btn:hover{background:var(--da-hover)}.da-btn:disabled{opacity:.5;cursor:default}',
      '.da-btn.pri{background:var(--da-accent);border-color:var(--da-accent);color:#fff}',
      '.da-link{border:0;background:none;color:var(--da-fg2);font:inherit;font-size:12px;cursor:pointer;padding:2px 0}',
      '.da-link:hover{color:var(--da-fg)}',
      '.da-card-img{display:block;width:100%;height:auto;border-radius:12px}',
      '.da-lines{margin:8px 2px 0}',
      '.da-dim{color:var(--da-fg3)}.da-flavor{font-style:italic;color:var(--da-fg2)}.da-special{font-weight:600;color:var(--da-gold)}',
      '.da-note{border-left:3px solid var(--da-line);padding:2px 0 2px 8px;margin:8px 0}',
      '.da-note.gold{border-color:var(--da-gold);color:var(--da-gold);font-weight:600}.da-note.warn{border-color:var(--da-warn)}.da-note.bad{border-color:var(--da-bad);color:var(--da-bad)}',
      '.da-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:12px 0}',
      '.da-card{border:1px solid var(--da-line);border-radius:var(--da-r);padding:8px 10px}',
      '.da-card.yi{border-color:color-mix(in srgb,var(--da-ok) 45%,transparent)}.da-card.ji{border-color:color-mix(in srgb,var(--da-bad) 45%,transparent)}',
      '.da-h{font-weight:600;margin-bottom:4px}.da-h.yi{color:var(--da-ok)}.da-h.ji{color:var(--da-bad)}',
      '.da-row{display:flex;gap:8px;align-items:baseline}',
      '.da-term{flex:0 0 5.5em;color:var(--da-fg3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.da-kv{display:flex;gap:8px;align-items:baseline;margin:3px 0}',
      '.da-k{flex:0 0 6em;color:var(--da-fg3)}',
      '.da-chips{display:flex;flex-wrap:wrap;gap:2px}',
      '.da-chip{padding:0 5px;border-radius:4px;color:var(--da-fg3)}.da-chip.good{color:var(--da-ok);font-weight:600}',
      '.da-chip.now{outline:1px solid currentColor}',
      '.da-hs{border:1px solid var(--da-line);border-radius:var(--da-r);padding:10px 12px;margin:12px 0}',
      '.da-hs-top{display:flex;align-items:center;gap:6px;margin-bottom:6px}',
      '.da-hs-title{flex:1;font-weight:600}',
      '.da-nav{border:1px solid var(--da-line);background:transparent;color:var(--da-fg);border-radius:var(--da-r);width:26px;height:24px;cursor:pointer;font:inherit}',
      '.da-nav:hover{background:var(--da-hover)}',
      '.da-stars{color:var(--da-gold);letter-spacing:1px}.da-stars i{font-style:normal;color:var(--da-fg3)}',
      '.da-swatch{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:6px}',
      '.da-advice{margin-top:8px;font-style:italic;color:var(--da-fg2)}',
      '.da-form{display:flex;gap:6px;align-items:center;margin:4px 0 8px;flex-wrap:wrap}',
      '.da-input{border:1px solid var(--da-line);background:transparent;color:var(--da-fg);font:inherit;font-size:12px;padding:4px 8px;border-radius:var(--da-r);width:9.5em}',
      '.da-profile{display:flex;gap:8px;align-items:center;color:var(--da-fg3);margin:0 0 8px}',
      '.da-slip{display:flex;gap:14px;align-items:center;border:1px solid var(--da-line);border-radius:var(--da-r);padding:10px 12px;margin:12px 0}',
      '.da-slip img{flex:0 0 auto;width:92px;height:auto}',
      '.da-slip-body{flex:1;min-width:0}',
      '.da-poem{margin:6px 0 6px 1em;font-style:italic}',
      '.da-err{color:var(--da-bad);margin:6px 0}',
      '.da-foot{margin-top:14px;color:var(--da-fg3);font-size:12px;font-style:italic}',
      '@media (prefers-reduced-motion: reduce){.da *{transition:none!important}}',
    ].join('')

    function useStyles() {
      React.useEffect(function () {
        if (document.getElementById('dsh-dev-almanac-css')) return undefined
        var el = document.createElement('style')
        el.id = 'dsh-dev-almanac-css'
        el.textContent = CSS
        document.head.appendChild(el)
        return undefined
      }, [])
    }

    // ---------------------------------------------------------------- pieces

    function Stars(props) {
      return h('span', { className: 'da-stars' }, '★'.repeat(props.n), h('i', null, '☆'.repeat(5 - props.n)))
    }

    function KV(props) {
      return h('div', { className: 'da-kv' }, h('span', { className: 'da-k' }, props.k), h('span', null, props.children))
    }

    function Activities(props) {
      var list = props.list
      var shown = props.open ? list : list.slice(0, LINES)
      var side = props.isJi ? 'ji' : 'yi'
      return h(
        'div',
        { className: 'da-card ' + side },
        h('div', { className: 'da-h ' + side }, (props.isJi ? '⛔ ' : '✅ ') + props.label),
        shown.map(function (x) {
          return h(
            'div',
            { className: 'da-row', key: x.term },
            h('span', { className: 'da-term', title: x.terms.join('·') }, x.term),
            h('span', null, x.dev === x.term ? '—' : x.dev),
          )
        }),
        list.length > LINES &&
          h(
            'button',
            { className: 'da-link', onClick: props.onToggle },
            props.open ? props.t.less : props.t.more(list.length - LINES),
          ),
      )
    }

    function Horoscope(props) {
      var v = props.view
      var t = props.t
      var i = props.sign
      var sign = v.signs[i]
      var hs = sign.horoscope
      var partner = v.signs[hs.partner]
      var hour = hs.hour ? hs.hour.zhi + (v.lang === 'zh' ? '时 ' : ' ') + hs.hour.range : '—'
      return h(
        'div',
        { className: 'da-hs', style: { borderColor: hs.color.hex } },
        h(
          'div',
          { className: 'da-hs-top' },
          h(
            'span',
            { className: 'da-hs-title' },
            '✦ ' + t.horoscope + '  ',
            h('span', { style: { color: hs.color.hex } }, sign.glyph + ' ' + sign.name),
            i === v.mySign ? h('span', { className: 'da-dim' }, t.you) : null,
          ),
          h('button', { className: 'da-nav', 'aria-label': t.prev, onClick: props.onPrev }, '‹'),
          h('button', { className: 'da-nav', 'aria-label': t.next, onClick: props.onNext }, '›'),
        ),
        props.profile,
        h(KV, { k: t.overall }, h(Stars, { n: hs.overall }), '  ' + (t.moods[hs.overall] || '')),
        h(KV, { k: t.coding }, h(Stars, { n: hs.coding })),
        h(KV, { k: t.debugging }, h(Stars, { n: hs.debugging })),
        h(KV, { k: t.review }, h(Stars, { n: hs.review })),
        h(
          KV,
          { k: t.color },
          h('span', { className: 'da-swatch', style: { background: hs.color.hex } }),
          hs.color.name + ' · ' + hs.color.nickname + '  ',
          h('span', { className: 'da-dim' }, t.feeds(hs.color.element, hs.color.dayElement)),
        ),
        h(KV, { k: t.item }, hs.item),
        h(KV, { k: t.number }, hs.number.what),
        h(KV, { k: t.tool }, hs.tool),
        h(KV, { k: t.hour }, hour),
        h(KV, { k: t.partner }, partner.glyph + ' ' + partner.name),
        h(KV, { k: t.helper }, hs.helper),
        h(KV, { k: t.watch }, hs.watch),
        h('div', { className: 'da-advice' }, '“' + hs.advice + '”'),
      )
    }

    // ---------------------------------------------------------------- the tab

    function AlmanacBody() {
      useStyles()
      var st = React.useState({ phase: 'loading' })
      var state = st[0]
      var setState = st[1]
      var signSt = React.useState(null)
      var openSt = React.useState(false)
      var shakeSt = React.useState(0)
      var editSt = React.useState(false)
      var draftSt = React.useState('')
      var errSt = React.useState(null)
      var alive = React.useRef(true)
      React.useEffect(function () {
        alive.current = true
        return function () {
          alive.current = false
        }
      }, [])

      var run = React.useCallback(function (request) {
        errSt[1](null)
        return ask(request).then(
          function (view) {
            setLang(view.lang)
            if (alive.current) setState({ phase: 'ready', view: view })
            return view
          },
          function (err) {
            if (!alive.current) return undefined
            if (request.op === 'day') setState({ phase: 'failed', error: err.message })
            else errSt[1](err.message)
            return undefined
          },
        )
      }, [])

      React.useEffect(
        function () {
          run({ op: 'day' })
        },
        [run],
      )

      if (state.phase === 'loading') return h('div', { className: 'da' }, h('div', { className: 'da-dim' }, T[lastLang].loading))
      if (state.phase === 'failed') {
        var tf = T[lastLang]
        return h(
          'div',
          { className: 'da' },
          h('div', { className: 'da-err' }, tf.failed + state.error),
          h('button', { className: 'da-btn', onClick: function () { setState({ phase: 'loading' }); run({ op: 'day' }) } }, tf.retry),
        )
      }

      var v = state.view
      var t = T[v.lang]
      var sign = signSt[0] !== null ? signSt[0] : v.mySign !== null ? v.mySign : 0
      var step = function (d) {
        return function () {
          signSt[1]((sign + d + 12) % 12)
        }
      }
      var nowZhi = Math.floor((new Date().getHours() + 1) / 2) % 12
      var shaking = shakeSt[0] > 0

      var shake = function () {
        if (shaking) return
        shakeSt[1](Date.now())
        setTimeout(function () {
          run({ op: 'draw' }).then(function () {
            if (alive.current) shakeSt[1](0)
          })
        }, SHAKE_MS)
      }

      var saveBirthday = function (value) {
        run({ op: 'set', birthday: value }).then(function (view) {
          if (view && alive.current) {
            editSt[1](false)
            signSt[1](null)
          }
        })
      }
      var form = h(
        'form',
        {
          className: 'da-form',
          onSubmit: function (e) {
            e.preventDefault()
            saveBirthday(draftSt[0])
          },
        },
        h('label', { htmlFor: 'da-bday' }, t.birthday),
        h('input', {
          id: 'da-bday',
          className: 'da-input',
          placeholder: 'YYYY-MM-DD',
          value: draftSt[0],
          onChange: function (e) {
            draftSt[1](e.target.value)
          },
        }),
        h('button', { className: 'da-btn', type: 'submit' }, t.save),
      )
      var profile =
        v.birthday === null || editSt[0]
          ? h('div', null, v.birthday === null ? h('div', { style: { color: 'var(--da-gold)' } }, t.noBirthday) : null, form)
          : h(
              'div',
              { className: 'da-profile' },
              h('span', { style: { flex: 1 } }, '🎂 ' + v.birthday + ' · ' + t.zodiac + ' ' + v.myAnimal + ' · ' + v.signs[v.mySign].glyph + ' ' + v.signs[v.mySign].name),
              h(
                'button',
                {
                  className: 'da-link',
                  onClick: function () {
                    draftSt[1](v.birthday)
                    editSt[1](true)
                  },
                },
                t.edit,
              ),
            )

      var special = v.flavor.length > 1 ? v.flavor.slice(0, -1) : []
      var slip = v.slip
      var tone = slip ? SLIP_TONES[slip.rank] || 'var(--da-fg3)' : 'var(--da-line)'

      return h(
        'div',
        { className: 'da' },
        h(
          'div',
          { className: 'da-top' },
          h('span', { className: 'da-date' }, v.date + ' ' + v.weekday),
          h('button', { className: 'da-btn', onClick: function () { run({ op: 'set', lang: v.lang === 'zh' ? 'en' : 'zh' }) } }, t.lang),
        ),
        h('img', { className: 'da-card-img', src: svgUrl(v.art.banner), alt: v.date + ' · ' + v.lunar }),
        h(
          'div',
          { className: 'da-lines' },
          h('div', { className: 'da-dim' }, v.dayGod),
          special.map(function (line) {
            return h('div', { className: 'da-special', key: line }, line)
          }),
          h('div', { className: 'da-flavor' }, v.flavor[v.flavor.length - 1] || ''),
        ),
        v.notices.map(function (n) {
          return h('div', { className: 'da-note ' + n.tone, key: n.text }, n.text)
        }),
        h(
          'div',
          { className: 'da-grid' },
          h(Activities, { list: v.yi, isJi: false, label: t.yi, open: openSt[0], t: t, onToggle: function () { openSt[1](!openSt[0]) } }),
          h(Activities, { list: v.ji, isJi: true, label: t.ji, open: openSt[0], t: t, onToggle: function () { openSt[1](!openSt[0]) } }),
        ),
        h(KV, { k: t.clash }, v.chong),
        h(KV, { k: t.term }, v.solarTerm),
        h(
          KV,
          { k: t.hours },
          h(
            'span',
            { className: 'da-chips' },
            v.hours.map(function (x, i) {
              var cls = 'da-chip' + (x.luck === 'good' ? ' good' : '') + (i === nowZhi ? ' now' : '')
              return h('span', { className: cls, key: x.zhi, title: x.range + (i === nowZhi ? ' · ' + t.now : '') }, x.zhi)
            }),
          ),
        ),
        h(Horoscope, { view: v, t: t, sign: sign, onPrev: step(-1), onNext: step(1), profile: profile }),
        h(
          'div',
          { className: 'da-slip', style: { borderColor: shaking ? 'var(--da-gold)' : tone } },
          h('img', { key: shaking ? 'shaking-' + shakeSt[0] : 'still', src: svgUrl(shaking ? v.art.tubeShaking : v.art.tube), alt: '签筒' }),
          h(
            'div',
            { className: 'da-slip-body' },
            shaking
              ? h('div', { style: { color: 'var(--da-gold)', fontWeight: 600 } }, t.shaking + '…')
              : slip
                ? h(
                    'div',
                    null,
                    h('div', { style: { color: tone, fontWeight: 600 } }, '🎋 ' + (v.lang === 'zh' ? '第 ' + slip.number + ' 签 · ' : 'Slip ' + slip.number + ' · ') + slip.level),
                    h('div', { className: 'da-poem' }, slip.poem[0], h('br'), slip.poem[1]),
                    h('div', { className: 'da-dim' }, t.reading + slip.reading),
                  )
                : h('div', null, h('div', { style: { fontWeight: 600, color: 'var(--da-gold)' } }, t.today), h('div', { className: 'da-dim' }, t.hint)),
            !shaking &&
              h(
                'div',
                { style: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 } },
                h('button', { className: slip ? 'da-btn' : 'da-btn pri', onClick: shake }, slip ? t.again : t.shake),
                slip && slip.count > 1 ? h('span', { className: 'da-dim' }, t.count(slip.count)) : null,
              ),
          ),
        ),
        errSt[0] && h('div', { className: 'da-err' }, errSt[0]),
        h('div', { className: 'da-foot' }, v.disclaimer + (v.nextRetrograde ? '  ·  ' + t.nextRetro(v.nextRetrograde) : '')),
      )
    }

    function AlmanacTitle() {
      var st = React.useState(lastLang)
      React.useEffect(function () {
        var f = function (lang) {
          st[1](lang)
        }
        langListeners.push(f)
        return function () {
          langListeners = langListeners.filter(function (g) {
            return g !== f
          })
        }
      }, [])
      return T[st[0]].title
    }

    module.exports.name = ID
    module.exports.inject = ['slots', 'sidebarRightTabs']
    module.exports.apply = function apply(ctx) {
      ctx.effect(function () {
        return ctx.sidebarRightTabs.register({
          id: ID,
          kind: KIND,
          priority: 'extension',
          title: function () {
            return T[lastLang].title
          },
          guide: [
            {
              id: 'almanac',
              order: 61,
              title: function () {
                return T[lastLang].title
              },
              description: function () {
                return T[lastLang].guide
              },
            },
          ],
        })
      }, 'dev-almanac: tab type')
      ctx.effect(function () {
        return ctx.slots.inject('sidebar.right.pane.tab', function () {
          return ctx.slots.register({ name: 'sidebar.right.pane.tab', key: ID }, AlmanacBody)
        })
      }, 'dev-almanac: tab body')
      ctx.effect(function () {
        return ctx.slots.inject('sidebar.right.pane.tab.title', function () {
          return ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: ID }, AlmanacTitle)
        })
      }, 'dev-almanac: tab title')
    }

    return module.exports
  },
})
