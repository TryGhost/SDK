const url = require('url');
const http = require('http');

const getInstance = (config, cb) => {
    const server = http.createServer();

    server.on('listening', () => {
        const {address, port} = server.address();
        const serverURL = `http://${address}:${port}`;

        cb(serverURL);
    });

    server.on('request', (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        server.emit('method', req.method);
        server.emit('url', parsedUrl);
        server.emit('headers', req.headers);

        if (config.returnError) {
            res.writeHead(422, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                errors: [{
                    message: 'this is an error',
                    context: 'this is my context',
                    type: 'ValidationError',
                    details: {},
                    help: 'docs link',
                    code: 'ERROR',
                    id: 'id'
                }]
            }));

            return;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        let data;

        const browseMatch = parsedUrl.pathname.match(/\/([a-z]+)\/$/);
        if (browseMatch) {
            data = {
                [browseMatch[1]]: [{}, {}, {}],
                meta: {}
            };
        }

        const idMatch = parsedUrl.pathname.match(/\/([a-z]+)\/([0-9a-f]+)\/$/);
        const slugMatch = parsedUrl.pathname.match(/\/([a-z]+)\/slug\/([\w]+)\/$/);

        const identifierMatch = idMatch || slugMatch;
        if (identifierMatch) {
            const type = idMatch ? 'id' : 'slug';
            data = {
                [identifierMatch[1]]: [{
                    [type]: identifierMatch[2]
                }]
            };
        }

        const configMatch = parsedUrl.pathname.match(/\/configuration(?:\/about)?\/$/);
        if (configMatch) {
            data = {
                configuration: [{version: '2.13.2'}]
            };
        }

        if (req.headers['content-type'].match(/multipart/)) {
            data = {
                images: [{
                    url: `${config.url}/image/url`,
                    ref: null
                }]
            };
        } else if (parsedUrl.pathname.match(/theme\/activate/)) {
            data = {
                themes: []
            };
        } else if (req.method === 'POST') {
            data = {
                [browseMatch[1]]: [{
                    slug: 'new-resource'
                }]
            };
        } else if (req.method === 'PUT') {
            const type = idMatch ? 'id' : 'slug';
            data = {
                [identifierMatch[1]]: [{
                    [type]: identifierMatch[2],
                    slug: 'edited-resource'
                }]
            };
        } else if (req.method === 'DELETE') {
            data = null;
        }

        res.end(JSON.stringify(data));
    });

    server.listen(0, '127.0.0.1');

    return server;
};

module.exports.getInstance = getInstance;
