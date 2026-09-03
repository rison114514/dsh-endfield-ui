window.__ModuleLoader__.load({
  id: '@rison/dsh-endfield-ui',
  factory: (require) => {
    const module = { exports: {} }
    const React = require('react')

    const pair = (light, dark = light) => ({ light, dark })
    const tokens = {
      // DSH resolves `system` to one of these two palettes before applying the
      // override. Keep genuine light/dark pairs here: repeating the old dark
      // values for both modes made portal surfaces inherit light text on a
      // light card (or dark text over the Endfield conversation plate).
      '--dsw-alias-bg-base': pair('#eef0eb', '#090b0d'),
      '--dsw-alias-bg-layer-1': pair('#fafbf7', '#111418'),
      '--dsw-alias-bg-layer-2': pair('#f1f3ee', '#181c20'),
      '--dsw-alias-bg-layer-3': pair('#e7eae5', '#20252a'),
      '--dsw-alias-bg-module-platform': pair('#e9ece7', '#171b1f'),
      '--dsw-alias-bg-multi-select': pair('#dfe3de', '#22272c'),
      '--dsw-alias-bg-overlay': pair('#ffffff', '#22272c'),
      '--dsw-alias-bg-mask-1': pair('rgba(9, 11, 13, 0.34)', 'rgba(0, 0, 0, 0.62)'),
      '--dsw-alias-bg-mask-2': pair('rgba(9, 11, 13, 0.18)', 'rgba(0, 0, 0, 0.34)'),
      '--dsw-alias-bg-mask-3': pair('rgba(0, 0, 0, 0.76)'),
      '--dsw-alias-border-inverted': pair('rgba(17, 20, 23, 0.14)', 'rgba(255, 244, 79, 0.16)'),
      '--dsw-alias-border-inverted2': pair('rgba(17, 20, 23, 0.08)', 'rgba(255, 244, 79, 0.1)'),
      '--dsw-alias-border-l1': pair('rgba(17, 20, 23, 0.11)', 'rgba(255, 244, 79, 0.18)'),
      '--dsw-alias-border-l2-darkmode-thin': pair('rgba(17, 20, 23, 0.16)', 'rgba(255, 244, 79, 0.22)'),
      '--dsw-alias-border-l2': pair('rgba(17, 20, 23, 0.2)', 'rgba(255, 244, 79, 0.28)'),
      '--dsw-alias-border-l3': pair('rgba(17, 20, 23, 0.34)', 'rgba(255, 244, 79, 0.42)'),
      '--dsw-alias-border-l4': pair('rgba(17, 20, 23, 0.48)', '#fff44f'),
      '--dsw-alias-brand-primary': pair('#665f00', '#fff44f'),
      '--dsw-alias-brand-primary-invert': pair('#090b0d'),
      '--dsw-alias-brand-text': pair('#665f00', '#fff44f'),
      '--dsw-alias-label-primary': pair('#111417', '#f5f6f2'),
      '--dsw-alias-label-primary-bluish': pair('#302a00', '#fff44f'),
      '--dsw-alias-label-primary-dimmed': pair('#2f3539', '#c7cbc6'),
      '--dsw-alias-label-primary-foreground': pair('#090b0d'),
      '--dsw-alias-label-primary-inverted': pair('#090b0d'),
      '--dsw-alias-label-secondary': pair('#4d555b', '#aeb4b8'),
      '--dsw-alias-label-tertiary': pair('#687177', '#858c92'),
      '--dsw-alias-label-caption': pair('#7b848a', '#6f777d'),
      '--dsw-alias-label-dimmed': pair('#a8afad', '#555c62'),
      '--dsw-alias-button-primary-fill': pair('#fff44f'),
      '--dsw-alias-button-primary-hover': pair('#e2d800'),
      '--dsw-alias-button-primary-dimmed': pair('#d8d7af', '#4b4a29'),
      '--dsw-alias-button-contrast-fill': pair('#333a3f', '#f5f6f2'),
      '--dsw-alias-button-elevated-fill': pair('#fafbf7', '#23282d'),
      '--dsw-alias-button-floating-fill': pair('#ecefea', '#20252a'),
      '--dsw-alias-button-floating-hover': pair('#dfe3de', '#30363c'),
      '--dsw-alias-button-ghost-active-border': pair('#665f00', '#fff44f'),
      '--dsw-alias-button-ghost-active-fill': pair('rgba(255, 244, 79, 0.12)'),
      '--dsw-alias-button-ghost-active-hover': pair('rgba(255, 244, 79, 0.18)'),
      '--dsw-alias-button-info-fill': pair('#fff44f'),
      '--dsw-alias-button-info-hover': pair('#e2d800'),
      '--dsw-alias-interactive-bg-active': pair('rgba(255, 244, 79, 0.16)'),
      '--dsw-alias-interactive-bg-hover-accent': pair('rgba(255, 244, 79, 0.18)'),
      '--dsw-alias-interactive-bg-hover-solid': pair('#dfe3de', '#2b3035'),
      '--dsw-alias-interactive-bg-hover': pair('rgba(255, 244, 79, 0.08)'),
      '--dsw-alias-markdown-code-block-banner': pair('#e7eae5', '#161a1e'),
      '--dsw-alias-markdown-code-block': pair('#f5f6f2', '#0b0e10'),
      '--dsw-alias-markdown-inline-code': pair('#e5e8e3', '#20252a'),
      '--dsw-alias-markdown-placeholder': pair('#ecefea', '#14181b'),
      '--dsw-alias-markdown-tag': pair('#e4e7e2', '#1d2226'),
      '--dsw-alias-scrollbar-bg-l1': pair('#9da5a2', '#fff44f'),
      '--dsw-alias-scrollbar-bg-l2': pair('#aab1ae', '#fff44f'),
      '--dsw-alias-scrollbar-hover-l1': pair('#60696e', '#ffffff'),
      '--dsw-alias-scrollbar-hover-l2': pair('#60696e', '#ffffff'),
      '--dsw-alias-state-business-primary': pair('#665f00', '#fff44f'),
      '--dsw-alias-state-business-tertiary': pair('rgba(126, 117, 0, 0.14)', 'rgba(255, 244, 79, 0.13)'),
      '--dsw-alias-state-success-primary': pair('#2e7324', '#8eef5b'),
      '--dsw-alias-state-success-secondary': pair('#477f34', '#65bd3c'),
      '--dsw-alias-state-success-tertiary': pair('rgba(46, 115, 36, 0.12)', 'rgba(142, 239, 91, 0.12)'),
      '--dsw-alias-state-warn-label': pair('#665f00', '#fff44f'),
      '--dsw-alias-state-warn-primary': pair('#716800', '#fff44f'),
      '--dsw-alias-state-warn-secondary': pair('#8a8000', '#d9cd00'),
      '--dsw-alias-state-warn-tertiary': pair('rgba(126, 117, 0, 0.13)', 'rgba(255, 244, 79, 0.12)'),
      '--dsw-alias-toast-bg': pair('#333a3f', '#20252a'),
      '--dsw-alias-tooltip-bg': pair('#20252a', '#111418'),
      '--dsw-specific-menu': pair('#ffffff', '#1b2024'),
      '--dsw-specific-sidebar-fill': pair('#e9ece7', '#0d1013'),
      '--dsw-specific-sidebar-nav-item-active-accent': pair('rgba(126, 117, 0, 0.18)', 'rgba(255, 244, 79, 0.18)'),
      '--dsw-specific-sidebar-nav-item-active': pair('rgba(126, 117, 0, 0.13)', 'rgba(255, 244, 79, 0.12)'),
      '--dsw-specific-sidebar-nav-item-hover': pair('rgba(17, 20, 23, 0.06)', 'rgba(255, 244, 79, 0.07)'),
      '--dsw-specific-tip': pair('#f5f6f2', '#1b2024'),
      '--dsw-specific-input-major': pair('#f8f9f5', '#20252a'),
      '--dsw-specific-selector': pair('#e7eae5', '#2b3035'),
      '--dsw-specific-bubble': pair('#e8ecf2', '#20252a'),
      '--dsw-specific-bubble-highlight': pair('#d8dee8', '#30363c'),
    }

    // Shikitor 1.0.2 remains the sole owner of sender projection, selection
    // and caret coordinates. Its inline-token plugin measures immediately
    // after rewriting a line, though, while the browser can finish wrapping
    // that line one layout later. This is observable when a long soft-wrapped
    // paragraph is split with Shift+Enter: the cached Y coordinate omits the
    // visual rows above it until another edit happens.
    //
    // Do not add a second geometry engine here. Observe only the rendered line
    // boxes and invalidate Shikitor through its existing output-scroll path
    // after their size/structure settles. Shikitor then remeasures and
    // publishes its own cursor variables from the final layout.
    function connectComposerReflowSync() {
      const attached = new Map()

      const attach = (target) => {
        if (!(target instanceof HTMLElement) || attached.has(target)) return
        const output = target && target.querySelector('.shikitor-output')
        const lineStack = target && target.querySelector('.shikitor-output-lines')
        const view = output && output.ownerDocument && output.ownerDocument.defaultView
        const ResizeObserverClass = typeof ResizeObserver === 'function' ? ResizeObserver : undefined
        const MutationObserverClass = MutationObserver
        if (!output || !lineStack || !view || !MutationObserverClass) return

        target.setAttribute('data-endfield-composer-reflow-sync', 'ready')
        let disposed = false
        let invalidateFrame
        let checkFrame

        const layoutSignature = () => {
          const stackRect = lineStack.getBoundingClientRect()
          const rows = Array.from(lineStack.querySelectorAll('.shikitor-output-line'))
            .map((line) => {
              const rect = line.getBoundingClientRect()
              return `${Math.round(rect.width * 4)}/${Math.round(rect.height * 4)}`
            })
          return `${Math.round(stackRect.width * 4)}:${rows.join(',')}`
        }
        let previousLayout = layoutSignature()

        const invalidate = () => {
          if (disposed || invalidateFrame !== undefined) return
          // ResizeObserver already runs after layout. One animation frame lets
          // React/Shiki finish the same edit transaction before asking the
          // built-in token plugin to refresh its cached boundaries.
          invalidateFrame = view.requestAnimationFrame(() => {
            invalidateFrame = undefined
            if (disposed) return
            target.setAttribute('data-endfield-composer-reflow-sync', 'invalidated')
            output.dispatchEvent(new view.Event('scroll'))
          })
        }

        const checkLayout = () => {
          if (disposed || checkFrame !== undefined) return
          checkFrame = view.requestAnimationFrame(() => {
            checkFrame = undefined
            if (disposed) return
            const nextLayout = layoutSignature()
            if (nextLayout === previousLayout) return
            previousLayout = nextLayout
            invalidate()
          })
        }

        // Shikitor rewrites inline spans for ordinary edits. Watching the
        // subtree is safe because those mutations only schedule an O(lines)
        // box signature check; its expensive character-boundary refresh runs
        // only when wrapping or explicit line structure actually changed.
        const mutationObserver = new MutationObserverClass(checkLayout)
        mutationObserver.observe(lineStack, {
          characterData: true,
          childList: true,
          subtree: true,
        })
        const resizeObserver = ResizeObserverClass
          ? new ResizeObserverClass(checkLayout)
          : undefined
        resizeObserver && resizeObserver.observe(lineStack)
        view.addEventListener('resize', checkLayout)

        // Correct a sender that mounted after its first wrapped render before
        // any later input/resize mutation occurs.
        invalidate()

        const dispose = () => {
          disposed = true
          mutationObserver.disconnect()
          resizeObserver && resizeObserver.disconnect()
          view.removeEventListener('resize', checkLayout)
          if (invalidateFrame !== undefined) view.cancelAnimationFrame(invalidateFrame)
          if (checkFrame !== undefined) view.cancelAnimationFrame(checkFrame)
          target.removeAttribute('data-endfield-composer-reflow-sync')
        }
        attached.set(target, dispose)
      }

      const scan = (root) => {
        if (root instanceof Element) {
          const owner = root.matches('.shikitor--attached')
            ? root
            : root.closest('.shikitor--attached')
          if (owner) attach(owner)
        }
        if (root && typeof root.querySelectorAll === 'function') {
          root.querySelectorAll('.shikitor--attached').forEach(attach)
        }
        for (const [target, dispose] of attached) {
          if (target.isConnected) continue
          dispose()
          attached.delete(target)
        }
      }

      scan(document.body)
      const documentObserver = new MutationObserver((records) => {
        for (const record of records) record.addedNodes.forEach(scan)
      })
      documentObserver.observe(document.body, { childList: true, subtree: true })
      return () => {
        documentObserver.disconnect()
        for (const dispose of attached.values()) dispose()
        attached.clear()
      }
    }

    function BootSequence() {
      return React.createElement('div', { className: 'ef-boot', 'aria-hidden': true },
        React.createElement('div', { className: 'ef-boot-grid' }),
        React.createElement('div', { className: 'ef-boot-rings' },
          React.createElement('img', { src: '/endfield-ui/assets/ring.png', alt: '' }),
        ),
        React.createElement('div', { className: 'ef-boot-index' },
          React.createElement('i'),
          React.createElement('span', null, 'WB / STARTUP PROCEDURE', React.createElement('br'), 'LOCAL AGENT OPERATIONS'),
        ),
        React.createElement('div', { className: 'ef-boot-count' }),
        React.createElement('div', { className: 'ef-boot-diagnostic ef-boot-diagnostic-left' },
          React.createElement('b', null, '01'),
          React.createElement('span', null, 'CORDIS BUS'),
          React.createElement('em', null, 'CONNECTED'),
        ),
        React.createElement('div', { className: 'ef-boot-diagnostic ef-boot-diagnostic-right' },
          React.createElement('b', null, '02'),
          React.createElement('span', null, 'OPERATOR LINK'),
          React.createElement('em', null, 'SYNCHRONIZED'),
        ),
        React.createElement('div', { className: 'ef-boot-center' },
          React.createElement('div', { className: 'ef-boot-brand' },
            React.createElement('img', { src: '/endfield-ui/assets/endfield-logo.png', alt: '' }),
            React.createElement('i'),
            React.createElement('img', { src: '/endfield-ui/assets/deepseek-harness-brand.png', alt: '' }),
          ),
          React.createElement('strong', null, 'DEEPSEEK HARNESS'),
          React.createElement('span', null, 'ENDFIELD WORKBENCH / CORDIS PLUGIN SURFACE'),
        ),
        React.createElement('div', { className: 'ef-boot-progress' },
          React.createElement('div', null, React.createElement('i')),
          React.createElement('b', null, 'CORE LINK / INITIALIZING'),
          React.createElement('em', null, 'RESOURCE PACKAGE 07-A'),
        ),
        React.createElement('div', { className: 'ef-boot-wipe' }),
      )
    }

    function Corner({ position }) {
      return React.createElement('i', { className: `ef-corner ef-corner-${position}` })
    }

    // --------------------------------------------------------------------
    // Circular context-usage ring (bottom-right) — REAL data, no simulation.
    //
    // Official data source: dsh's `contextPressure` projection, computed by the
    // host `tokenMeter` service from the provider's *real* reported token usage
    // and the request's context window. The native composer `ContextMeter` reads
    // it through the session-scoped `useProjection('contextPressure')` hook,
    // which (client.js:8754) resolves to exactly
    //     binding.session.projections.faceOf('contextPressure')
    // A root-scope slot (shell.overlay) is NOT handed `useProjection`, so we
    // subscribe to that same ProjectionValueStore off the official `ctx.sessions`
    // service instead. The numerator mirrors the native component
    // (client.js:2802): `projectedTokens ?? pressureTokens`; the value is null
    // until both it and `contextWindow` are known (no provider usage yet).
    //
    // The store is a plain external source decoupled from React: even if the
    // subscription never connects, the ring simply shows its idle state and the
    // rest of the overlay still renders — a data failure can never blank the UI.
    // --------------------------------------------------------------------
    const ringStore = {
      value: undefined,
      listeners: new Set(),
      getSnapshot() { return this.value },
      subscribe(listener) {
        this.listeners.add(listener)
        return () => { this.listeners.delete(listener) }
      },
      set(value) {
        if (this.value === value) return
        this.value = value
        this.listeners.forEach((l) => { try { l() } catch (e) {} })
      },
    }

    function connectRing(ctx) {
      let listUnsub = null
      let projUnsub = null
      let currentId = undefined
      let retries = 0
      let retryTimer = null

      const getSessions = () => {
        try {
          if (ctx && ctx.sessions) return ctx.sessions
          if (ctx && typeof ctx.get === 'function') return ctx.get('sessions')
        } catch (e) { /* service not ready yet */ }
        return undefined
      }
      const readFace = () => {
        const sessions = getSessions()
        if (!sessions || typeof sessions.binding !== 'function') { ringStore.set(undefined); return }
        const id = currentId
        if (!id) { ringStore.set(undefined); return }
        try {
          const binding = sessions.binding(id)
          const session = binding && binding.session
          const store = session && session.projections
          const face = store && typeof store.faceOf === 'function' ? store.faceOf('contextPressure') : undefined
          ringStore.set(face && typeof face.getSnapshot === 'function' ? face.getSnapshot() : undefined)
        } catch (e) { ringStore.set(undefined) }
      }
      const onList = () => {
        const sessions = getSessions()
        if (!sessions || !sessions.list) { scheduleRetry(); return }
        let state
        try { state = typeof sessions.list.getSnapshot === 'function' ? sessions.list.getSnapshot() : undefined } catch (e) { state = undefined }
        const id = state && state.current
        if (id !== currentId) {
          currentId = id
          if (projUnsub) { try { projUnsub() } catch (e) {} projUnsub = null }
          if (id) {
            try {
              const binding = sessions.binding(id)
              const session = binding && binding.session
              const store = session && session.projections
              const face = store && typeof store.faceOf === 'function' ? store.faceOf('contextPressure') : undefined
              if (face && typeof face.subscribe === 'function') {
                projUnsub = face.subscribe(readFace)
                readFace()
              } else { ringStore.set(undefined) }
            } catch (e) { ringStore.set(undefined) }
          } else { ringStore.set(undefined) }
        } else { readFace() }
      }
      const scheduleRetry = () => {
        if (retryTimer || retries >= 12) return
        retries += 1
        retryTimer = setTimeout(() => { retryTimer = null; onList() }, 300)
      }

      try {
        const sessions = getSessions()
        if (sessions && sessions.list && typeof sessions.list.subscribe === 'function') {
          listUnsub = sessions.list.subscribe(onList)
        }
      } catch (e) {}
      onList()

      return () => {
        if (retryTimer) clearTimeout(retryTimer)
        if (listUnsub) { try { listUnsub() } catch (e) {} }
        if (projUnsub) { try { projUnsub() } catch (e) {} }
      }
    }

    function formatTokens(n) {
      if (n == null || typeof n !== 'number') return null
      if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
      return String(n)
    }

    const RING_R = 40
    const RING_C = 2 * Math.PI * RING_R

    // Error boundary: if anything inside throws, drop only the ring — never the
    // whole overlay (the previous failure mode that blanked the background too).
    class RingBoundary extends React.Component {
      constructor(props) { super(props); this.state = { failed: false } }
      static getDerivedStateFromError() { return { failed: true } }
      componentDidCatch() {}
      render() { return this.state.failed ? null : this.props.children }
    }

    function ContextRing() {
      const [pressure, setPressure] = React.useState(ringStore.getSnapshot())
      React.useEffect(() => {
        const listener = () => { try { setPressure(ringStore.getSnapshot()) } catch (e) {} }
        const unsub = ringStore.subscribe(listener)
        setPressure(ringStore.getSnapshot())
        return unsub
      }, [])
      const p = pressure || {}
      const window = p.contextWindow
      const used = p.projectedTokens != null ? p.projectedTokens : p.pressureTokens
      const hasData = window != null && used != null
      const pct = hasData ? Math.min(100, Math.round((used / window) * 100)) : null
      const offset = RING_C * (1 - (pct == null ? 0 : pct) / 100)
      const sub = hasData ? `${formatTokens(used)} / ${formatTokens(window)}` : null
      return React.createElement('div', { className: 'ef-context-ring', 'aria-hidden': true },
        React.createElement('svg', { viewBox: '0 0 100 100' },
          React.createElement('circle', { className: 'ef-ring-track', cx: 50, cy: 50, r: RING_R, fill: 'none', strokeWidth: 7 }),
          React.createElement('circle', { className: 'ef-ring-prog', cx: 50, cy: 50, r: RING_R, fill: 'none', strokeWidth: 7, strokeDasharray: RING_C, strokeDashoffset: offset }),
        ),
        React.createElement('div', { className: 'ef-ring-value' }, pct == null ? '—' : pct, React.createElement('small', null, pct == null ? '' : '%')),
        React.createElement('div', { className: 'ef-ring-label' },
          React.createElement('span', { className: 'ef-ring-label-main' }, hasData ? 'CONTEXT' : 'CONTEXT · IDLE'),
          sub ? React.createElement('span', { className: 'ef-ring-label-sub' }, sub) : null,
        ),
      )
    }

    function EndfieldOverlay() {
      return React.createElement(React.Fragment, null,
        React.createElement(BootSequence),
        React.createElement('div', { className: 'ef-overlay', 'aria-hidden': true },
          React.createElement('div', { className: 'ef-atmosphere' },
            React.createElement('img', { className: 'ef-atmosphere-ring', src: '/endfield-ui/assets/ring.png', alt: '' }),
            React.createElement('img', { className: 'ef-atmosphere-operator', src: '/endfield-ui/assets/operator-xaihi.png', alt: '' }),
            React.createElement('img', { className: 'ef-atmosphere-triangles', src: '/endfield-ui/assets/triangles.svg', alt: '' }),
          ),
          React.createElement('div', { className: 'ef-titlebar' },
            React.createElement('span', { className: 'ef-product' }, 'DSH / WORKBENCH'),
            React.createElement('span', { className: 'ef-track' }, React.createElement('i')),
            React.createElement('span', { className: 'ef-titlebar-copy' }, '// OPERATOR TERMINAL · CORDIS PLUGIN SURFACE'),
            React.createElement('b', null, React.createElement('i'), 'SYSTEM ONLINE'),
          ),
          React.createElement('div', { className: 'ef-attribute-rail' },
            React.createElement('span', null, React.createElement('img', { src: '/endfield-ui/assets/prof-caster.jpg', alt: '' }), React.createElement('small', null, 'CASTER')),
            React.createElement('span', null, React.createElement('img', { src: '/endfield-ui/assets/prof-support.jpg', alt: '' }), React.createElement('small', null, 'SUPPORT')),
            React.createElement('span', null, React.createElement('img', { src: '/endfield-ui/assets/ele-electric.jpg', alt: '' }), React.createElement('small', null, 'ELECTRIC')),
            React.createElement('span', null, React.createElement('img', { src: '/endfield-ui/assets/ele-ice.jpg', alt: '' }), React.createElement('small', null, 'CRYO')),
          ),
          React.createElement(RingBoundary, null, React.createElement(ContextRing)),
          React.createElement('div', { className: 'ef-watermark' },
            React.createElement('img', { src: '/endfield-ui/assets/endfield-logo.png', alt: '' }),
          ),
          React.createElement('div', { className: 'ef-side-copy' }, 'DEEPSEEK HARNESS', React.createElement('br'), 'LOCAL AGENT OPERATIONS'),
          React.createElement('div', { className: 'ef-bottom-status' },
            React.createElement('span', null, 'CORE / 01'),
            React.createElement('i'),
            React.createElement('span', null, 'OPERATOR LINK'),
            React.createElement('b'),
            React.createElement('span', null, '万物皆可插件'),
          ),
          React.createElement(Corner, { position: 'tl' }),
          React.createElement(Corner, { position: 'tr' }),
          React.createElement(Corner, { position: 'bl' }),
          React.createElement(Corner, { position: 'br' }),
        ),
      )
    }

    // --------------------------------------------------------------------
    // Native Goal projection -> dsh-better-sidebar OBJECTIVE tab.
    //
    // There is deliberately no Goal store here. Every render and mutation
    // reads the authoritative, session-scoped `goal` projection. Mutations
    // use the same CAS ref ({id, revision}) and Remote service as GoalBar.
    // 0.18 publishes the same `betterSidebar` service; resolve through
    // `ctx.get` first so fiber inject order cannot hide it from this adapter.
    function sidebarOf(ctx) {
      try {
        if (typeof ctx.get === 'function') {
          const service = ctx.get('betterSidebar')
          if (service) return service
        }
      } catch (e) {}
      return ctx.betterSidebar
    }
    // --------------------------------------------------------------------
    const objectiveBadgeBySession = new Map()

    function goalFace(ctx, sessionId) {
      try {
        const binding = ctx.sessions && ctx.sessions.binding(sessionId)
        const projections = binding && binding.session && binding.session.projections
        return projections && typeof projections.faceOf === 'function'
          ? projections.faceOf('goal')
          : undefined
      } catch (e) { return undefined }
    }

    function readGoal(ctx, sessionId) {
      const face = goalFace(ctx, sessionId)
      try {
        const projection = face && typeof face.getSnapshot === 'function' ? face.getSnapshot() : undefined
        return projection == null ? projection : projection.goal
      } catch (e) { return undefined }
    }

    function useNativeGoal(ctx, sessionId) {
      const [goal, setGoal] = React.useState(() => readGoal(ctx, sessionId))
      React.useEffect(() => {
        let disposed = false
        let unsubscribe = null
        let retry = null
        let attempts = 0
        const update = () => {
          if (!disposed) setGoal(readGoal(ctx, sessionId))
        }
        const attach = () => {
          if (disposed) return
          const face = goalFace(ctx, sessionId)
          if (face && typeof face.subscribe === 'function') {
            unsubscribe = face.subscribe(update)
            update()
            return
          }
          update()
          if (attempts++ < 12) retry = setTimeout(attach, 250)
        }
        attach()
        return () => {
          disposed = true
          if (retry) clearTimeout(retry)
          if (unsubscribe) { try { unsubscribe() } catch (e) {} }
        }
      }, [ctx, sessionId])
      return goal
    }

    const PHASE_COPY = {
      active: ['ACTIVE', '执行中'],
      paused: ['PAUSED', '已暂停'],
      blocked: ['BLOCKED', '已阻塞'],
      complete: ['COMPLETE', '已完成'],
    }

    class ObjectiveBoundary extends React.Component {
      constructor(props) { super(props); this.state = { failed: false } }
      static getDerivedStateFromError() { return { failed: true } }
      componentDidCatch() {}
      render() {
        if (!this.state.failed) return this.props.children
        return React.createElement('section', {
          className: 'ef-objective ef-objective-empty',
          'data-endfield-objective': 'error',
        },
        React.createElement('div', { className: 'ef-objective-index' }, 'OBJ / ERR'),
        React.createElement('h2', null, 'OBJECTIVE LINK OFFLINE'),
        React.createElement('p', null, 'Goal 工作台暂时不可用；原生 GoalBar 与 /goal 不受影响。'))
      }
    }

    function ObjectiveWorkbench({ ctx, scope }) {
      const goal = useNativeGoal(ctx, scope.sessionId)
      const [editing, setEditing] = React.useState(false)
      const [draft, setDraft] = React.useState('')
      const [pending, setPending] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [clearedId, setClearedId] = React.useState(null)
      const pendingRef = React.useRef(false)
      const goalId = goal && goal.id

      React.useEffect(() => {
        setEditing(false)
        setError(null)
        setClearedId(null)
      }, [goalId])

      const runAction = React.useCallback(async (verb, objective) => {
        if (pendingRef.current) return false
        const latest = readGoal(ctx, scope.sessionId)
        if (!latest || !latest.id || latest.revision == null) {
          setError('当前会话没有可操作的 Goal')
          return false
        }
        const ref = { id: latest.id, revision: latest.revision }
        pendingRef.current = true
        setPending(true)
        setError(null)
        try {
          let result
          if (verb === 'edit') result = await ctx.remote.goals.edit(scope.sessionId, ref, { objective })
          else if (verb === 'pause') result = await ctx.remote.goals.pause(scope.sessionId, ref)
          else if (verb === 'resume') result = await ctx.remote.goals.resume(scope.sessionId, ref)
          else result = await ctx.remote.goals.clear(scope.sessionId, ref)
          if (!result || !result.ok) {
            const detail = result && result.error
            setError(detail ? `${detail.message} (${detail.code})` : 'Goal 操作失败')
            return false
          }
          return true
        } catch (e) {
          setError(e && e.message ? e.message : String(e))
          return false
        } finally {
          pendingRef.current = false
          setPending(false)
        }
      }, [ctx, scope.sessionId])

      const visibleGoal = goal && goal.phase !== 'complete' && goal.id !== clearedId ? goal : null
      if (!visibleGoal) {
        return React.createElement('section', {
          className: 'ef-objective ef-objective-empty',
          'data-endfield-objective': 'empty',
        },
          React.createElement('div', { className: 'ef-objective-index' }, 'OBJ / 00'),
          React.createElement('div', { className: 'ef-objective-empty-mark', 'aria-hidden': true }, '+'),
          React.createElement('h2', null, 'NO ACTIVE OBJECTIVE'),
          React.createElement('p', null, '当前会话尚未设置持久目标。'),
          React.createElement('code', null, '/goal <目标>'),
          React.createElement('small', null, 'GOAL STATE IS PROVIDED BY DSH CORE'),
        )
      }

      const phase = PHASE_COPY[visibleGoal.phase] || [String(visibleGoal.phase).toUpperCase(), visibleGoal.phase]
      const blocked = visibleGoal.phase === 'blocked' && visibleGoal.blockedReason
      const saveEdit = async () => {
        const objective = draft.trim()
        if (!objective) return
        if (await runAction('edit', objective)) setEditing(false)
      }
      const clearGoal = async () => {
        if (await runAction('clear')) setClearedId(visibleGoal.id)
      }

      return React.createElement('section', {
        className: 'ef-objective',
        'data-endfield-objective': 'active',
        'data-phase': visibleGoal.phase,
      },
        React.createElement('header', { className: 'ef-objective-header' },
          React.createElement('div', null,
            React.createElement('span', null, 'CURRENT OBJECTIVE'),
            React.createElement('small', null, `SESSION / ${scope.sessionId.slice(0, 8).toUpperCase()}`),
          ),
          React.createElement('b', null, phase[0]),
        ),
        React.createElement('div', { className: 'ef-objective-rule' }, React.createElement('i')),
        editing
          ? React.createElement('div', { className: 'ef-objective-editor' },
              React.createElement('textarea', {
                value: draft,
                autoFocus: true,
                'aria-label': '编辑 Goal',
                onChange: (event) => setDraft(event.target.value),
                onKeyDown: (event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') saveEdit()
                  if (event.key === 'Escape') setEditing(false)
                },
              }),
              React.createElement('small', null, '⌘/CTRL + ENTER 保存 · ESC 取消'),
            )
          : React.createElement('div', { className: 'ef-objective-copy' },
              React.createElement('span', null, '01'),
              React.createElement('h2', null, visibleGoal.objective),
            ),
        blocked ? React.createElement('div', { className: 'ef-objective-blocked' },
          React.createElement('b', null, 'BLOCKING CONDITION'),
          React.createElement('p', null, blocked.message || String(blocked)),
        ) : null,
        error ? React.createElement('div', { className: 'ef-objective-error', role: 'alert' }, error) : null,
        React.createElement('footer', { className: 'ef-objective-actions' },
          editing
            ? React.createElement(React.Fragment, null,
                React.createElement('button', { type: 'button', disabled: pending || !draft.trim(), onClick: saveEdit }, '保存 / SAVE'),
                React.createElement('button', { type: 'button', disabled: pending, onClick: () => setEditing(false) }, '取消 / CANCEL'),
              )
            : React.createElement(React.Fragment, null,
                visibleGoal.phase === 'active'
                  ? React.createElement('button', { type: 'button', disabled: pending, onClick: () => runAction('pause') }, '暂停 / PAUSE')
                  : null,
                visibleGoal.phase === 'paused'
                  ? React.createElement('button', { type: 'button', disabled: pending, onClick: () => runAction('resume') }, '恢复 / RESUME')
                  : null,
                React.createElement('button', {
                  type: 'button', disabled: pending,
                  onClick: () => { setDraft(visibleGoal.objective); setEditing(true) },
                }, '编辑 / EDIT'),
                React.createElement('button', { type: 'button', disabled: pending, onClick: clearGoal }, '清除 / CLEAR'),
              ),
          pending ? React.createElement('span', null, 'SYNCING…') : React.createElement('span', null, phase[1]),
        ),
      )
    }

    function connectObjectiveAutoOpen(ctx) {
      let listUnsub = null
      let projectionUnsub = null
      let currentId
      let currentFace
      const openedGoalBySession = new Map()

      const update = () => {
        if (!currentId) return
        const goal = readGoal(ctx, currentId)
        const phase = goal && goal.phase
        objectiveBadgeBySession.set(currentId, phase && phase !== 'complete' ? phase.toUpperCase() : null)
        try {
          const sidebar = sidebarOf(ctx)
          const snapshot = sidebar.getSnapshot()
          const hasTab = snapshot && snapshot.state && JSON.stringify(snapshot.state).includes('endfield:objective')
          if (hasTab && sidebar.features.includes('updateTab')) {
            sidebar.updateTab('endfield:objective', { meta: { phase: phase || null } })
          }
        } catch (e) {}
        if (!goal || !['active', 'paused', 'blocked'].includes(phase)) return
        if (openedGoalBySession.get(currentId) === goal.id) return
        openedGoalBySession.set(currentId, goal.id)
        try {
          sidebarOf(ctx).openTab(
            { type: 'endfield:objective', title: 'OBJECTIVE' },
            { sessionId: currentId },
          )
        } catch (e) {}
      }

      const bindCurrent = () => {
        let state
        try { state = ctx.sessions.list.getSnapshot() } catch (e) { state = undefined }
        const nextId = state && state.current
        if (nextId === currentId && currentFace) { update(); return }
        if (projectionUnsub) { try { projectionUnsub() } catch (e) {} projectionUnsub = null }
        currentId = nextId
        currentFace = currentId ? goalFace(ctx, currentId) : undefined
        if (currentFace && typeof currentFace.subscribe === 'function') {
          projectionUnsub = currentFace.subscribe(update)
        }
        update()
      }

      if (ctx.sessions.list && typeof ctx.sessions.list.subscribe === 'function') {
        listUnsub = ctx.sessions.list.subscribe(bindCurrent)
      }
      bindCurrent()
      return () => {
        if (listUnsub) { try { listUnsub() } catch (e) {} }
        if (projectionUnsub) { try { projectionUnsub() } catch (e) {} }
      }
    }

    const inject = ['slots', 'theme', 'sessions', 'betterSidebar', 'remote', 'remote.goals']
    function apply(ctx) {
      ctx.effect(
        connectComposerReflowSync,
        'endfield-ui: composer reflow synchronization',
      )

      // Keep the native workbench off-stage until the Endfield boot sequence
      // finishes. This is a visual gate only: better-sidebar retains the
      // user's open/collapsed state and performs its own slide/layout push
      // when the attribute is released.
      ctx.effect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const gatedHosts = new Set()
        const panelSelector = 'div[style*="width"]:has(button[aria-label="新建标签页"]), [data-dsh-panel-host]'
        const gateHost = (host) => {
          if (!(host instanceof HTMLElement) || gatedHosts.has(host)) return
          host.style.setProperty('display', 'none', 'important')
          host.setAttribute('data-endfield-boot-hidden', '')
          gatedHosts.add(host)
        }
        const gatePanel = (panel) => {
          if (!(panel instanceof HTMLElement) || gatedHosts.has(panel)) return
          if (panel.hasAttribute('data-dsh-panel-host')) {
            gateHost(panel)
            return
          }
          const style = window.getComputedStyle(panel)
          if (style.position !== 'fixed' || style.right !== '0px' || style.bottom !== '0px') return
          gateHost(panel)
        }
        const scanHosts = (root) => {
          if (root instanceof Element && root.matches('[data-dsh-better-sidebar]')) gateHost(root)
          if (root instanceof Element && root.matches('[data-dsh-panel-host]')) gateHost(root)
          if (root instanceof Element && root.matches(panelSelector)) gatePanel(root)
          if (root && typeof root.querySelectorAll === 'function') {
            root.querySelectorAll('[data-dsh-better-sidebar], [data-dsh-panel-host]').forEach(gateHost)
            root.querySelectorAll(panelSelector).forEach(gatePanel)
          }
        }
        const releaseHosts = () => {
          for (const host of gatedHosts) {
            if (host.getAttribute('data-endfield-boot-hidden') !== null) {
              host.style.removeProperty('display')
              host.removeAttribute('data-endfield-boot-hidden')
            }
          }
          gatedHosts.clear()
          window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
        }
        document.body.setAttribute('data-endfield-booting', '')
        scanHosts(document.body)
        const observer = new MutationObserver((records) => {
          for (const record of records) record.addedNodes.forEach(scanHosts)
        })
        observer.observe(document.body, { childList: true, subtree: true })
        const timer = window.setTimeout(() => {
          observer.disconnect()
          releaseHosts()
          document.body.removeAttribute('data-endfield-booting')
        }, reducedMotion ? 80 : 3650)
        return () => {
          window.clearTimeout(timer)
          observer.disconnect()
          releaseHosts()
          document.body.removeAttribute('data-endfield-booting')
        }
      }, 'endfield-ui: boot workbench gate')

      // Settings owns a deliberately dark Endfield surface even when DSH is
      // in light/system-light mode.  Its secondary dialogs and menus are
      // portaled to <body>, so CSS inheritance alone cannot carry the local
      // palette into them. Mark the root and every modal/list surface that is
      // alive while Settings is open; theme.css then applies one coherent
      // semantic palette without depending on CSS-module hash class names.
      ctx.effect(() => {
        const rootSelector = '[role="dialog"][aria-modal="true"]:has([data-slot="settings.header"])'
        const portalSelector = '[role="dialog"], [role="listbox"], [role="menu"]'
        const attribute = 'data-endfield-settings-surface'
        const marked = new Set()
        let settingsRoot

        const mark = (element, kind) => {
          if (!(element instanceof HTMLElement)) return
          element.setAttribute(attribute, kind)
          marked.add(element)
        }
        const clear = () => {
          for (const element of marked) {
            if (element.getAttribute(attribute) !== null) element.removeAttribute(attribute)
          }
          marked.clear()
        }
        const sync = () => {
          const nextRoot = document.querySelector(rootSelector)
          if (!(nextRoot instanceof HTMLElement)) {
            settingsRoot = undefined
            clear()
            return
          }
          if (settingsRoot && settingsRoot !== nextRoot) clear()
          settingsRoot = nextRoot
          mark(settingsRoot, 'root')

          // A modal settings shell blocks interaction with unrelated app
          // surfaces, therefore every live dialog/menu during its lifetime is
          // either a descendant or a portal derived from this settings flow.
          document.querySelectorAll(portalSelector).forEach((surface) => {
            if (surface === settingsRoot) return
            const role = surface.getAttribute('role')
            mark(surface, role === 'dialog' ? 'derived' : 'popup')
          })
        }

        sync()
        const observer = new MutationObserver(sync)
        observer.observe(document.body, { childList: true, subtree: true })
        return () => {
          observer.disconnect()
          clear()
        }
      }, 'endfield-ui: settings surface contrast')

      ctx.effect(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        // Keep the stylesheet URL release-addressable.  Electron/Chromium can
        // otherwise retain an older theme.css across local same-version
        // rebuilds, making visual hotfixes appear to have no effect.
        link.href = '/endfield-ui/theme.css?v=1.0.1-better-sidebar-0.18'
        link.dataset.plugin = '@rison/dsh-endfield-ui'
        document.head.appendChild(link)
        return () => { link.remove() }
      }, 'endfield-ui: stylesheet')

      ctx.effect(
        () => ctx.theme.overrideTokens('@rison/dsh-endfield-ui', tokens),
        'endfield-ui: theme tokens',
      )

      // Subscribe the bottom-right ring to the official `contextPressure`
      // projection so it shows the session's real token occupancy, not a mock.
      // Wrapped so a subscription failure can never abort `apply` (which would
      // skip the slot registration below and blank the whole overlay).
      ctx.effect(
        () => { try { return connectRing(ctx) } catch (e) { return () => {} } },
        'endfield-ui: context ring',
      )

      ctx.effect(() => sidebarOf(ctx).registerTab({
        id: 'endfield:objective',
        title: 'OBJECTIVE',
        order: 5,
        single: true,
        icon: (size) => React.createElement('span', {
          className: 'ef-objective-tab-icon',
          style: { width: size, height: size, fontSize: Math.max(10, size - 2) },
          'aria-hidden': true,
        }, '◆'),
        badge: (_tabCtx, scope) => objectiveBadgeBySession.get(scope.sessionId),
        component: ({ ctx: tabCtx, scope }) => React.createElement(
          ObjectiveBoundary,
          null,
          React.createElement(ObjectiveWorkbench, { ctx: tabCtx, scope }),
        ),
      }), 'endfield-ui: OBJECTIVE workbench tab')

      ctx.effect(
        () => connectObjectiveAutoOpen(ctx),
        'endfield-ui: OBJECTIVE auto-open',
      )

      ctx.slots.inject('shell.overlay', () => ctx.slots.register(
        { name: 'shell.overlay', id: 'endfield-shell', order: -100, label: 'Endfield shell' },
        EndfieldOverlay,
      ))
    }

    module.exports = { inject, apply }
    return module.exports
  },
})
