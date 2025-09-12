#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'node:readline';
import { log, error, getSiYuanDir, chooseTarget, getThisPluginName, cmpPath } from './utils.js';

let targetDir = '';
let devDirName = 'dev';

// Parse flags/arguments
// Supported:
//   - no args: link ./dev
//   - positional <dir>: link ./<dir>
//   - --dist: link ./dist
//   - --dev: link ./dev
//   - --src=<dir>: link ./<dir>
if (process.argv.length > 2) {
    const args = process.argv.slice(2);
    // Prefer explicit flags
    const srcArg = args.find(a => a.startsWith('--src='));
    if (srcArg) {
        devDirName = srcArg.split('=')[1] || 'dev';
        log(`>>> Using --src: ${devDirName}`);
    } else if (args.includes('--dist')) {
        devDirName = 'dist';
        log('>>> Using --dist, will link ./dist');
    } else if (args.includes('--dev')) {
        devDirName = 'dev';
        log('>>> Using --dev, will link ./dev');
    } else if (args[0] && !args[0].startsWith('-')) {
        const arg = args[0];
        log(`>>> Got directory name from argument: ${arg}`);
        if (arg !== '') {
            devDirName = arg.replace(/\/$/, '');
        }
    }
}

/**
 * 1. Get the parent directory to install the plugin
 */
log('>>> Try to visit constant "targetDir" in make_dev_link.js...');
if (targetDir === '') {
    log('>>> Constant "targetDir" is empty, try to get SiYuan directory automatically....');
    let res = await getSiYuanDir();

    if (!res || res.length === 0) {
        log('>>> Can not get SiYuan directory automatically, try to visit environment variable "SIYUAN_PLUGIN_DIR"....');
        let env = process.env?.SIYUAN_PLUGIN_DIR;
        if (env) {
            targetDir = env;
            log(`\tGot target directory from environment variable "SIYUAN_PLUGIN_DIR": ${targetDir}`);
        } else {
            error('\tCan not get SiYuan directory from environment variable "SIYUAN_PLUGIN_DIR", failed!');
            process.exit(1);
        }
    } else {
        targetDir = await chooseTarget(res);
    }

    log(`>>> Successfully got target directory: ${targetDir}`);
}
if (!fs.existsSync(targetDir)) {
    error(`Failed! Plugin directory not exists: "${targetDir}"`);
    error('Please set the plugin directory in scripts/make_dev_link.js');
    process.exit(1);
}

/**
 * 2. The dev/dist directory to link
 */
const devDir = path.join(process.cwd(), devDirName);
if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir);
}

/**
 * 3. The target directory to make symbolic link to dev/dist directory
 */
const name = getThisPluginName();
if (name === null) {
    process.exit(1);
}
const targetPath = `${targetDir}/${name}`;

// Helper to prompt yes/no
async function confirm(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ans = await new Promise((resolve) => rl.question(question, resolve));
    rl.close();
    const a = (ans || '').trim().toLowerCase();
    return a === 'y' || a === 'yes';
}

/**
 * 4. Create or overwrite symlink with conditional warning
 */
if (!fs.existsSync(targetPath)) {
    fs.symlinkSync(devDir, targetPath, 'dir');
    log(`Done! Created symlink ${targetPath} --> ${devDir}`);
    process.exit(0);
}

// Target exists
const isSymbol = fs.lstatSync(targetPath).isSymbolicLink();
if (!isSymbol) {
    error(`Failed! ${targetPath} already exists and is not a symbolic link`);
    process.exit(1);
}

const existedPath = fs.readlinkSync(targetPath);
if (cmpPath(existedPath, devDir)) {
    log(`Good! ${targetPath} is already linked to ${devDir}`);
    process.exit(0);
}

// Determine if switching between this project's ./dev and ./dist
const projDev = path.join(process.cwd(), 'dev');
const projDist = path.join(process.cwd(), 'dist');
const newIsDev = cmpPath(devDir, projDev);
const newIsDist = cmpPath(devDir, projDist);
const oldIsDev = cmpPath(existedPath, projDev);
const oldIsDist = cmpPath(existedPath, projDist);

let shouldWarn = false;
let warnMsg = '';
if ((oldIsDev && newIsDist) || (oldIsDist && newIsDev)) {
    shouldWarn = true;
    warnMsg = `>>> Detected switching link from ${oldIsDev ? './dev' : './dist'} to ${newIsDev ? './dev' : './dist'}. Overwrite? [y/N] `;
}

(async () => {
    if (shouldWarn) {
        const ok = await confirm(warnMsg);
        if (!ok) {
            log('Aborted. No changes made.');
            process.exit(0);
        }
    }
    // Overwrite without warning for other cases
    fs.unlinkSync(targetPath);
    fs.symlinkSync(devDir, targetPath, 'dir');
    log(`Done! Updated symlink ${targetPath} --> ${devDir}`);
})();
