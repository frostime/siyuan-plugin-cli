#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scriptPath = path.join(__dirname, 'make_dev_link.js');
const workingDirectory = process.cwd();
// console.log(`Working directory: ${workingDirectory}`);

// Forward all arguments to the underlying script
const forwardedArgs = process.argv.slice(2).join(' ');

// Use Set-Location to change the working directory in PowerShell
const run = `Set-Location -Path "${workingDirectory}"; node "${scriptPath}" ${forwardedArgs}; pause`;

const command = `
powershell -Command "Start-Process -Verb RunAs powershell.exe -Args '-Command \"${run}\"'"
`.trim();

// console.log(`Running command: ${command}`);

exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        console.error(stderr);
        return;
    }
    console.log(stdout);
});
