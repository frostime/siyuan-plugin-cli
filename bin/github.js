/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-09-16 21:38:16
 * @FilePath     : /bin/github.js
 * @LastEditTime : 2024-10-02 19:09:46
 * @Description  : 
 */
import { Octokit } from "@octokit/rest";
import fs from 'fs';
import { execSync } from 'child_process';

let octokit;

export async function initGithub(token) {
    octokit = new Octokit({ auth: token });
}

export async function checkRepoExists(owner, repo) {
    try {
        await octokit.repos.get({ owner, repo });
        return true;
    } catch (error) {
        if (error.status === 404) {
            return false;
        }
        throw error;
    }
}

export async function createRepo(name, description) {
    const { data } = await octokit.repos.createForAuthenticatedUser({
        name,
        description,
        auto_init: false
    });
    return data.html_url;
}

export async function pushToGithub(remoteUrl) {
    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
    execSync('git push -u origin main', { stdio: 'inherit' });
}

export function getGithubToken() {
    const configPath = `${process.env.HOME}/.siyuan-plugin-cli`;
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('🔑 Using existing GitHub token stored in ~/.siyuan-plugin-cli');
        return config.githubToken;
    }
    return null;
}

export function saveGithubToken(token) {
    const configPath = `${process.env.HOME}/.siyuan-plugin-cli`;
    const config = { githubToken: token };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('🔑 GitHub token saved in ~/.siyuan-plugin-cli');
}

/**
 * Function to enable workflow permissions and configure repository settings
 * @param {*} owner 
 * @param {*} repo 
 */
export async function enableWorkflowPermissions(owner, repo) {
    try {
        await octokit.repos.update({
            owner,
            repo,
            settings: {
                // Enable workflows with read and write permissions
                default_workflow_permissions: 'write',
                // Allow GitHub Actions to create and approve pull requests
                allow_fork_pull_requests: true,
                allow_fork_pull_requests_externally: true
            }
        });
        console.log(`Workflow permissions updated successfully for ${repo}`);
    } catch (error) {
        console.error(`Failed to update workflow permissions: ${error.message}`);
        throw error;
    }
}
