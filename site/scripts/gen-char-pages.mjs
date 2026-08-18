/**
 * 角色页面生成脚本
 *
 * 从角色源目录（默认 E:\BaiduNetdiskDownload666\AI Work\Paper2Gal\Agent）
 * 为每个角色生成：
 *   pages/<zijian|erchuang>/<英文名>/index.md      —— 角色介绍文档（description + avatar）
 *   pages/<zijian|erchuang>/<英文名>/changelog.md  —— 角色更新日志文档
 *   pages/<zijian|erchuang>/<英文名>/avatar.png    —— 角色图片
 *   pages/<zijian|erchuang>/index.md               —— 分类落地页
 *
 * 注意：页面文件路径必须为 ASCII（valaxy rc.6 对非 ASCII 路径的 SSG 输出有
 * 双重编码问题，会导致部署后 404）。中文名称只出现在 title / 分类 / 正文中。
 *
 * 用法：
 *   pnpm gen:chars                # 用默认源目录
 *   AGENT_SRC=路径 pnpm gen:chars # 指定源目录
 *
 * 已存在的文件会被覆盖。
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const SRC_ROOT = process.env.AGENT_SRC || 'E:/BaiduNetdiskDownload666/AI Work/Paper2Gal/Agent'
const PAGES_ROOT = path.resolve(import.meta.dirname, '../pages')

/** 自建角色（按展示名匹配，展示名 = 文件夹名去掉 " u_uid" 后缀） */
const SELF_MADE = ['猫奈（GitHub娘）-CatNai', '苏沐曦-Su Muxi']

const CATEGORY_DIR = { 自建: 'zijian', 二创: 'erchuang' }

const TODAY = new Date().toISOString().slice(0, 10)

function displayName(dir) {
  return dir.split(' u_')[0]
}

function uidOf(dir) {
  return dir.split(' u_')[1] || ''
}

function categoryOf(name) {
  return SELF_MADE.includes(name) ? '自建' : '二创'
}

/** 英文名（取展示名最后一个 "-" 之后的部分），用作 ASCII 目录名 */
function asciiName(name) {
  const en = name.split('-').pop() || ''
  const ascii = en.replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '')
  return ascii || ''
}

/** 把 description.txt 的纯文本转换为 Markdown */
function descToMarkdown(text) {
  const t = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  const out = []
  for (const raw of t.split('\n')) {
    const line = raw.trimEnd()
    const trimmed = raw.trim()
    if (!trimmed) {
      out.push('')
      continue
    }
    // 分隔线（"---" 等）在正文中会干扰结构，直接丢弃
    if (/^(-{3,}|—{3,}|•{3,})$/.test(trimmed))
      continue
    // 【章节标题】→ 二级标题
    if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
      out.push('', `## ${trimmed}`, '')
      continue
    }
    // "· xxx" → 无序列表 "- xxx"
    if (trimmed.startsWith('·'))
      out.push('- ' + trimmed.slice(1).trimStart())
    else
      out.push(line)
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n')
}

