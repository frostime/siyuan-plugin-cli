[README](./README.md) | [简体中文](./README.zh-CN.md)

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

### Development link vs Production install

- Development: `npx make-link` creates a symbolic link to the SiYuan plugin directory.
  - By default, links the local `./dev` directory to `<workspace>/data/plugins/<plugin-name>`.
  - You can also link `./dist` (or any directory) using flags:
    - `--dist` to link `./dist`
    - `--dev` to force `./dev`
    - `--src=<dir>` or a positional `<dir>` to link a custom folder
  - On Windows, it is recommended to run `npx make-link-win` (admin privileges required to create symlinks).

- Production: `npx make-install` installs the built plugin to the SiYuan plugin directory.
  - Copies the files from your build output (default `./dist`) into the SiYuan `plugins/<your-plugin-name>` directory.
  - This is the command to use when you want to test the production build (no symlinks).

- Check current status: `npx check-link` tells you whether your plugin is linked in the chosen workspace,
  and if so whether it points to `dev`, `dist`, or another path. If files were copied via `make-install`,
  it will report that the target exists but is not a symlink.

Notes:
- `make-link` uses `./dev` by default; use `--dist` or `--src=<dir>` to change.
- If the target plugin already has a symlink, `make-link` will overwrite it. It will ask for confirmation only when switching between this project's `./dev` and `./dist` (dev ↔ dist); other changes overwrite silently.
- `make-install` uses `./dist` by default. You can pass a custom output directory name as the first argument, e.g. `npx make-install build`.
- On Windows, admin privileges are only needed for `make-link`; `make-install` performs normal file copy.

Examples:

```bash
# Create a dev symlink from ./dev (default)
npx make-link

# Create a symlink from ./dist
npx make-link --dist

# Or specify a custom folder (e.g., ./build)
npx make-link --src=build

# Install the production build from ./dist (default)
npx make-install

# Install from a custom build directory (e.g., ./build)
npx make-install build

# Check whether the plugin is linked (and to which path)
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