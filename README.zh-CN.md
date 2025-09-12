# 简体中文

本项目为 SiYuan 插件开发的一些 CLI 工具。

关于插件开发，请参考：[siyuan-note/plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte)

## 安装

```bash
npm install --save-dev siyuan-plugin-cli
```

或者你也可以在全局安装 `siyuan-plugin-cli`:

```bash
npm install -g siyuan-plugin-cli
```

## 使用

### 使用 `create-sy-plugin` & `create-plugin` 创建插件项目

运行`npx create-sy-plugin` 或 `npx create-plugin` ，可以从模板中创建一个插件。

该命令会提供一个的交互式命令行：

- 输入插件的基本信息
- 选择插件模板
- 从模板中创建插件项目（本质是 `git clone` 到本地）
- 更新本地插件项目的基本信息
- 上传到 GitHub（可选）

如果选择上传到 GitHub，则会自动创建远程仓库，并将本地项目推送到远程仓库。该步骤需要一个 Github Token，如果用户许可，cli 命令还会将 Token 缓存到本地的 `~/.siyuan-plugin-cli` 文件中。

```bash
H:/Tmp/test-code
❯❯❯ npx create-plugin
🚀 Welcome to SiYuan Plugin Creator! Copyright © 2024 frostime. Version 2.3.0
🔌 Plugin Name: plugin-test
👤 Author: abc
🏷️ Initial version (default v0.1.0):
📚 Choose a template:
   1. siyuan-note/plugin-sample
   2. siyuan-note/plugin-sample-vite-svelt
   3. frostime/plugin-sample-vit
   4. frostime/plugin-sample-vite-solidjs
   5. frostime/plugin-sample-min
👉 Enter your choice (1-4): 5
📂 Create in:
   1. New folder
   2. Current folder
👉 Enter your choice (1-2): 1
📥 Cloning template...
Cloning into '.'...
remote: Enumerating objects: 31, done.
remote: Counting objects: 100% (31/31), done.
remote: Compressing objects: 100% (22/22), done.
remote: Total 31 (delta 6), reused 20 (delta 2), pack-reused 0 (from 0)
Receiving objects: 100% (31/31), 27.60 KiB | 455.00 KiB/s, done.
Resolving deltas: 100% (6/6), done.
🔧 Updating configuration files...
🔧 Initializing Git repository...
✅ SiYuan plugin "plugin-test" has been created successfully!

# 后续步骤略
```

### 开发链接 vs 生产安装

- 开发模式：`npx make-link` 创建到 SiYuan 插件目录的软链接。
  - 默认把本地 `./dev` 目录链接到 `<workspace>/data/plugins/<plugin-name>`。
  - 也可以通过参数把 `./dist`（或任意目录）链接过去：
    - 使用 `--dist` 链接 `./dist`
    - 使用 `--dev` 强制链接 `./dev`
    - 使用 `--src=<dir>` 或 位置参数 `<dir>` 链接自定义目录
  - 在 Windows 上推荐使用 `npx make-link-win`（创建软链接需要管理员权限）。

- 生产模式：`npx make-install` 将构建后的插件复制安装到 SiYuan 插件目录。
  - 会把你的构建输出（默认 `./dist`）复制到 SiYuan 的 `plugins/<你的插件名>` 目录。
  - 当你要测试生产构建（不使用软链接）时使用这个命令。

- 状态检查：`npx check-link` 会告诉你当前插件是否在所选工作空间下被链接，
  如果已链接，会标明是指向 `dev`、`dist` 还是其它路径；若为复制安装（非软链），会提示“不是软链”。

注意：
- `make-link` 默认使用 `./dev`；可以使用 `--dist` 或 `--src=<dir>` 切换。
- 如果目标插件目录已有软链接，`make-link` 会进行覆盖。仅当从本项目的 `./dev` 与 `./dist` 之间切换（dev ↔ dist）时会进行覆盖确认提示；其它情况将直接覆盖。
- `make-install` 默认使用 `./dist`。你可以把自定义输出目录名作为第一个参数传入，例如：`npx make-install build`。
- Windows 上只有 `make-link` 需要管理员权限；`make-install` 是普通文件复制。

示例：

```bash
# 从 ./dev 创建开发软链接（默认）
npx make-link

# 从 ./dist 创建软链
npx make-link --dist

# 指定自定义目录（例如 ./build）
npx make-link --src=build

# 从默认的 ./dist 安装生产构建
npx make-install

# 从自定义目录（例如 ./build）安装
npx make-install build

# 检查是否已链接（以及链接到哪个路径）
npx check-link
```

```bash
❯❯❯ npx make-link
>>> Try to visit constant "targetDir" in make_dev_link.js...
>>> Constant "targetDir" is empty, try to get SiYuan directory automatically....
>>> Got 2 SiYuan workspaces
        [0] C:\Users\EEG\Documents\思源笔记
        [1] H:\临时文件夹\SiYuanDevSpace
        Please select a workspace[0-1]:
```

### `update-version`

运行 `npx update-version` 以更新插件版本号，该命令会自动更新 `package.json` 和 `plugin.json` 中的 `version` 字段

```bash
❯❯❯ npx update-version

🌟  Current version: 0.1.0

🔄  How would you like to update the version?

   1️⃣  Auto update patch version   (new version: 0.1.1)
   2️⃣  Auto update minor version   (new version: 0.2.0)
   3️⃣  Auto update major version   (new version: 1.0.0)
   4️⃣  Input version manually
   0️⃣  Quit without updating

👉  Please choose (1/2/3/4):
```