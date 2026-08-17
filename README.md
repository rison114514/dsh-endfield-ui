# DSH × 终末地风格工作台

这个项目把原“科研工作台”的终末地工业风视觉系统迁移为 DeepSeek Harness 的独立 Cordis 插件，并提供原生桌面壳。当前 0.3 版包含完整开屏程序、白色等高线侧栏、两级鲸鱼品牌、干员氛围层、工业设置面板与黑黄状态 HUD。

## 结构

- `endfield-ui-plugin/`：双端 dsh 插件。Host 端提供字体与纹理，Client 端通过官方 Theme Token 和 `shell.overlay` 插槽加载视觉外壳。
- `desktop-app/`：Electron 桌面入口，自动启动本地 dsh、装载插件并打开 App 窗口。
- `dsh-packaged-final.jpg`：当前打包版界面预览。
- `dsh-settings-final.jpg`：设置面板预览。

## 运行

```bash
cd desktop-app
npm start
```

如 deepseek-harness 不在 `/Users/rison/WorkBuddy/DS/deepseek-harness`，修改 `desktop-app/app.config.json`。

打包版位于 `desktop-app/release/DSH 终末地工作台-darwin-arm64/DSH 终末地工作台.app`。
