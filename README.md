## English Documentation

This project provides some CLI tools for SiYuan plugin development.

For plugin development, please refer to: [siyuan-note/plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte)

### Installation

```bash
npm install --save-dev siyuan-plugin-cli
```

Or you can install it globally:

```bash
npm install -g siyuan-plugin-cli
```

### Usage

#### Using `create-sy-plugin` & `create-plugin` to create a plugin project

Run `npx create-sy-plugin` or `npx create-plugin` to create a plugin from a template.

This command provides an interactive command-line interface:

- Enter the basic information of the plugin
- Select the plugin template
- Create the plugin project from the template (essentially `git clone` to local)
- Update the basic information of the local plugin project
- Upload to GitHub (optional)

If you choose to upload to GitHub, it will automatically create a remote repository and push the local project to the remote repository. This step requires a GitHub Token. If the user permits, the CLI command will also cache the Token in the local `~/.siyuan-plugin-cli` file.

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

# Omit the following steps if you don't want to upload to GitHub
```

#### `make-link` and `make-install`

- `npx make-link` creates a symbolic link to the SiYuan plugin directory
  - Links the `dev` directory under plugin development to the `plugins` directory under the SiYuan plugin directory
  - Note: On Windows, it is recommended to run `npx make-link-win`
- `npx make-install` installs the plugin to the SiYuan plugin directory
  - Copies the files from the `dist` directory under plugin development to the SiYuan plugin directory

Note: On Windows, administrative privileges are required to create symbolic links. You can run `npx make-link` in administrator mode, or use `npx make-link-win` to automatically request administrative privileges.

`make-link` uses the `./dev` directory as the plugin development directory by default; `make-install` uses the `./dist` directory as the directory for compiled plugin files by default.

```bash
❯❯❯ npx make-link
>>> Try to visit constant "targetDir" in make_dev_link.js...
>>> Constant "targetDir" is empty, try to get SiYuan directory automatically....
>>> Got 2 SiYuan workspaces
        [0] C:\Users\EEG\Documents\思源笔记
        [1] H:\临时文件夹\SiYuanDevSpace
        Please select a workspace[0-1]:
```

#### `update-version`

Run `npx update-version` to update the plugin version number. This command will automatically update the `version` field in `package.json` and `plugin.json`.

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

## 中文文档

本项目为 SiYuan 插件开发的一些 CLI 工具。

关于插件开发，请参考：[siyuan-note/plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte)

### 安装

```bash
npm install --save-dev siyuan-plugin-cli
```

或者你也可以在全局安装 `siyuan-plugin-cli`:

```bash
npm install -g siyuan-plugin-cli
```

### 使用

#### 使用 `create-sy-plugin` & `create-plugin` 创建插件项目

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

#### `make-link` 与 `make-install`


- `npx make-link` 创建软链接到 SiYuan 插件目录
  - 将插件开发下的 `dev` 目录链接到 SiYuan 插件目录下的 `plugins` 目录下
  - 注意：在 Windows 下推荐运行 `npx make-link-win`
- `npx make-install` 安装插件到 SiYuan 插件目录下
    - 将插件开发下的 `dist` 目录中的文件复制到 SiYuan 的插件目录中

注意: 在 Windows 下，需要管理员权限来创建软链接，你可以在管理员模式下运行 `npx make-link`，或者使用 `npx make-link-win` 来自动请求管理员权限。

`make-link` 默认使用 `./dev` 目录作为插件开发目录；`make-install` 默认使用 `./dist` 目录作为编译后的插件文件。


```bash
❯❯❯ npx make-link
>>> Try to visit constant "targetDir" in make_dev_link.js...
>>> Constant "targetDir" is empty, try to get SiYuan directory automatically....
>>> Got 2 SiYuan workspaces
        [0] C:\Users\EEG\Documents\思源笔记
        [1] H:\临时文件夹\SiYuanDevSpace
        Please select a workspace[0-1]:
```

#### `update-version`

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
