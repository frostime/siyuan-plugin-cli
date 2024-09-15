/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-09-15 20:25:08
 * @FilePath     : /bin/github.js
 * @LastEditTime : 2024-09-15 20:25:13
 * @Description  : 
 */
import fs from 'fs';
import { Octokit } from '@octokit/rest';
import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';

const CONFIG_FILE = '.github-config.json';

async function getGithubToken() {
    if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        return config.token;
    }

    console.log('To interact with GitHub, you need to authenticate.');
    console.log('Please follow these steps:');
    console.log('1. Go to https://github.com/settings/tokens');
    console.log('2. Click "Generate new token"');
    console.log('3. Give your token a name and select the "repo" scope');
    console.log('4. Copy the generated token');

    const auth = createOAuthDeviceAuth({
        clientType: "oauth-app",
        clientId: "YOUR_CLIENT_ID",
        scopes: ["repo"],
        onVerification(verification) {
            console.log("Open %s", verification.verification_uri);
            console.log("Enter code: %s", verification.user_code);
        },
    });

    const tokenAuth = await auth({ type: "oauth" });
    const token = tokenAuth.token;

    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ token }, null, 2));
    return token;
}

export async function initGithubRepo(repoName, description) {
    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    try {
        const { data } = await octokit.repos.createForAuthenticatedUser({
            name: repoName,
            description: description,
            auto_init: true,
        });
        return data.html_url;
    } catch (error) {
        if (error.status === 422) {
            console.error('Repository already exists.');
        } else {
            console.error('Error creating repository:', error.message);
        }
        return null;
    }
}

export async function pushToGithub(repoName) {
    const token = await getGithubToken();
    const remote = `https://${token}@github.com/${repoName}.git`;

    try {
        execSync('git init', { stdio: 'inherit' });
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
        execSync(`git remote add origin ${remote}`, { stdio: 'inherit' });
        execSync('git push -u origin master', { stdio: 'inherit' });
        console.log('Successfully pushed to GitHub');
    } catch (error) {
        console.error('Error pushing to GitHub:', error.message);
    }
}