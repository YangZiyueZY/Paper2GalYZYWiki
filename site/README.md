# Paper2GalYZYWiki — 角色文档站

本文档是用于记录角色的 description 和更新说明。

基于 [Valaxy](https://github.com/YunYouJun/valaxy) 与 `valaxy-theme-press` 主题构建（结构与 [OpenList-Docs](https://github.com/OpenListTeam/OpenList-Docs) 一致）。

## 快速开始

```bash
# 在项目根目录（p2gyzywki/）安装依赖
pnpm install

# 启动文档站开发服务器（默认端口 4859）
pnpm dev:site        # 等价于 pnpm -C site run dev

# 构建静态站点（SSG）
pnpm build:site      # 等价于 pnpm -C site run build

# 本地预览构建产物
pnpm -C site run serve
```

## 文档结构

```
site/
├── pages/
│   ├── index.md          # 首页
│   ├── zijian/           # 自建角色（原创）
│   │   ├── index.md      # 分类落地页
│   │   └── <英文名>/     # 每个角色一个文件夹（如 Su-Muxi、CatNai）
│   │       ├── index.md  # 角色介绍（description + avatar）
│   │       └── changelog.md # 角色更新日志
│   └── erchuang/         # 二创角色（基于已有作品）
│       ├── index.md
│       └── <英文名>/     # 如 Skirk、Yae-Miko
│           ├── index.md
│           └── changelog.md
├── valaxy.config.ts      # 站点配置
├── sidebar.ts            # 侧边栏（由生成脚本自动产出）
└── scripts/              # char-lib.mjs（共享规则）、gen-char-pages.mjs（导入）、sync-changelog.mjs（同步日志）
```

> 说明：页面文件路径使用英文名（valaxy rc.6 对非 ASCII 路径的 SSG 输出存在双重编码问题，会导致部署后 404）；中文角色名显示在页面标题与正文中。

## 新增 / 更新角色

1. 把角色文件夹（含 `description.txt` 与 `avatar.png`）放入**角色源目录**；
2. 运行：

   ```bash
   pnpm -C site run gen:chars
   ```

   （注意：运行前先停止 dev server，否则 Windows 下目录可能无法清理。）

3. 脚本会按文件夹名生成/覆盖对应角色的介绍文档、更新日志、avatar，并重新生成侧边栏 `sidebar.ts`。

> **角色源目录**：默认位置在 `site/scripts/char-lib.mjs` 的 `AGENT_SRC` 中配置（各机器可能不同，不要写死在其他文档里）。如需临时改用其他目录，用环境变量覆盖：
>
> ```bash
> AGENT_SRC=D:/path/to/agent pnpm -C site run gen:chars
> ```

> **角色归类规则**：在 `site/scripts/char-lib.mjs` 的 `SELF_MADE` 数组里。列入该数组的按"自建"归类，其余一律按"二创"归类。自建角色新增后把它加进数组即可（导入脚本与同步脚本共用此配置）。

## 使用 Skill 自动同步（推荐）

项目自带 ZCode skill **`sync-changelog`**：更新角色后，用一句话即可自动完成"写更新日志 + 同步页面"，不用手动敲命令。

**触发方式**（任选其一）：

- 直接对 AI 助手说："**更新了角色 / 角色 X 更新了 / 换了头像 / 素材改了 / 同步日志**"（中英文均可）
- 或输入斜杠命令：`/sync-changelog`

**它会自动执行**：

1. 停止 dev server（避免 Windows 下目录被占用）；
2. 运行 `pnpm -C site run sync:changelog` —— 对比文件快照，检测"哪个角色、哪些文件"变了，向对应角色的 `changelog.md` 追加带日期的条目；
3. 把变更摘要展示给你确认；
4. 运行 `pnpm -C site run gen:chars` —— 重新同步介绍文档、avatar 与侧边栏；
5. 重启 dev server，并提醒是否需要提交 git。

**说明**：

- 首次运行只建立基线快照（`site/scripts/sync-state.json`，已 gitignore），不写日志，属正常现象；
- 新角色不会自动写日志（由 `gen:chars` 生成页面时写入"导入旧版资源"首条）；
- 同日重复同步会自动去重，不会产生重复条目。

**Skill 位置**：`.agents/skills/sync-changelog/SKILL.md`（流程说明），逻辑脚本：`site/scripts/sync-changelog.mjs`。

## 手动同步更新日志（不使用 Skill 时）

```bash
pnpm -C site run sync:changelog   # 检测变更并追加 changelog.md（先停 dev server）
pnpm -C site run gen:chars        # 重新同步页面内容与侧边栏
```

## 手动维护

- 侧边栏分类：`sidebar.ts`（自动生成，结构为 自建 / 二创 两大分组，每角色一个折叠栏）；
- 角色页面归属：frontmatter 的 `categories: [自建|二创]`；
- 更新日志：直接在对应角色的 `changelog.md` 中按 `## YYYY-MM-DD` 追加条目。
