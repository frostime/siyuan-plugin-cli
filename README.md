## Chinese

本项目为 SiYuan 插件开发的一些 CLI 工具。

关于插件开发，请参考：[siyuan-note/plugin-sample-vite-svel](https://github.com/siyuan-note/plugin-sample-vite-svelte)

#### 安装

```bash
pnpm add -D siyuan-plugin-cli
```

#### 使用

- `npx make-link` 创建软链接到 SiYuan 插件目录，将插件开发下的 `dev` 目录链接到 SiYuan 插件目录下的 `plugins` 目录下
- `npx make-link-win` 同上，适用于 Windows 系统，会自动需求管理员权限
- `npx make-install` 安装插件到 SiYuan 插件目录下
    1. 首先执行 `npm run build` 编译插件
    2. 将 `dist` 目录下的插件文件复制到 SiYuan 对应插件的目录中
- `npx update-version` 更新插件版本号，会自动更新 `package.json` 和 `plugin.json` 中的 `version` 字段

## English

This project provides some CLI tools for developing SiYuan plugins.

For plugin development, please refer to: [siyuan-note/plugin-sample-vite-svel](https://github.com/siyuan-note/plugin-sample-vite-svelte)

#### Installation

```bash
pnpm add -D siyuan-plugin-cli
```

#### Usage

- `npx make-link`: Creates a symbolic link to the SiYuan plugin directory, linking the `dev` directory of the plugin development to the `plugins` directory in the SiYuan plugin directory.
- `npx make-link-win`: Same as above, suitable for Windows systems, will automatically request administrator permissions.
- `npx make-install`: Installs the plugin to the SiYuan plugin directory.
    1. First, execute `npm run build` to compile the plugin.
    2. Copies the plugin files from the `dist` directory to the corresponding SiYuan plugin directory.
- `npx update-version`: Updates the plugin version number, automatically updating the `version` field in `package.json` and `plugin.json`.