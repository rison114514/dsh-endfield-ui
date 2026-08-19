import { readFileSync } from 'node:fs'

export const name = 'endfield-ui'
export const inject = ['webServer']

const asset = (relativePath, contentType) => ({
  body: readFileSync(new URL(relativePath, import.meta.url)),
  contentType,
})

const ASSETS = new Map([
  ['/endfield-ui/theme.css', asset('./theme.css', 'text/css; charset=utf-8')],
  ['/endfield-ui/assets/texture.png', asset('./assets/endfield-texture.png', 'image/png')],
  ['/endfield-ui/assets/workbench-logo.png', asset('./assets/workbench-logo.png', 'image/png')],
  ['/endfield-ui/assets/deepseek-harness-brand.png', asset('./assets/deepseek-harness-brand.png', 'image/png')],
  ['/endfield-ui/assets/endfield-logo.png', asset('./assets/endfield-logo.png', 'image/png')],
  ['/endfield-ui/assets/button-texture.png', asset('./assets/button-texture.png', 'image/png')],
  ['/endfield-ui/assets/operator-xaihi.png', asset('./assets/operator-xaihi.png', 'image/png')],
  ['/endfield-ui/assets/operator-icon.png', asset('./assets/operator-icon.png', 'image/png')],
  ['/endfield-ui/assets/ring.png', asset('./assets/ring.png', 'image/png')],
  ['/endfield-ui/assets/triangles.svg', asset('./assets/triangles.svg', 'image/svg+xml; charset=utf-8')],
  ['/endfield-ui/assets/color-bar.png', asset('./assets/color-bar.png', 'image/png')],
  ['/endfield-ui/assets/core-cn.png', asset('./assets/core-cn.png', 'image/png')],
  ['/endfield-ui/assets/deco-right.jpg', asset('./assets/deco-right.jpg', 'image/jpeg')],
  ['/endfield-ui/assets/operator-card.jpg', asset('./assets/operator-card.jpg', 'image/jpeg')],
  ['/endfield-ui/assets/prof-caster.jpg', asset('./assets/prof-caster.jpg', 'image/jpeg')],
  ['/endfield-ui/assets/prof-support.jpg', asset('./assets/prof-support.jpg', 'image/jpeg')],
  ['/endfield-ui/assets/ele-electric.jpg', asset('./assets/ele-electric.jpg', 'image/jpeg')],
  ['/endfield-ui/assets/ele-ice.jpg', asset('./assets/ele-ice.jpg', 'image/jpeg')],
  ['/endfield-ui/assets/chat-grid-bg.jpg', asset('./assets/chat-grid-bg.jpg', 'image/jpeg')],
  ['/endfield-ui/assets/contour-texture.png', asset('./assets/contour-texture.png', 'image/png')],
  ['/endfield-ui/assets/harmony-regular.woff2', asset('./assets/harmony-regular.woff2', 'font/woff2')],
  ['/endfield-ui/assets/harmony-bold.woff2', asset('./assets/harmony-bold.woff2', 'font/woff2')],
  ['/endfield-ui/assets/novecento.woff2', asset('./assets/novecento.woff2', 'font/woff2')],
  ['/endfield-ui/assets/space-grotesk.woff2', asset('./assets/space-grotesk.woff2', 'font/woff2')],
])

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/endfield-ui',
    handler(req, res) {
      const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
      const file = ASSETS.get(pathname)
      if (file === undefined) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Not found')
        return
      }
      res.writeHead(200, {
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': String(file.body.byteLength),
        'Content-Type': file.contentType,
      })
      res.end(file.body)
    },
  }), 'endfield-ui: static assets')
}
