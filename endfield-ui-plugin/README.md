# DSH Endfield UI

`@rison/dsh-endfield-ui` 是一个不修改 DeepSeek Harness 核心源码的双端 Cordis 插件：Host 端提供本地视觉素材，Client 端通过官方 Theme Token 与 `shell.overlay` 插槽加载终末地工业风外观。

0.4.3 版在黑底核心启动动画、状态 HUD 与几何纹理的基础上，加入白色等高线侧栏、独立绘制的 Deepseek Harness 几何鲸鱼品牌插图、工业化设置窗口和灰黑协议式活动工作区卡片；开屏保留原有动画时序，将“终末地工作台”图替换为同一品牌插图，并移除开屏人物图与侧栏 `D / SH` 装饰标。消息输入区与发送后的用户气泡统一采用白底黑字。所有装饰层均不接管点击事件，不影响 dsh 原有输入与侧栏操作。

## 加载

先把本地包安装到 dsh 的 web profile：

```bash
cd /Users/rison/WorkBuddy/DS/deepseek-harness
pnpm dsh plugin --profile web add "/Users/rison/Documents/workspace/others/写作帖子/自己帖子/dsh接入终末地风格/endfield-ui-plugin"
```

再使用插件自带 patch 启动：

```bash
pnpm dsh --profile web --patch "/Users/rison/Documents/workspace/others/写作帖子/自己帖子/dsh接入终末地风格/endfield-ui-plugin/cordis.patch.yml" --port 0
```

桌面壳会自动完成第二步。
