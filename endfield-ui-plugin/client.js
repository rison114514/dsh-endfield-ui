window.__ModuleLoader__.load({
  id: '@rison/dsh-endfield-ui',
  factory: (require) => {
    const module = { exports: {} }
    const React = require('react')

    const pair = (value) => ({ light: value, dark: value })
    const tokens = {
      '--dsw-alias-bg-base': pair('#090b0d'),
      '--dsw-alias-bg-layer-1': pair('#111418'),
      '--dsw-alias-bg-layer-2': pair('#181c20'),
      '--dsw-alias-bg-layer-3': pair('#20252a'),
      '--dsw-alias-bg-module-platform': pair('#171b1f'),
      '--dsw-alias-bg-multi-select': pair('#22272c'),
      '--dsw-alias-bg-overlay': pair('#22272c'),
      '--dsw-alias-bg-mask-1': pair('rgba(0, 0, 0, 0.62)'),
      '--dsw-alias-bg-mask-2': pair('rgba(0, 0, 0, 0.34)'),
      '--dsw-alias-bg-mask-3': pair('rgba(0, 0, 0, 0.76)'),
      '--dsw-alias-border-inverted': pair('rgba(255, 244, 79, 0.16)'),
      '--dsw-alias-border-inverted2': pair('rgba(255, 244, 79, 0.1)'),
      '--dsw-alias-border-l1': pair('rgba(255, 244, 79, 0.18)'),
      '--dsw-alias-border-l2-darkmode-thin': pair('rgba(255, 244, 79, 0.22)'),
      '--dsw-alias-border-l2': pair('rgba(255, 244, 79, 0.28)'),
      '--dsw-alias-border-l3': pair('rgba(255, 244, 79, 0.42)'),
      '--dsw-alias-border-l4': pair('#fff44f'),
      '--dsw-alias-brand-primary': pair('#fff44f'),
      '--dsw-alias-brand-primary-invert': pair('#090b0d'),
      '--dsw-alias-brand-text': pair('#fff44f'),
      '--dsw-alias-label-primary': pair('#f5f6f2'),
      '--dsw-alias-label-primary-bluish': pair('#fff44f'),
      '--dsw-alias-label-primary-dimmed': pair('#c7cbc6'),
      '--dsw-alias-label-primary-foreground': pair('#090b0d'),
      '--dsw-alias-label-primary-inverted': pair('#090b0d'),
      '--dsw-alias-label-secondary': pair('#aeb4b8'),
      '--dsw-alias-label-tertiary': pair('#858c92'),
      '--dsw-alias-label-caption': pair('#6f777d'),
      '--dsw-alias-label-dimmed': pair('#555c62'),
      '--dsw-alias-button-primary-fill': pair('#fff44f'),
      '--dsw-alias-button-primary-hover': pair('#e2d800'),
      '--dsw-alias-button-primary-dimmed': pair('#4b4a29'),
      '--dsw-alias-button-contrast-fill': pair('#f5f6f2'),
      '--dsw-alias-button-elevated-fill': pair('#23282d'),
      '--dsw-alias-button-floating-fill': pair('#20252a'),
      '--dsw-alias-button-floating-hover': pair('#30363c'),
      '--dsw-alias-button-ghost-active-border': pair('#fff44f'),
      '--dsw-alias-button-ghost-active-fill': pair('rgba(255, 244, 79, 0.12)'),
      '--dsw-alias-button-ghost-active-hover': pair('rgba(255, 244, 79, 0.18)'),
      '--dsw-alias-button-info-fill': pair('#fff44f'),
      '--dsw-alias-button-info-hover': pair('#e2d800'),
      '--dsw-alias-interactive-bg-active': pair('rgba(255, 244, 79, 0.16)'),
      '--dsw-alias-interactive-bg-hover-accent': pair('rgba(255, 244, 79, 0.18)'),
      '--dsw-alias-interactive-bg-hover-solid': pair('#2b3035'),
      '--dsw-alias-interactive-bg-hover': pair('rgba(255, 244, 79, 0.08)'),
      '--dsw-alias-markdown-code-block-banner': pair('#161a1e'),
      '--dsw-alias-markdown-code-block': pair('#0b0e10'),
      '--dsw-alias-markdown-inline-code': pair('#20252a'),
      '--dsw-alias-markdown-placeholder': pair('#14181b'),
      '--dsw-alias-markdown-tag': pair('#1d2226'),
      '--dsw-alias-scrollbar-bg-l1': pair('#fff44f'),
      '--dsw-alias-scrollbar-bg-l2': pair('#fff44f'),
      '--dsw-alias-scrollbar-hover-l1': pair('#ffffff'),
      '--dsw-alias-scrollbar-hover-l2': pair('#ffffff'),
      '--dsw-alias-state-business-primary': pair('#fff44f'),
      '--dsw-alias-state-business-tertiary': pair('rgba(255, 244, 79, 0.13)'),
      '--dsw-alias-state-success-primary': pair('#8eef5b'),
      '--dsw-alias-state-success-secondary': pair('#65bd3c'),
      '--dsw-alias-state-success-tertiary': pair('rgba(142, 239, 91, 0.12)'),
      '--dsw-alias-state-warn-label': pair('#fff44f'),
      '--dsw-alias-state-warn-primary': pair('#fff44f'),
      '--dsw-alias-state-warn-secondary': pair('#d9cd00'),
      '--dsw-alias-state-warn-tertiary': pair('rgba(255, 244, 79, 0.12)'),
      '--dsw-alias-toast-bg': pair('#20252a'),
      '--dsw-alias-tooltip-bg': pair('#111418'),
      '--dsw-specific-menu': pair('#1b2024'),
      '--dsw-specific-sidebar-fill': pair('#0d1013'),
      '--dsw-specific-sidebar-nav-item-active-accent': pair('rgba(255, 244, 79, 0.18)'),
      '--dsw-specific-sidebar-nav-item-active': pair('rgba(255, 244, 79, 0.12)'),
      '--dsw-specific-sidebar-nav-item-hover': pair('rgba(255, 244, 79, 0.07)'),
      '--dsw-specific-tip': pair('#1b2024'),
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

    // Circular context-usage ring (bottom-right). It mirrors dsh's native
    // ContextMeter: the meter root carries a hashed `JObwrW_root` class and its
    // trigger button's aria-label embeds the live occupancy like "上下文已用 45%".
    // We poll that every 700ms; if no provider reports context pressure yet, the
    // ring falls back to a slow lemon-yellow breathing sweep so it still reads alive.
    const RING_R = 40
    const RING_C = 2 * Math.PI * RING_R
    function ContextRing() {
      const [pct, setPct] = React.useState(0)
      const [live, setLive] = React.useState(false)
      React.useEffect(() => {
        let timer
        const tick = () => {
          const root = document.querySelector('[class*="JObwrW_root"]')
          const label = root && root.getAttribute('aria-label')
          const m = label && label.match(/(\d+)\s*%/)
          if (m) {
            const v = Math.max(0, Math.min(100, parseInt(m[1], 10)))
            setPct(v)
            setLive(true)
          } else if (!live) {
            const t = (Date.now() % 4200) / 4200
            setPct(Math.round(14 + (Math.sin(t * Math.PI * 2) * 0.5 + 0.5) * 72))
          }
          timer = setTimeout(tick, 700)
        }
        tick()
        return () => clearTimeout(timer)
      }, [live])
      const offset = RING_C * (1 - pct / 100)
      return React.createElement('div', { className: 'ef-context-ring', 'aria-hidden': true },
        React.createElement('svg', { viewBox: '0 0 100 100' },
          React.createElement('circle', { className: 'ef-ring-track', cx: 50, cy: 50, r: RING_R, fill: 'none', strokeWidth: 7 }),
          React.createElement('circle', { className: 'ef-ring-prog', cx: 50, cy: 50, r: RING_R, fill: 'none', strokeWidth: 7, strokeDasharray: RING_C, strokeDashoffset: offset }),
        ),
        React.createElement('div', { className: 'ef-ring-value' }, pct, React.createElement('small', null, '%')),
        React.createElement('div', { className: 'ef-ring-label' }, live ? 'CONTEXT' : 'CONTEXT · SYNC'),
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
          React.createElement(ContextRing),
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

    const inject = ['slots', 'theme']
    function apply(ctx) {
      ctx.effect(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/endfield-ui/theme.css'
        link.dataset.plugin = '@rison/dsh-endfield-ui'
        document.head.appendChild(link)
        return () => { link.remove() }
      }, 'endfield-ui: stylesheet')

      ctx.effect(
        () => ctx.theme.overrideTokens('@rison/dsh-endfield-ui', tokens),
        'endfield-ui: theme tokens',
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
