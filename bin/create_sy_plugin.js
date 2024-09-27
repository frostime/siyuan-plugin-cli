#!/usr/bin/env node

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';
import { error } from './utils.js';
import { initGithub, checkRepoExists, createRepo, pushToGithub, getGithubToken, saveGithubToken, enableWorkflowPermissions } from './github.js';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const templates = [
    {
        name: 'siyuan-note/plugin-sample',
        url: 'https://github.com/siyuan-note/plugin-sample'
    },
    {
        name: 'siyuan-note/plugin-sample-vite-svelt',
        url: 'https://github.com/siyuan-note/plugin-sample-vite-svelte'
    },
    {
        name: 'frostime/plugin-sample-vite',
        url: 'https://github.com/frostime/plugin-sample-vite'
    },
    {
        name: 'frostime/plugin-sample-vite-solidjs',
        url: 'https://github.com/frostime/plugin-sample-vite-solidjs'
    },
    {
        name: 'frostime/plugin-sample-min',
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
    return { name, author, version };
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
            const url = `https://github.com/${info.author}/${info.name}`;
            data[file === 'plugin.json' ? 'url' : 'repository'] = url;
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }
    });
}

function initGit() {
    try {
        execSync('git init', { stdio: 'pipe' });
        execSync('git add .', { stdio: 'pipe' });
        execSync('git branch -m master main', { stdio: 'pipe' });
        execSync('git commit -m "🎉 Initial commit"', { stdio: 'pipe' });
    } catch (error) {
        console.error('❌ Error initializing Git repository:', error.message);
        console.error('Stack Trace:', error.stack);
    }
}

function printSummary(info) {
    console.log('\n📊 Plugin Summary:');
    console.log(`   Name: ${info.name}`);
    console.log(`   Author: ${info.author}`);
    console.log(`   Version: ${info.version}`);
    console.log(`   GitHub URL: https://github.com/${info.author}/${info.name}`);
}

function printGithubInstructions(info) {
    console.log('\n🚀 To upload your plugin to GitHub:');
    console.log(`1. Create a new repository on GitHub: ${info.name}`);
    console.log(`2. git remote add origin https://github.com/${info.author}/${info.name}.git`);
    console.log('3. git push -u origin main');
}

async function handleGithubInteraction(info) {
    const useGithub = await promptUser('\n🚀 Do you want to upload your plugin to GitHub now? (y/n): ');
    if (useGithub.toLowerCase() !== 'y') {
        return;
    }

    let token = getGithubToken();
    if (!token) {
        console.log('To interact with GitHub, you need to provide a personal access token.');
        console.log('You can create one at https://github.com/settings/tokens');
        console.log('Ensure the token has the "repo" scope.');
        token = await promptUser('Enter your GitHub personal access token: ');
        const saveToken = await promptUser('Do you want to save this token for future use? (y/n): ');
        if (saveToken.toLowerCase() === 'y') {
            saveGithubToken(token);
        }
    }

    await initGithub(token);

    let repoUrl = '';
    const repoExists = await checkRepoExists(info.author, info.name);
    if (repoExists) {
        console.log(`Repository already exists: https://github.com/${info.author}/${info.name}`);
        const proceed = await promptUser('Do you want to push to this existing repository? (y/n): ');
        if (proceed.toLowerCase() !== 'y') {
            return;
        }
    } else {
        console.log(`Creating a new repository: ${info.name}`);
        repoUrl = await createRepo(info.name, `SiYuan plugin: ${info.name}`);
        // Wait several seconds for the repository to be created
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('Repository created: ' + repoUrl);
    }

    const sshUr = `git@github.com:${info.author}/${info.name}.git`;
    console.log(`Pushing to GitHub: ${sshUr}`);
    await pushToGithub(sshUr);
    console.log('Successfully pushed to GitHub!\n');

    const workflow = await promptUser('⚡ Do you want to enable GitHub Actions for your plugin? (y/n): ');
    if (workflow.toLowerCase() === 'y') {
        console.log('Enabling GitHub Actions...');
        enableWorkflowPermissions(info.author, info.name);
        console.log('✔️ GitHub Actions enabled!');
    }

    console.log(`✨ Congratulations! Now you can visit your plugin at: ${repoUrl}`);

}

async function createSyPlugin() {
    // Get the directory name of the current module
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const thisDir = fs.realpathSync(__dirname);
    const packageJson = JSON.parse(fs.readFileSync(thisDir + '/../package.json', 'utf8'));
    const { author, version } = packageJson;
    const copyright = `Copyright © ${new Date().getFullYear()} ${author}. Version ${version}`;
    console.log('🚀 Welcome to SiYuan Plugin Creator! ' + copyright);

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

    printGithubInstructions(info);

    try {
        await handleGithubInteraction(info);
    } catch (error) {
        console.error('❌ During GitHub interaction, something went wrong');
        console.error('Stack Trace:', error.stack);
    }

    rl.close();
}

createSyPlugin().catch(console.error);