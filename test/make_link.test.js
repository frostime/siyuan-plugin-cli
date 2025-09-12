import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

// Helpers
function mkTmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeJSON(fp, obj) {
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
}

function runNode(scriptPath, args = [], opts = {}) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [scriptPath, ...args], {
      cwd: opts.cwd || process.cwd(),
      env: opts.env || process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code, signal) => {
      resolve({ code, signal, stdout, stderr, proc });
    });
    if (opts.stdin) {
      proc.stdin.write(opts.stdin);
      proc.stdin.end();
    }
  });
}

// Global tmp paths created per test
let projectDir;
let pluginsDir;
let originalCwd;
let originalEnv;

beforeEach(() => {
  // Prepare isolated temp project
  projectDir = mkTmpDir('siyuan-cli-proj-');
  pluginsDir = mkTmpDir('siyuan-cli-plugins-');

  // plugin.json
  writeJSON(path.join(projectDir, 'plugin.json'), { name: 'demo-plugin' });
  // dev and dist folders
  fs.mkdirSync(path.join(projectDir, 'dev'));
  fs.mkdirSync(path.join(projectDir, 'dist'));

  originalCwd = process.cwd();
  process.chdir(projectDir);

  originalEnv = { ...process.env };
  process.env.SIYUAN_PLUGIN_DIR = pluginsDir;
});

afterEach(() => {
  // restore env/cwd
  process.chdir(originalCwd);
  process.env = originalEnv;

  // best-effort cleanup
  function rmrf(p) {
    try {
      if (fs.existsSync(p)) {
        const st = fs.lstatSync(p);
        if (st.isSymbolicLink()) {
          fs.unlinkSync(p);
        } else if (st.isDirectory()) {
          for (const e of fs.readdirSync(p)) {
            rmrf(path.join(p, e));
          }
          fs.rmdirSync(p);
        } else {
          fs.unlinkSync(p);
        }
      }
    } catch (_) {
      // ignore
    }
  }
  rmrf(projectDir);
  rmrf(pluginsDir);
});

// Utility to check link target (string compare, normalized)
function cmpPath(a, b) {
  const na = a.replace(/\\/g, '/').replace(/\/$/, '') + '/';
  const nb = b.replace(/\\/g, '/').replace(/\/$/, '') + '/';
  return na === nb;
}

const makeLink = path.resolve('bin/make_dev_link.js');
const checkLink = path.resolve('bin/check_link.js');

// On Windows, creating symlinks may fail without privileges.
// We will skip tests if we detect EPERM when attempting to create symlinks.
async function canCreateSymlink() {
  const link = path.join(pluginsDir, 'try-link');
  const target = path.join(projectDir, 'dev');
  try {
    fs.symlinkSync(target, link, 'dir');
    fs.unlinkSync(link);
    return true;
  } catch (e) {
    if (e && (e.code === 'EPERM' || e.code === 'EACCES')) return false;
    // Other errors imply environment issues; still skip to be safe
    return false;
  }
}

// 1) Create dev link by default
test('make-link creates dev symlink by default', async (t) => {
  if (!(await canCreateSymlink())) {
    t.skip('Symlink creation not permitted in this environment');
    return;
  }
  const res = await runNode(makeLink);
  assert.equal(res.code, 0, `make-link exited with ${res.code}\n${res.stdout}\n${res.stderr}`);

  const linkPath = path.join(pluginsDir, 'demo-plugin');
  assert.ok(fs.existsSync(linkPath), 'link path exists');
  const isLink = fs.lstatSync(linkPath).isSymbolicLink();
  assert.ok(isLink, 'created path is a symlink');
  const dest = fs.readlinkSync(linkPath);
  assert.ok(cmpPath(dest, path.join(projectDir, 'dev')), 'symlink points to ./dev');
});

// 2) Switching to dist should prompt; confirm with "y" to proceed
test('make-link --dist overwrites dev link after confirmation', async (t) => {
  if (!(await canCreateSymlink())) {
    t.skip('Symlink creation not permitted in this environment');
    return;
  }
  // First create default dev link
  let res = await runNode(makeLink);
  assert.equal(res.code, 0, `initial make-link failed: ${res.stdout} ${res.stderr}`);

  // Now run with --dist and feed "y" to stdin to confirm overwrite
  res = await runNode(makeLink, ['--dist'], { stdin: 'y\n' });
  assert.equal(res.code, 0, `make-link --dist failed: ${res.stdout} ${res.stderr}`);

  const linkPath = path.join(pluginsDir, 'demo-plugin');
  const isLink = fs.lstatSync(linkPath).isSymbolicLink();
  assert.ok(isLink, 'path remains a symlink');
  const dest = fs.readlinkSync(linkPath);
  assert.ok(cmpPath(dest, path.join(projectDir, 'dist')), 'symlink now points to ./dist');
});

// 3) check-link should report dist
test('check-link reports dist when linked to dist', async (t) => {
  if (!(await canCreateSymlink())) {
    t.skip('Symlink creation not permitted in this environment');
    return;
  }
  // Ensure linked to dist
  await runNode(makeLink);
  await runNode(makeLink, ['--dist'], { stdin: 'y\n' });

  const res = await runNode(checkLink);
  assert.equal(res.code, 0, 'check-link exited with code 0');
  assert.match(res.stdout, /Linked: dist \(symlink\)/, 'check-link detects dist symlink');
});

// 4) Non-symlink case should be reported
test('check-link reports non-symlink when directory exists without link', async (t) => {
  // Create a normal directory at plugins/<name>
  const linkPath = path.join(pluginsDir, 'demo-plugin');
  fs.mkdirSync(linkPath, { recursive: true });

  const res = await runNode(checkLink);
  assert.equal(res.code, 0, 'check-link exited with code 0');
  assert.match(res.stdout, /not a symlink|Likely installed via make-install/i, 'reports non-symlink');
});
