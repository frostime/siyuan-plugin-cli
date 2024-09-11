#!/usr/bin/env node

import { exec } from 'child_process';
// import path from 'node:path';


exec(`powershell -File ./bin/make_dev_link_win.ps1`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(stdout);
});
