# English Documentation

This project provides some CLI tools for SiYuan plugin development.

For plugin development, please refer to: [siyuan-note/plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte)

## Installation

```bash
npm install --save-dev siyuan-plugin-cli
```

Or you can install it globally:

```bash
npm install -g siyuan-plugin-cli
```

## Usage

### Using `create-sy-plugin` & `create-plugin` to create a plugin project

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

### `make-link` and `make-install`

- `npx make-link` creates a symbolic link to the SiYuan plugin directory
  - Links the `dev` directory under plugin development to the `plugins` directory under the SiYuan plugin directory
  - Note: On Windows, it is recommended to run `npx make-link-win`
- `npx make-install` installs the plugin to the SiYuan plugin directory
  - Copies the files from the `dist` directory under plugin development to the SiYuan plugin directory

Note: On Windows, administrative privileges are required to create symbolic links. You can run `npx make-link` in administrator mode, or use `npx make-link-win` to automatically request administrative privileges.

`make-link` uses the `./dev` directory as the plugin development directory by default; `make-install` uses the `./dist` directory as the directory for compiled plugin files by default.

You can specify the directory in the script by passing a parameter, for example:

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