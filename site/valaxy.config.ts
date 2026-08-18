import type { PressTheme } from 'valaxy-theme-press'
import { defineValaxyConfig } from 'valaxy'

import { sidebar } from './sidebar'

/**
 * ============================================================
 *  Paper2GalYZYWiki · 角色文档站
 *  本文档用于记录角色的 description 和更新说明。
 * ============================================================
 *  结构：
 *   - pages/自建/<角色>/index.md     角色介绍（description + avatar）
 *   - pages/自建/<角色>/changelog.md 角色更新日志
 *   - pages/二创/<角色>/index.md
 *   - pages/二创/<角色>/changelog.md
 *  新增角色：把角色文件夹放入 Agent 源目录后，运行 `pnpm gen:chars` 即可。
 * ============================================================
 */

const safelist = [
  'i-ri-home-line',
  'i-ri-github-line',
  'i-ri-arrow-up-line',
]

/**
 * 侧边栏：由 scripts/gen-char-pages.mjs 自动生成（./sidebar.ts），
 * 结构为 自建 / 二创 两大分组，每个角色一个可折叠分组（内含更新日志）。
 * 新增角色后运行 `pnpm gen:chars` 即可自动更新。
 */

export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    // TODO: 部署后改为正式域名（用于生成 RSS / Sitemap）
    title: 'Paper2GalYZYWiki',
    url: 'https://example.com',
    description: '本文档是用于记录角色的description和更新说明。',
    favicon: '/logo.png',
    author: {
      name: 'Paper2GalYZYWiki',
      link: 'https://example.com',
      avatar: '/logo.png',
    },

    // 本地搜索（fuse.js），无需任何外部服务
    search: {
      enable: true,
      provider: 'fuse',
    },

    mediumZoom: {
      enable: true,
    },

    lastUpdated: true,
  },

  theme: 'press',
  themeConfig: {
    logo: '/logo.png',

    // 主题色
    colors: {
      primary: '#0078E7',
    },

    sidebar,

    nav: [
      {
        text: '自建',
        link: '/zijian/',
      },
      {
        text: '二创',
        link: '/erchuang/',
      },
      {
        text: 'GitHub',
        items: [
          {
            text: '源码仓库',
            link: 'https://github.com/YangZiyueZY/Paper2GalYZYWiki',
          },
          {
            text: 'Issues',
            link: 'https://github.com/YangZiyueZY/Paper2GalYZYWiki/issues',
          },
        ],
      },
    ],

    socialLinks: [
      {
        icon: 'i-ri-github-line',
        link: 'https://github.com/YangZiyueZY/Paper2GalYZYWiki',
      },
    ],

    // “编辑此页”链接（:path 会被替换为 pages/... 的相对路径，仓库内真实路径在 site/ 下）
    editLink: {
      pattern: 'https://github.com/YangZiyueZY/Paper2GalYZYWiki/edit/main/site/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: '本文档用于记录角色的 description 和更新说明。',
      copyright: 'Copyright © 2026 <a href="https://example.com" target="_blank">Paper2GalYZYWiki</a>',
    },
  },

  vite: {
    base: '/',
  },

  unocss: {
    safelist,
  },

  markdown: {
    blocks: {
      tip: {
        icon: 'i-carbon-thumbs-up',
      },
      warning: {
        icon: 'i-carbon-warning-alt',
      },
      danger: {
        icon: 'i-carbon-warning',
      },
      info: {
        icon: 'i-carbon-information',
      },
    },
  },
})
