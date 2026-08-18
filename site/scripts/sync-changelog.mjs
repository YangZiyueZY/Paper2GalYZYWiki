/**
 * sync-changelog.mjs —— 角色更新后同步更新日志
 *
 * 检测角色源目录（Agent/）中每个角色文件的变化（description / avatar / 素材等），
 * 把变更追加到站点对应角色的 changelog.md，并维护文件指纹快照。
 * 页面内容本身的同步由 gen-char-pages.mjs（pnpm gen:chars）完成。
 *
 * 用法：
 *   pnpm -C site run sync:changelog                 # 默认源目录
 *   AGENT_SRC=路径 SITE_DIR=路径 pnpm -C site run sync:changelog  # 覆盖路径（测试用）
 *
 * 首次运行只建立基线快照（site/scripts/sync-state.json），不写入任何日志。
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { SRC_ROOT, SITE_ROOT, CATEGORY_DIR, charPagesRoot, displayName, uidOf, categoryOf, asciiName } from './char-lib.mjs'

const STATE_FILE = path.join(SITE_ROOT, 'scripts', 'sync-state.json')
const TODAY = new Date().toISOString().slice(0, 10)

/** 文件变更 → 日志文案（按优先级匹配，先匹配先生效） */
const CHANGE_LABELS = [
  [/^description\.txt$/i, '更新角色设定（description）'],
  [/^avatar\.png$/i, '更新头像（avatar）'],
  [/^prompt\.txt$/i, '更新 Prompt'],
  [/^studio\.txt$/i, '更新 Studio 配置'],
  [/\.(mpeg|mp3|wav|ogg)$/i, '更新角色语音/音频'],
  [/\.(png|jpg|jpeg|webp|gif)$/i, '更新角色图片素材'],
]

function changeLabel(file) {
  for (const [re, label] of CHANGE_LABELS) {
    if (re.test(file))
      return label
  }
  return '更新素材'
}

/** 采集单个文件的指纹：小文件用 sha256，大文件（>=1MB）用 size+mtime */
function fingerprint(filePath) {
  const s = statSync(filePath)
  const f = { size: s.size, mtimeMs: Math.floor(s.mtimeMs) }
  if (s.size < 1024 * 1024) {
    f.hash = createHash('sha256').update(readFileSync(filePath)).digest('hex')
  }
  return f
}

/** 采集一个角色目录下所有文件的指纹 */
function collectCharFiles(srcDir) {
  const files = {}
  for (const f of readdirSync(srcDir)) {
    const p = path.join(srcDir, f)
    if (statSync(p).isDirectory())
      continue
    files[f] = fingerprint(p)
  }
  return files
}

function sameFingerprint(a, b) {
  if (!a || !b)
    return false
  if (a.size !== b.size || a.mtimeMs !== b.mtimeMs)
    return false
  return !a.hash || !b.hash || a.hash === b.hash
}

/**
 * 向 changelog.md 追加（或合并到）今天的日志节。
 * 返回新追加的条目数（用于去重提示）。
 */
