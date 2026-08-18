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
└── scripts/gen-char-pages.mjs  # 角色导入脚本
```

> 说明：页面文件路径使用英文名（valaxy rc.6 对非 ASCII 路径的 SSG 输出存在双重编码问题，会导致部署后 404）；中文角色名显示在页面标题与正文中。

## 新增 / 更新角色

1. 把角色文件夹（含 `description.txt` 与 `avatar.png`）放入源目录
   `E:\BaiduNetdiskDownload666\AI Work\Paper2Gal\Agent`；
2. 运行：

   ```bash
   pnpm -C site run gen:chars
   ```

   （注意：运行前先停止 dev server，否则 Windows 下目录可能无法清理。）

3. 脚本会按文件夹名生成/覆盖对应角色的介绍文档、更新日志、avatar，并重新生成侧边栏 `sidebar.ts`。

> 角色归类规则在 `scripts/gen-char-pages.mjs` 顶部的 `SELF_MADE` 数组里：
> 列入该数组的按"自建"归类，其余一律按"二创"归类。自建角色新增后把它加进数组即可。

## 手动维护

- 侧边栏分类：`sidebar.ts`（自动生成，结构为 自建 / 二创 两大分组，每角色一个折叠栏）；
- 角色页面归属：frontmatter 的 `categories: [自建|二创]`；
- 更新日志：直接在对应角色的 `changelog.md` 中按 `## YYYY-MM-DD` 追加条目。
