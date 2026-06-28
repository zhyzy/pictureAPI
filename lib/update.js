const fs = require('fs');
const path = require('path');
const { execFile, exec } = require('child_process');
const pkg = require('../package.json');

const DEFAULT_REPO = 'zhyzy/pictureAPI';
const DEFAULT_BRANCH = 'master';

function getUpdateConfig() {
  return {
    repo: process.env.PICTURE_API_UPDATE_REPO || DEFAULT_REPO,
    branch: process.env.PICTURE_API_UPDATE_BRANCH || DEFAULT_BRANCH,
    enabled: process.env.PICTURE_API_UPDATE_ENABLED === 'true',
    restartCommand: process.env.PICTURE_API_UPDATE_RESTART_COMMAND || '',
  };
}

function normalizeVersion(version) {
  return String(version || '').trim().replace(/^v/i, '');
}

function compareVersions(a, b) {
  const left = normalizeVersion(a).split('.').map((part) => parseInt(part, 10) || 0);
  const right = normalizeVersion(b).split('.').map((part) => parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }

  return 0;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'pictureAPI-updater',
    },
  });

  if (!response.ok) {
    throw new Error(`请求失败 ${response.status}: ${url}`);
  }

  return response.json();
}

async function getLatestVersion() {
  const config = getUpdateConfig();
  const releasesUrl = `https://api.github.com/repos/${config.repo}/releases/latest`;

  try {
    const release = await fetchJson(releasesUrl);
    return {
      source: 'release',
      version: normalizeVersion(release.tag_name),
      name: release.name || release.tag_name,
      body: release.body || '',
      url: release.html_url || `https://github.com/${config.repo}/releases`,
      publishedAt: release.published_at || '',
    };
  } catch (releaseError) {
    try {
      const tags = await fetchJson(`https://api.github.com/repos/${config.repo}/tags?per_page=100`);
      const versionTags = Array.isArray(tags)
        ? tags
          .map((tag) => ({
            name: String(tag.name || ''),
            version: normalizeVersion(tag.name),
            url: tag.zipball_url || `https://github.com/${config.repo}/tags`,
          }))
          .filter((tag) => /^\d+\.\d+\.\d+/.test(tag.version))
          .sort((a, b) => compareVersions(b.version, a.version))
        : [];

      if (versionTags.length > 0) {
        const latestTag = versionTags[0];
        return {
          source: 'tag',
          version: latestTag.version,
          name: latestTag.name,
          body: `已使用 GitHub 版本标签 ${latestTag.name} 完成检测。若需要展示详细更新日志，可在 GitHub 为该标签创建 Release。`,
          url: `https://github.com/${config.repo}/releases/tag/${latestTag.name}`,
          publishedAt: '',
          releaseError: releaseError.message,
        };
      }
    } catch (tagError) {
      // Continue to branch package.json fallback below.
    }

    const packageUrl = `https://raw.githubusercontent.com/${config.repo}/${config.branch}/package.json`;
    const remotePackage = await fetchJson(packageUrl);

    return {
      source: 'branch',
      version: normalizeVersion(remotePackage.version),
      name: `分支 ${config.branch}`,
      body: `已使用 ${config.branch} 分支 package.json 完成检测。建议正式发布时创建 vX.Y.Z 版本标签或 GitHub Release。`,
      url: `https://github.com/${config.repo}/tree/${config.branch}`,
      publishedAt: '',
      releaseError: releaseError.message,
    };
  }
}

function getLocalStatus() {
  const config = getUpdateConfig();
  const root = process.cwd();
  return {
    currentVersion: normalizeVersion(pkg.version),
    repo: config.repo,
    branch: config.branch,
    updateEnabled: config.enabled,
    restartConfigured: Boolean(config.restartCommand),
    isGitCheckout: fs.existsSync(path.join(root, '.git')),
  };
}

async function checkForUpdates() {
  const local = getLocalStatus();
  const latest = await getLatestVersion();
  const comparison = compareVersions(local.currentVersion, latest.version);

  return {
    ...local,
    latestVersion: latest.version,
    latestName: latest.name,
    latestBody: latest.body,
    latestUrl: latest.url,
    publishedAt: latest.publishedAt,
    updateSource: latest.source,
    hasUpdate: comparison < 0,
    isLatest: comparison >= 0,
    releaseError: latest.releaseError || '',
  };
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, {
      cwd: process.cwd(),
      shell: false,
      maxBuffer: 1024 * 1024 * 8,
      timeout: options.timeout || 1000 * 60 * 5,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim();
      if (error) {
        error.output = output;
        reject(error);
        return;
      }
      resolve(output);
    });
  });
}

function runShellCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 4,
      timeout: options.timeout || 1000 * 60 * 2,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim();
      if (error) {
        error.output = output;
        reject(error);
        return;
      }
      resolve(output);
    });
  });
}

async function backupRuntimeFiles() {
  const root = process.cwd();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.join(root, 'backups', `update-${stamp}`);
  await fs.promises.mkdir(backupRoot, { recursive: true });

  const targets = [
    '.env.local',
    path.join('data', 'pictureapi.db'),
    path.join('public', 'uploads'),
  ];

  const copied = [];
  for (const target of targets) {
    const source = path.join(root, target);
    if (!fs.existsSync(source)) continue;

    const destination = path.join(backupRoot, target);
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.cp(source, destination, { recursive: true, force: true });
    copied.push(target);
  }

  return { backupRoot, copied };
}

async function applyUpdate() {
  const config = getUpdateConfig();
  const status = getLocalStatus();

  if (!config.enabled) {
    return {
      success: false,
      code: 'UPDATE_DISABLED',
      message: '一键更新默认关闭。请在生产环境变量中设置 PICTURE_API_UPDATE_ENABLED=true 后再执行。',
    };
  }

  if (!status.isGitCheckout) {
    return {
      success: false,
      code: 'NOT_GIT_CHECKOUT',
      message: '当前项目目录不是 Git 仓库，无法执行自动拉取更新。请使用 git clone 方式部署项目。',
    };
  }

  const steps = [];
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  try {
    const backup = await backupRuntimeFiles();
    steps.push(`已备份运行时文件到 ${backup.backupRoot}`);
    if (backup.copied.length > 0) {
      steps.push(`备份内容：${backup.copied.join('、')}`);
    }

    steps.push(await runCommand('git', ['fetch', 'origin', config.branch]));
    steps.push(await runCommand('git', ['pull', '--ff-only', 'origin', config.branch]));
    steps.push(await runCommand(npmCommand, ['install'], { timeout: 1000 * 60 * 8 }));

    await fs.promises.rm(path.join(process.cwd(), '.next'), { recursive: true, force: true });
    steps.push('已清理 .next 构建缓存');
    steps.push(await runCommand(npmCommand, ['run', 'build'], { timeout: 1000 * 60 * 10 }));

    if (config.restartCommand) {
      steps.push(await runShellCommand(config.restartCommand, { timeout: 1000 * 60 * 2 }));
    } else {
      steps.push('未配置 PICTURE_API_UPDATE_RESTART_COMMAND，请在面板或 PM2 中重启服务使新版本生效。');
    }

    return {
      success: true,
      message: '更新流程执行完成',
      steps: steps.filter(Boolean),
    };
  } catch (error) {
    return {
      success: false,
      code: 'UPDATE_FAILED',
      message: error.message,
      output: error.output || '',
      steps: steps.filter(Boolean),
    };
  }
}

module.exports = {
  checkForUpdates,
  applyUpdate,
  getLocalStatus,
};
