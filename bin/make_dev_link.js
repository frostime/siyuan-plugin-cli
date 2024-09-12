#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { log, error, getSiYuanDir, chooseTarget, getThisPluginName, makeSymbolicLink } from './utils.js';

let targetDir = '';
let devDirName = 'dev';

// Parse from command line arguments
if (process.argv.length > 2) {
    let arg = process.argv[2];
    log(`>>> Got dev directory name from command line argument: ${arg}`);
    if (arg !== '') {
        devDirName = arg.replace(/\/$/, '');
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
 * 2. The dev directory, which contains the compiled plugin code
 */
const devDir = path.join(targetDir, devDirName);
if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir);
}


/**
 * 3. The target directory to make symbolic link to dev directory
 */
const name = getThisPluginName();
if (name === null) {
    process.exit(1);
}
const targetPath = `${targetDir}/${name}`;

/**
 * 4. Make symbolic link
 */
makeSymbolicLink(devDir, targetPath);
