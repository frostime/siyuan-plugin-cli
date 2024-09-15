#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { log, error } from './utils.js';
import { initGithubRepo, pushToGithub } from './github.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const templates = [
    {
        name: 'Vite + Svelte',
        url: 'https://github.com/siyuan-note/plugin-sample-vite-svelte'
    },
    {
        name: 'Vite',
        url: 'https://github.com/frostime/plugin-sample-vite'
    },
    {
        name: 'Vite + SolidJS',
        url: 'https://github.com/frostime/plugin-sample-vite-solidjs'
    },
    {
        name: 'Minimal',
        url: 'https://github.com/frostime/plugin-sample-min'
    }
];

async function promptUser(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

function checkGit() {
    try {
        execSync('git --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

async function getPluginInfo() {
    const name = await promptUser('🔌 Plugin Name: ');
    const author = await promptUser('👤 Author: ');
    const version = await promptUser('🏷️ Initial version (default v0.1.0): ') || 'v0.1.0';
    const description = await promptUser('📝 Plugin Description: ');
    return { name, author, version, description };
}

async function chooseTemplate() {
    console.log('📚 Choose a template:');
    templates.forEach((template, index) => {
        console.log(`   ${index + 1}. ${template.name}`);
    });
    const choice = await promptUser('👉 Enter your choice (1-4): ');
    return templates[parseInt(choice) - 1];
}

async function chooseCreationMethod() {
    const choice = await promptUser('📂 Create in:\n   1. New folder\n   2. Current folder\n👉 Enter your choice (1-2): ');
    return choice === '1' ? 'new' : 'current';
}

function createFolder(name) {
    if (!fs.existsSync(name)) {
        fs.mkdirSync(name);
        process.chdir(name);
    }
}

async function checkCurrentFolder() {
    if (fs.readdirSync('.').length > 0) {
        const confirm = await promptUser('⚠️ Current folder is not empty. Proceed? (y/n): ');
        return confirm.toLowerCase() === 'y';
    }
    return true;
}

function cloneRepository(url) {
    execSync(`git clone ${url} .`, { stdio: 'inherit' });
    fs.rmSync('.git', { recursive: true, force: true });
}

function updateJsonFiles(info) {
    const files = ['plugin.json', 'package.json'];
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            data.name = info.name;
            data.author = info.author;
            data.version = info.version.replace(/^v/, '');
            data.description = info.description;
            data.url = `https://github.com/${info.author}/${info.name}`;
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }
    });
}

function initGit() {
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
}

function printSummary(info) {
    console.log('\n📊 Plugin Summary:');
    console.log(`   Name: ${info.name}`);
    console.log(`   Author: ${info.author}`);
    console.log(`   Version: ${info.version}`);
    console.log(`   Description: ${info.description}`);
    console.log(`   GitHub URL: https://github.com/${info.author}/${info.name}`);
}

function printGithubInstructions(info) {
    console.log('\n🚀 To upload your plugin to GitHub:');
    console.log('1. Create a new repository on GitHub');
    console.log(`2. git remote add origin https://github.com/${info.author}/${info.name}.git`);
    console.log('3. git push -u origin master');
}

async function createSyPlugin() {
    console.log('🚀 Welcome to SiYuan Plugin Creator!');

    if (!checkGit()) {
        error('Git is not installed. Please install Git and try again.');
        process.exit(1);
    }

    const info = await getPluginInfo();
    const template = await chooseTemplate();
    const creationMethod = await chooseCreationMethod();

    if (creationMethod === 'new') {
        createFolder(info.name);
    } else if (!(await checkCurrentFolder())) {
        console.log('Operation cancelled.');
        process.exit(0);
    }

    console.log('📥 Cloning template...');
    cloneRepository(template.url);

    console.log('🔧 Updating configuration files...');
    updateJsonFiles(info);

    console.log('🔧 Initializing Git repository...');
    initGit();

    console.log(`✅ SiYuan plugin "${info.name}" has been created successfully!`);

    printSummary(info);

    const uploadToGithub = await promptUser('Would you like to upload this plugin to GitHub now? (y/n): ');
    if (uploadToGithub.toLowerCase() === 'y') {
        const repoUrl = await initGithubRepo(`${info.author}/${info.name}`, info.description);
        if (repoUrl) {
            await pushToGithub(`${info.author}/${info.name}`);
            console.log(`🎉 Your plugin has been uploaded to GitHub: ${repoUrl}`);
        } else {
            printGithubInstructions(info);
        }
    } else {
        printGithubInstructions(info);
    }

    rl.close();
}

createSyPlugin().catch(console.error);