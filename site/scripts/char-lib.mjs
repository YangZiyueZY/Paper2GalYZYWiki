/**
 * char-lib.mjs —— 角色源目录与命名规则的共享工具
 *
 * 供 gen-char-pages.mjs（页面生成）与 sync-changelog.mjs（更新日志同步）共用，
 * 保证分类（自建/二创）、目录命名等规则只维护一份。
 *
 * 可通过环境变量覆盖：
 *   AGENT_SRC 角色源目录（默认 E:\BaiduNetdiskDownload666\AI Work\Paper2Gal\Agent）
 *   SITE_DIR  站点目录（默认本文件所在目录的上级，即 site/）
 */
import path from 'node:path'

export const SRC_ROOT = process.env.AGENT_SRC || 'E:/BaiduNetdiskDownload666/AI Work/Paper2Gal/Agent'
export const SITE_ROOT = process.env.SITE_DIR
  ? path.resolve(process.env.SITE_DIR)
  : path.resolve(import.meta.dirname, '..')

/** 自建角色（按展示名匹配，展示名 = 文件夹名去掉 " u_uid" 后缀） */
export const SELF_MADE = ['猫奈（GitHub娘）-CatNai', '苏沐曦-Su Muxi']

/** 分类 → 页面目录名（必须为 ASCII，见 gen-char-pages.mjs 顶部说明） */
export const CATEGORY_DIR = { 自建: 'zijian', 二创: 'erchuang' }

/** 文件夹名 → 展示名（去掉 " u_uid" 后缀） */
export function displayName(dir) {
  return dir.split(' u_')[0]
}

/** 文件夹名 → 角色 UID */
export function uidOf(dir) {
  return dir.split(' u_')[1] || ''
}

/** 展示名 → 分类（自建 / 二创） */
export function categoryOf(name) {
  return SELF_MADE.includes(name) ? '自建' : '二创'
}

/** 英文名（取展示名最后一个 "-" 之后的部分），用作 ASCII 目录名 */
export function asciiName(name) {
  const en = name.split('-').pop() || ''
  const ascii = en.replace(/\s+/g, '-').replace(/[^A-Za-z0-9_-]/g, '')
  return ascii || ''
}

/** 站点 pages 目录 */
export function charPagesRoot() {
  return path.join(SITE_ROOT, 'pages')
}
