#!/usr/bin/env node
const repl = require('repl');
const GhostAdminAPI = require('../index');

const [apiHost, applicationKey] = process.argv.slice(2);

const usage = `admin-api-sdk v0.0.0
    usage: admin-api-sdk <apiHost> <applicationKey>
`;

if (!apiHost || !applicationKey) {
    process.stderr.write(usage);
    process.exit(1);
}

const api = GhostAdminAPI.create({apiHost, applicationKey});

const replServer = repl.start({
    prompt: 'admin-api-sdk > '
});

Object.defineProperty(replServer.context, 'api', {
    configurable: false,
    enumerable: true,
    value: api
});
