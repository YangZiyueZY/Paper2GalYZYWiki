# p2gyzywki — Paper2GalYZYWiki

> 本文档是用于记录角色的 description 和更新说明。

Paper2GalYZYWiki 是一个基于 [Valaxy](https://github.com/YunYouJun/valaxy) 与 `valaxy-theme-press` 主题构建的角色文档站，结构参考 [OpenList-Docs](https://github.com/OpenListTeam/OpenList-Docs)。文档按 **自建 / 二创** 两大类组织，每个角色一个文件夹，内含**角色介绍**（description + avatar）与**更新日志**两个文档。

## 项目结构

```
p2gyzywki/
├── site/                  # 文档站
│   ├── pages/             # 角色文档（zijian=自建，erchuang=二创）
│   ├── public/            # 静态资源（logo 等）
│   ├── scripts/           # 角色导入脚本 gen-char-pages.mjs
│   ├── valaxy.config.ts   # 站点配置
│   ├── sidebar.ts         # 侧边栏（脚本自动生成）
│   └── package.json
├── packages/              # Valaxy 框架核心（本地依赖）
│   ├── valaxy/            # 核心框架（含 lastUpdated 时间回退补丁）
│   ├── valaxy-theme-press/# 文档主题
│   ├── @valaxyjs/utils/   # 工具库
│   └── devtools/          # 开发工具
├── pnpm-workspace.yaml
└── package.json
```

## 快速开始

环境要求：Node.js >= 22.12.0、pnpm >= 10.34.4。

```bash
pnpm install        # 安装依赖

pnpm dev:site       # 启动文档站（默认 http://localhost:4859）
pnpm build:site     # 构建静态站点（SSG，输出到 site/dist/）
pnpm -C site run serve   # 本地预览构建产物
```

## 新增 / 更新角色

1. 把角色文件夹（含 `description.txt` 与 `avatar.png`）放入源目录
   `E:\BaiduNetdiskDownload666\AI Work\Paper2Gal\Agent`；
2. 停止 dev server 后运行：

   ```bash
   pnpm -C site run gen:chars
   ```

3. 脚本自动生成/覆盖：角色介绍文档、更新日志（首条为“导入旧版资源”）、avatar 图片，并重新生成侧边栏 `sidebar.ts`。

角色归类规则见 `site/scripts/gen-char-pages.mjs` 顶部的 `SELF_MADE` 数组（列入即按“自建”归类，其余为“二创”）。

## 技术栈

Vue 3 · Vite 8 · Valaxy · valaxy-theme-press · UnoCSS · fuse.js 本地搜索 · SSG

## 许可证

MIT（Valaxy 框架部分版权归其原作者 YunYouJun 及其贡献者）。
