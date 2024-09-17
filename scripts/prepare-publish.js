/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-09-16 21:43:31
 * @FilePath     : /scripts/prepare-publish.js
 * @LastEditTime : 2024-09-16 21:43:37
 * @Description  : 
 */
import fs from 'fs';
import path from 'path';

// 确保 bin 目录下的所有 .js 文件都有可执行权限
const binDir = path.join(process.cwd(), 'bin');
fs.readdirSync(binDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(binDir, file);
    fs.chmodSync(filePath, '755');
  }
});

console.log('Prepared for publishing. All bin/*.js files are now executable.');
