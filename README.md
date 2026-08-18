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

1. 把角色文件夹（含 `description.txt` 与 `avatar.png`）放入**角色源目录**；
2. 停止 dev server 后运行：

   ```bash
   pnpm -C site run gen:chars
   ```

3. 脚本自动生成/覆盖：角色介绍文档、更新日志（首条为“导入旧版资源”）、avatar 图片，并重新生成侧边栏 `sidebar.ts`。

> 角色源目录的默认位置配置在 `site/scripts/char-lib.mjs` 的 `AGENT_SRC` 中（各机器可能不同），可用环境变量覆盖：`AGENT_SRC=D:/path pnpm -C site run gen:chars`。
> 角色归类规则同样在 `site/scripts/char-lib.mjs` 的 `SELF_MADE` 数组（列入即按“自建”归类，其余为“二创”）。

## 使用 Skill 自动同步更新日志

项目自带 ZCode skill **`sync-changelog`**：更新角色后对 AI 助手说“更新了角色 / 角色 X 更新了 / 同步日志”，即可自动完成——检测角色源目录的变更 → 向对应角色的 `changelog.md` 追加带日期条目 → 重新生成页面与侧边栏（详见 `site/README.md` 的"使用 Skill 自动同步"一节）。也可手动运行 `pnpm -C site run sync:changelog` 再 `pnpm -C site run gen:chars`。

## 技术栈

Vue 3 · Vite 8 · Valaxy · valaxy-theme-press · UnoCSS · fuse.js 本地搜索 · SSG

## 许可证

MIT（Valaxy 框架部分版权归其原作者 YunYouJun 及其贡献者）。