function appendChangelog(charDir, name, bullets) {
  const file = path.join(charDir, 'changelog.md')
  if (!existsSync(file)) {
    console.warn(`⚠ 跳过日志写入（缺少 changelog.md）：${name}`)
    return 0
  }
  const lines = readFileSync(file, 'utf8').split('\n')
  const h1 = lines.findIndex(l => /^# /.test(l))
  if (h1 === -1) {
    console.warn(`⚠ 跳过日志写入（找不到标题行）：${name}`)
    return 0
  }

  const head = lines.slice(0, h1 + 1)
  let rest = lines.slice(h1 + 1)
  while (rest.length && rest[0].trim() === '')
    rest.shift()

  // 已存在的今天条目
  const todayIdx = rest.findIndex(l => l === `## ${TODAY}`)
  let existingBullets = []
  if (todayIdx !== -1) {
    let end = todayIdx + 1
    while (end < rest.length && !/^## /.test(rest[end]))
      end++
    existingBullets = rest.slice(todayIdx, end).filter(l => /^- /.test(l.trim()))
  }

  // 去重：今天已写过的条目不再重复追加
  const newBullets = bullets.filter(b => !existingBullets.some(e => e.trim() === `- ${b}`))
  if (!newBullets.length)
    return 0

  if (todayIdx === -1) {
    const inserted = ['', `## ${TODAY}`, '', ...newBullets.map(b => `- ${b}`), '']
    writeFileSync(file, [...head, ...inserted, ...rest].join('\n'), 'utf8')
  }
  else {
    // 合并进今天的节：在节内最后一个 "- " 条目后追加
    const section = rest.slice(todayIdx)
    let lastBullet = 0
    for (let i = 0; i < section.length; i++) {
      if (/^- /.test(section[i].trim()))
        lastBullet = i
    }
    section.splice(lastBullet + 1, 0, ...newBullets.map(b => `- ${b}`))
    writeFileSync(file, [...head, '', ...section, ...rest.slice(todayIdx + section.length)].join('\n'), 'utf8')
  }
  return newBullets.length
}

if (!existsSync(SRC_ROOT)) {
  console.error(`角色源目录不存在：${SRC_ROOT}`)
  console.error('可通过环境变量 AGENT_SRC 指定。')
  process.exit(1)
}

// 读取快照
let state = { version: 1, chars: {} }
if (existsSync(STATE_FILE)) {
  try {
    state = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
  }
  catch {
    console.warn('⚠ 快照文件损坏，将重建：' + STATE_FILE)
  }
}
if (!state.chars)
  state.chars = {}

const srcDirs = readdirSync(SRC_ROOT).filter(d => existsSync(path.join(SRC_ROOT, d, 'description.txt')))
const seen = new Set()
const firstRun = Object.keys(state.chars).length === 0

let changed = 0
let newChars = 0

for (const dir of srcDirs) {
  const name = displayName(dir)
  const uid = uidOf(dir)
  const category = categoryOf(name)
  const folder = asciiName(name) || uid
  const srcDir = path.join(SRC_ROOT, dir)
  seen.add(name)

  const files = collectCharFiles(srcDir)
  const prev = state.chars[name]

  if (!prev) {
    // 新角色：页面与日志由 gen:chars 生成（首条为“导入旧版资源”），这里只记录基线
    state.chars[name] = { uid, category, folder, files, updatedAt: new Date().toISOString() }
    newChars++
    console.log(`🆕 新增角色（首次记录）：${name}`)
    continue
  }

  const changedFiles = []
  const added = []
  const removed = []
  for (const f of Object.keys(files)) {
    if (!prev.files[f])
      added.push(f)
    else if (!sameFingerprint(prev.files[f], files[f]))
      changedFiles.push(f)
  }
  for (const f of Object.keys(prev.files || {})) {
    if (!files[f])
      removed.push(f)
  }

  const bullets = new Set()
  for (const f of [...changedFiles, ...added])
    bullets.add(changeLabel(f))
  if (removed.length)
    bullets.add('移除角色素材')

  if (bullets.size) {
    const charDir = path.join(charPagesRoot(), CATEGORY_DIR[category], folder)
    const addedCount = appendChangelog(charDir, name, [...bullets])
    changed++
    console.log(`✎ ${name}：${[...bullets].join('；')}${addedCount ? `（日志已追加 ${addedCount} 条）` : '（今日已记录，跳过）'}`)
  }

  state.chars[name] = { uid, category, folder, files, updatedAt: new Date().toISOString() }
}

// 源目录中已删除的角色
for (const name of Object.keys(state.chars)) {
  if (!seen.has(name)) {
    console.log(`🗑 ${name}：已从源目录移除（站点页面保留，如需删除请手动处理）`)
    delete state.chars[name]
  }
}

mkdirSync(path.dirname(STATE_FILE), { recursive: true })
writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')

console.log('\n—— 同步完成 ——')
if (firstRun)
  console.log(`首次运行：已记录 ${Object.keys(state.chars).length} 个角色作为基线，之后改文件再运行即可自动写日志。`)
else
  console.log(`角色 ${seen.size} 个：更新日志 ${changed} 个，新增角色 ${newChars} 个。`)
console.log(`快照：${STATE_FILE}`)
