#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

// Utility to read JSON file
function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(err);
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (e) {
                reject(e);
            }
        });
    });
}

// Utility to write JSON file
function writeJsonFile(filePath, jsonData) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Utility to prompt the user for input
function promptUser(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

// Function to parse the version string
function parseVersion(version) {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch };
}

// Function to auto-increment version parts
function incrementVersion(version, type) {
    let { major, minor, patch } = parseVersion(version);

    switch (type) {
        case 'major':
            major++;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor++;
            patch = 0;
            break;
        case 'patch':
            patch++;
            break;
        default:
            break;
    }

    return `${major}.${minor}.${patch}`;
}

const chooseNewVersion = async (currentVersion) => {
    // Calculate potential new versions for auto-update
    const newPatchVersion = incrementVersion(currentVersion, 'patch');
    const newMinorVersion = incrementVersion(currentVersion, 'minor');
    const newMajorVersion = incrementVersion(currentVersion, 'major');

    // Prompt the user with formatted options
    console.log('🔄  How would you like to update the version?\n');
    console.log(`   1️⃣  Auto update \x1b[33mpatch\x1b[0m version   (new version: \x1b[32m${newPatchVersion}\x1b[0m)`);
    console.log(`   2️⃣  Auto update \x1b[33mminor\x1b[0m version   (new version: \x1b[32m${newMinorVersion}\x1b[0m)`);
    console.log(`   3️⃣  Auto update \x1b[33mmajor\x1b[0m version   (new version: \x1b[32m${newMajorVersion}\x1b[0m)`);
    console.log(`   4️⃣  Input version \x1b[33mmanually\x1b[0m`);
    // Press 0 to skip version update
    console.log('   0️⃣  Quit without updating\n');

    const updateChoice = await promptUser('👉  Please choose (1/2/3/4): ');

    let newVersion;

    switch (updateChoice.trim()) {
        case '1':
            newVersion = newPatchVersion;
            break;
        case '2':
            newVersion = newMinorVersion;
            break;
        case '3':
            newVersion = newMajorVersion;
            break;
        case '4':
            newVersion = await promptUser('✍️  Please enter the new version (in a.b.c format): ');
            break;
        case '0':
            console.log('\n🛑  Skipping version update.');
            return null;
        default:
            console.log('\n❌  Invalid option, no version update.');
            return null;
    }

    return newVersion;

}

// Helper function to check file existence
const fileExists = (filePath) => fs.existsSync(filePath);

// Main script
(async function () {
    try {
        const pluginJsonPath = path.join(process.cwd(), 'plugin.json');
        const packageJsonPath = path.join(process.cwd(), 'package.json');

        // Check if plugin.json exists
        if (!fileExists(pluginJsonPath)) {
            throw new Error('plugin.json file is required but not found.');
        }

        // Read plugin.json
        const pluginData = await readJsonFile(pluginJsonPath);

        // Try to read package.json only if it exists
        let packageData = {};
        const packageExists = fileExists(packageJsonPath);
        if (packageExists) {
            packageData = await readJsonFile(packageJsonPath);
        }

        // Get the current version from plugin.json (if package.json exists, use it as a fallback)
        const currentVersion = pluginData.version || (packageExists ? packageData.version : null);

        if (!currentVersion) {
            throw new Error('No version found in plugin.json (or package.json if it exists).');
        }

        console.log(`\n🌟  Current version: \x1b[36m${currentVersion}\x1b[0m\n`);

        let newVersion;
        // check if argument is provided
        const choice = ['patch', 'minor', 'major'];
        if (choice.includes(process.argv[2])) {
            newVersion = incrementVersion(currentVersion, process.argv?.[2]);
            console.log(`\n✅  Version successfully updated to: \x1b[32m${newVersion}\x1b[0m\n`);
            return;
        } else {
            newVersion = await chooseNewVersion(currentVersion);
            if (!newVersion) {
                return;
            }
        }

        // Update the version in plugin.json
        pluginData.version = newVersion;
        await writeJsonFile(pluginJsonPath, pluginData);

        // If package.json exists, update its version as well
        if (packageExists) {
            packageData.version = newVersion;
            await writeJsonFile(packageJsonPath, packageData);
        }

        console.log(`\n✅  Version successfully updated to: \x1b[32m${newVersion}\x1b[0m\n`);

    } catch (error) {
        console.error('❌  Error:', error.message);
    }
})();
