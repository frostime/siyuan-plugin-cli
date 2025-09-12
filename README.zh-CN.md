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

### `make-link` 与 `make-install`

- `npx make-link` 创建软链接到 SiYuan 插件目录
  - 将插件开发下的 `dev` 目录链接到 SiYuan 插件目录下的 `plugins` 目录下
  - 注意：在 Windows 下推荐运行 `npx make-link-win`
- `npx make-install` 安装插件到 SiYuan 插件目录下
    - 将插件开发下的 `dist` 目录中的文件复制到 SiYuan 的插件目录中

注意: 在 Windows 下，需要管理员权限来创建软链接，你可以在管理员模式下运行 `npx make-link`，或者使用 `npx make-link-win` 来自动请求管理员权限。

`make-link` 默认使用 `./dev` 目录作为插件开发目录；`make-install` 默认使用 `./dist` 目录作为编译后的插件文件。

你可以在脚本后面传入一个参数来指定目录，例如:

```bash
npx make-link ./
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