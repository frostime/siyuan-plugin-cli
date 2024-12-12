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

// Function to parse the version string with suffixes
function parseVersion(version) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)([.\-][a-zA-Z0-9]+)?$/);
    if (!match) {
        throw new Error(`Invalid version format: ${version}`);
    }
    const [, major, minor, patch, suffix = ''] = match;
    return {
        major: parseInt(major, 10),
        minor: parseInt(minor, 10),
        patch: parseInt(patch, 10),
        suffix
    };
}

// Function to increment version parts and preserve/modify suffixes
function incrementVersion(version, type) {
    const { major, minor, patch, suffix } = parseVersion(version);
    let newVersion;

    switch (type) {
        case 'major':
            newVersion = `${major + 1}.0.0`;
            break;
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`;
            break;
        case 'patch':
            newVersion = `${major}.${minor}.${patch + 1}`;
            break;
        case 'suffix': // Increment suffix, if it exists
            if (!suffix) {
                throw new Error('No suffix to increment.');
            }
            const suffixMatch = suffix.match(/([a-zA-Z\-]+)(\d+)$/);
            if (!suffixMatch) {
                throw new Error('Unsupported suffix format for incrementing.');
            }
            const [_, base, num] = suffixMatch;
            newVersion = `${major}.${minor}.${patch}${base}${parseInt(num, 10) + 1}`;
            break;
        default:
            throw new Error(`Unsupported increment type: ${type}`);
    }

    return newVersion;
}

// Enhanced prompt to choose new version
const chooseNewVersion = async (currentVersion) => {
    // Calculate potential new versions for auto-update
    const newPatchVersion = incrementVersion(currentVersion, 'patch');
    const newMinorVersion = incrementVersion(currentVersion, 'minor');
    const newMajorVersion = incrementVersion(currentVersion, 'major');

    console.log('🔄  How would you like to update the version?\n');
    console.log(`   1️⃣  Auto update \x1b[33mpatch\x1b[0m version   (new version: \x1b[32m${newPatchVersion}\x1b[0m)`);
    console.log(`   2️⃣  Auto update \x1b[33mminor\x1b[0m version   (new version: \x1b[32m${newMinorVersion}\x1b[0m)`);
    console.log(`   3️⃣  Auto update \x1b[33mmajor\x1b[0m version   (new version: \x1b[32m${newMajorVersion}\x1b[0m)`);
    console.log(`   4️⃣  Increment suffix if applicable`);
    console.log(`   5️⃣  Input version \x1b[33mmanually\x1b[0m`);
    console.log('   0️⃣  Quit without updating\n');

    const updateChoice = await promptUser('👉  Please choose (1/2/3/4/5): ');

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
            try {
                newVersion = incrementVersion(currentVersion, 'suffix');
            } catch (error) {
                console.error(`❌  Error: ${error.message}`);
                return null;
            }
            break;
        case '5':
            newVersion = await promptUser('✍️  Please enter the new version (in valid format): ');
            break;
        case '0':
            console.log('\n🛑  Skipping version update.');
            return null;
        default:
            console.log('\n❌  Invalid option, no version update.');
            return null;
    }

    return newVersion;
};

// Main script
(async function () {
    try {
        const pluginJsonPath = path.join(process.cwd(), 'plugin.json');
        const packageJsonPath = path.join(process.cwd(), 'package.json');

        // Check if plugin.json exists
        if (!fs.existsSync(pluginJsonPath)) {
            throw new Error('plugin.json file is required but not found.');
        }

        // Read plugin.json
        const pluginData = await readJsonFile(pluginJsonPath);

        // Try to read package.json if it exists
        const packageData = fs.existsSync(packageJsonPath) ? await readJsonFile(packageJsonPath) : {};

        // Get the current version
        const currentVersion = pluginData.version || packageData.version;
        if (!currentVersion) {
            throw new Error('No version found in plugin.json or package.json.');
        }

        console.log(`\n🌟  Current version: \x1b[36m${currentVersion}\x1b[0m\n`);

        let newVersion;
        if (process.argv.length > 2) {
            const type = process.argv[2];
            newVersion = incrementVersion(currentVersion, type);
        } else {
            newVersion = await chooseNewVersion(currentVersion);
            if (!newVersion) return;
        }

        // Update the version in plugin.json
        pluginData.version = newVersion;
        await writeJsonFile(pluginJsonPath, pluginData);

        // If package.json exists, update its version as well
        if (Object.keys(packageData).length > 0) {
            packageData.version = newVersion;
            await writeJsonFile(packageJsonPath, packageData);
        }

        console.log(`\n✅  Version successfully updated to: \x1b[32m${newVersion}\x1b[0m\n`);
    } catch (error) {
        console.error('❌  Error:', error.message);
    }
})();
