---
name: sync-changelog
description: 角色更新后同步更新文档站更新日志。当用户说"更新了角色""角色X更新了/改了/换头像了""同步更新日志""同步日志""角色资源改了"等（英文：character updated / character changed / sync changelog / update character log）时使用。检测角色源目录（AI Work/Paper2Gal/Agent）中角色文件的变更，把"更新设定/头像/素材"等条目追加到站点对应角色的 changelog.md，并重新生成角色页面。
---

# sync-changelog —— 角色更新后同步更新日志

Paper2GalYZYWiki 角色文档站的"更新日志同步"工作流。角色内容（description、avatar、素材）更新后，用它把变更记录到站点里对应角色的 `changelog.md`。

## 背景（先读，理解为什么这么做）

- **角色源目录**（内容权威）：`E:\BaiduNetdiskDownload666\AI Work\Paper2Gal\Agent\<角色文件夹>/`，内含 `description.txt`（角色设定）、`avatar.png`（头像）、`prompt.txt`、`studio.txt`、表情/CG 图、语音等
- **站点**：`p2gyzywki/site/`，每个角色在 `site/pages/<zijian|erchuang>/<英文名>/` 下有两个文档：
  - `index.md` —— 角色介绍（description 内容 + avatar 图）
  - `changelog.md` —— 更新日志（格式：`## YYYY-MM-DD` + `- 条目`）
- **两个脚本**（都在 `site/scripts/`）：
  - `sync-changelog.mjs`（`pnpm -C site run sync:changelog`）—— 对比文件指纹快照，检测变更，**只写更新日志**
  - `gen-char-pages.mjs`（`pnpm -C site run gen:chars`）—— 把 description/avatar 重新同步进 `index.md`，重建侧边栏

分工：同步脚本负责"记日志"，生成脚本负责"更新页面内容"，两者都要跑。

## 执行流程

1. **停掉 dev server**（重要：Windows 下 dev server 的文件监听会占用 `pages/` 目录句柄，导致 `gen:chars` 清理目录时静默失败）。找到占用 4859 端口的进程并结束：
   ```bash
   netstat -ano | grep ":4859" | grep LISTENING   # 记下最后一列的 PID
   taskkill //PID <PID> //F
   ```
   后台任务先 TaskStop 再补 taskkill，双保险。

2. **运行同步脚本**：
   ```bash
   cd E:\BaiduNetdiskDownload666\Code\Trea\Paper2GalYZYWiki\p2gyzywki
   pnpm -C site run sync:changelog
   ```
   输出含义：
   - `✎ 角色名：更新角色设定（description）；更新头像（avatar）（日志已追加 N 条）` —— 检测到变更并已写日志
   - `（今日已记录，跳过）` —— 今天已写过同样条目，自动去重
   - `🆕 新增角色（首次记录）` —— 源目录出现新角色；页面尚未生成，走第 4 步后由 gen:chars 创建（日志首条自动为"导入旧版资源"）
   - `🗑 角色名：已从源目录移除` —— 源目录删了该角色；站点页面保留，不要自动删

3. **把变更摘要展示给用户确认**（哪个角色、改了什么、写了什么条目）。

4. **重新生成角色页面**（同步 description/avatar 到介绍文档、重建侧边栏）：
   ```bash
   pnpm -C site run gen:chars
   ```
   确认无 `⚠ 未能删除` 警告（有的话说明 dev server 没停干净）。

5. **重启 dev server** 让用户查看效果：
   ```bash
   pnpm dev:site
   ```
   提示用户刷新浏览器（默认 http://localhost:4859/）。

6. 变更涉及站点文件，提醒用户是否需要提交 git（`git add -A && git commit -m "..." && git push`）。是否提交由用户决定，不要擅自提交。

## 注意

- **快照文件** `site/scripts/sync-state.json` 由脚本自动维护（已加入 .gitignore），不要手动编辑；首次运行只建立基线、不写日志，属正常现象
- **新角色**不会由同步脚本写日志 —— 页面和"导入旧版资源"首条由 `gen:chars` 生成
- 判断角色归类（自建/二创）：规则在 `site/scripts/char-lib.mjs` 的 `SELF_MADE` 数组，两脚本共用，不要在两处维护
- 如果用户只改了站点里已有的 md（不涉及源目录），不需要跑本 skill，直接编辑即可
