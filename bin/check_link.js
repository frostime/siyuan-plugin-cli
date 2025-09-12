#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { log, error, getSiYuanDir, chooseTarget, getThisPluginName, cmpPath } from './utils.js';

let targetDir = '';

async function resolvePluginsDir() {
    log('>>> Resolving SiYuan plugins directory...');
    let res = await getSiYuanDir();
    if (!res || res.length === 0) {
        log('>>> Can not get SiYuan directory automatically, try to visit environment variable "SIYUAN_PLUGIN_DIR"....');
        let env = process.env?.SIYUAN_PLUGIN_DIR;
        if (env) {
            targetDir = env;
            log(`\tGot target directory from environment variable "SIYUAN_PLUGIN_DIR": ${targetDir}`);
        } else {
            error('\tCan not get SiYuan directory from environment variable "SIYUAN_PLUGIN_DIR".');
            error('\tPlease ensure SiYuan is running, or set SIYUAN_PLUGIN_DIR to <workspace>/data/plugins');
            process.exit(1);
        }
    } else {
        targetDir = await chooseTarget(res);
    }
    log(`>>> Plugins directory: ${targetDir}`);
}

await resolvePluginsDir();

const name = getThisPluginName();
if (name === null) {
    process.exit(1);
}
const targetPath = path.join(targetDir, name);

if (!fs.existsSync(targetPath)) {
    log(`Not linked or installed: ${targetPath} does not exist.`);
    process.exit(0);
}

const stat = fs.lstatSync(targetPath);
if (stat.isSymbolicLink()) {
    const linkDest = fs.readlinkSync(targetPath);
    // Build local paths to compare
    const devDir = path.join(process.cwd(), 'dev');
    const distDir = path.join(process.cwd(), 'dist');

    if (cmpPath(linkDest, devDir)) {
        log(`Linked: dev (symlink) -> ${linkDest}`);
        process.exit(0);
    }
    if (cmpPath(linkDest, distDir)) {
        log(`Linked: dist (symlink) -> ${linkDest}`);
        process.exit(0);
    }
    log(`Linked: symlink to another path -> ${linkDest}`);
    process.exit(0);
} else {
    log('Exists but not a symlink. Likely installed via make-install (copied files).');
    process.exit(0);
}
