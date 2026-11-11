const fs = require('fs');
const path = require('path');
const {execaSync} = require('execa');

const localUtils = require('./utils');

// Commands run without a shell and take their inputs as separate arguments,
// so paths and versions are never interpreted by a shell. Paths are passed
// as absolute paths so they can't be mistaken for command-line options.
class Changelog {
    constructor(options = {}) {
        localUtils.checkMissingOptions(options,
            'folder',
            'changelogPath'
        );

        this.changelogPath = options.changelogPath;
        this.folder = options.folder;
    }

    write(options = {}) {
        localUtils.checkMissingOptions(options,
            'githubRepoPath',
            'lastVersion'
        );

        const cwd = options.folder || this.folder;

        const {stdout} = execaSync('git', [
            'log',
            '--no-merges',
            `--pretty=tformat:%at * [%h](${options.githubRepoPath}/commit/%h) %s - %an`,
            '--end-of-options',
            `${options.lastVersion}..`
        ], {
            cwd,
            stripFinalNewline: false,
            // Matches the previous `git log | sed > file` shell pipeline, whose
            // exit status was sed's: a failing git log (e.g. unknown version)
            // writes an empty changelog instead of throwing.
            reject: false
        });

        const changelogPath = path.resolve(cwd, this.changelogPath);

        if (options.append) {
            fs.appendFileSync(changelogPath, stdout);
        } else {
            fs.writeFileSync(changelogPath, stdout);
        }

        return this;
    }

    sort() {
        const changelogPath = path.resolve(this.folder, this.changelogPath);
        execaSync('sort', ['-r', '-o', changelogPath, changelogPath], {cwd: this.folder});

        return this;
    }

    clean() {
        const changelogPath = path.resolve(this.folder, this.changelogPath);
        execaSync('sed', ['-i.bk', '-E', 's/^[0-9]{10} //g', changelogPath], {cwd: this.folder});

        return this;
    }
}

module.exports = Changelog;