/** 角色介绍文档 */
function buildIndexMd(name, uid, category, avatarName, descMd) {
  const [intro, ...rest] = descMd.split(/\n\n+/)
  const restMd = rest.join('\n\n').trim()
  return `---
title: ${name}
categories:
  - ${category}
top: 100
---

# ${name}

![${name}](${avatarName})

## 角色简介

${intro.trim()}

## 角色信息

| 项目 | 内容 |
| --- | --- |
| 角色 ID | ${uid} |
| 类别 | ${category} |

${restMd ? `## 完整描述\n\n${restMd}` : ''}
`
}

/** 角色更新日志文档（首个条目固定为“导入旧版资源”） */
function buildChangelogMd(name, category) {
  return `---
title: ${name} · 更新日志
categories:
  - ${category}
top: 90
---

# ${name} · 更新日志

## ${TODAY}

- 导入旧版资源

<!-- 后续更新请继续在此追加条目，格式：
## YYYY-MM-DD

- 更新内容一
- 更新内容二
-->
`
}

/** 生成侧边栏配置（每个角色一个可折叠分组，内含更新日志） */
function buildSidebar(generated) {
  const groups = ['自建', '二创'].map((category) => {
    const dir = CATEGORY_DIR[category]
    // 二创角色多，默认折叠；自建角色少，默认展开
    const defaultCollapsed = category === '二创'
    const chars = generated[category].map((c) => {
      const base = `/${dir}/${c.folder}`
      return `    { text: ${JSON.stringify(c.name)}, link: ${JSON.stringify(`${base}/`)}, collapsed: ${defaultCollapsed}, items: [{ text: '更新日志', link: ${JSON.stringify(`${base}/changelog`)} }] },`
    }).join('\n')
    return `  {
    text: ${JSON.stringify(`${category}角色`)},
    link: ${JSON.stringify(`/${dir}/`)},
    collapsed: false,
    items: [
${chars}
    ],
  },`
  }).join('\n')

  return `/* eslint-disable */
// 由 scripts/gen-char-pages.mjs 自动生成，请勿手动修改
import type { PressTheme } from 'valaxy-theme-press'

export const sidebar: PressTheme.SidebarEntry[] = [
${groups}
]
`
}

/** 分类落地页 */
function buildCategoryIndexMd(category, chars) {
  const rows = chars
    .map((c) => {
      const esc = s => s.replace(/[|]/g, '\\|')
      return `| ![${esc(c.name)}](./${c.folder}/avatar.png) | [${esc(c.name)}](./${c.folder}/) | [更新日志](./${c.folder}/changelog) |`
    })
    .join('\n')
  const intro = category === '自建'
    ? '自建角色指由作者独立创作的角色。'
    : '二创角色指基于已有作品（游戏、动画等）世界观与角色进行的二次创作。'
  return `---
title: ${category}角色
categories:
  - ${category}
top: 999
---

# ${category}角色

${intro}

## 角色列表

| 角色 | 介绍 | 更新日志 |
| --- | --- | --- |
${rows}
`
}

if (!existsSync(SRC_ROOT)) {
  console.error(`角色源目录不存在：${SRC_ROOT}`)
  console.error('可通过环境变量 AGENT_SRC 指定：AGENT_SRC=xxx pnpm gen:chars')
  process.exit(1)
}

// 清理旧的生成目录（含早期中文路径版本），确保重新生成后结构一致
// 注意：Windows 上若 dev server 正在运行，其文件监听会占用目录句柄，
// 导致 rmSync 静默失败（不报错但删不掉）。请在运行前先停止 dev server。
for (const dir of Object.values(CATEGORY_DIR).concat(['自建', '二创'])) {
  const target = path.join(PAGES_ROOT, dir)
  rmSync(target, { recursive: true, force: true })
  if (existsSync(target)) {
    console.warn(`⚠ 未能删除 ${target}（可能被 dev server 占用）。请先停止 dev server 后重试。`)
  }
}

const srcDirs = readdirSync(SRC_ROOT).filter(d => existsSync(path.join(SRC_ROOT, d, 'description.txt')))

if (!srcDirs.length) {
  console.error('源目录中没有找到任何角色（缺少 description.txt）')
  process.exit(1)
}

// 预计算 ASCII 目录名并解决冲突
const used = new Map()
const plans = srcDirs.map((dir) => {
  const name = displayName(dir)
  let folder = asciiName(name)
  if (!folder) {
    folder = uidOf(dir)
  }
  else if (used.has(folder)) {
    folder = `${folder}-${uidOf(dir)}`
  }
  used.set(folder, name)
  return { dir, name, uid: uidOf(dir), category: categoryOf(name), folder }
})

const generated = { 自建: [], 二创: [] }
for (const p of plans) {
  const { dir, name, uid, category, folder } = p
  const srcDir = path.join(SRC_ROOT, dir)
  const charDir = path.join(PAGES_ROOT, CATEGORY_DIR[category], folder)

  mkdirSync(charDir, { recursive: true })

  // 角色图片：avatar.png（若没有则跳过）
  const avatar = path.join(srcDir, 'avatar.png')
  if (existsSync(avatar))
    copyFileSync(avatar, path.join(charDir, 'avatar.png'))

  // 介绍文档
  const desc = readFileSync(path.join(srcDir, 'description.txt'), 'utf8')
  writeFileSync(path.join(charDir, 'index.md'), buildIndexMd(name, uid, category, 'avatar.png', descToMarkdown(desc)), 'utf8')

  // 更新日志文档
  writeFileSync(path.join(charDir, 'changelog.md'), buildChangelogMd(name, category), 'utf8')

  generated[category].push({ name, uid, folder })
  console.log(`✔ ${category} / ${folder} (${name})`)
}

// 分类落地页
for (const category of ['自建', '二创']) {
  generated[category].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  mkdirSync(path.join(PAGES_ROOT, CATEGORY_DIR[category]), { recursive: true })
  writeFileSync(path.join(PAGES_ROOT, CATEGORY_DIR[category], 'index.md'), buildCategoryIndexMd(category, generated[category]), 'utf8')
}

// 侧边栏配置
writeFileSync(path.join(import.meta.dirname, '../sidebar.ts'), buildSidebar(generated), 'utf8')
console.log('✔ sidebar.ts（侧边栏配置）已生成')

const total = Object.values(generated).reduce((s, arr) => s + arr.length, 0)
console.log(`\n完成：共生成 ${total} 个角色页面（自建 ${generated.自建.length} / 二创 ${generated.二创.length}）`)
