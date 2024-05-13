import url from 'node:url';
import http from 'node:http';
import {AddressInfo} from 'net';

type Config = {
    returnError: boolean;
};

export const getInstance = (config: Config, cb: (urlStr: string) => void): http.Server => {
    const server = http.createServer();

    server.on('listening', () => {
        const addressInfo = server.address() as AddressInfo;
        const serverURL = `http://${addressInfo.address}:${addressInfo.port}`;
        cb(serverURL);
    });

    server.on('request', (req, res) => {
        if (!req.url) {
            throw Error('No URL');
        }
        const parsedUrl = url.parse(req.url, true);
        server.emit('method', req.method);
        server.emit('url', parsedUrl);
        server.emit('headers', req.headers);

        if (config.returnError) {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                errors: [{
                    message: 'this is an error',
                    context: 'this is my context',
                    type: 'NotFoundError',
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

        if (!parsedUrl.pathname) {
            throw Error('No pathname');
        }

        const browseMatch = parsedUrl.pathname.match(/\/([a-z]+)\/$/);
        if (browseMatch) {
            data = {
                [browseMatch[1]]: [{}, {}, {}],
                meta: {}
            };
        }

        const readByIdMatch = parsedUrl.pathname.match(/\/([a-z]+)\/([0-9a-f]+)\/$/);
        const readBySlugMatch = parsedUrl.pathname.match(/\/([a-z]+)\/slug\/([\w]+)\/$/);

        const readMatch = readByIdMatch || readBySlugMatch;
        if (readMatch) {
            const type = readByIdMatch ? 'id' : 'slug';
            data = {
                [readMatch[1]]: [{
                    [type]: readMatch[2]
                }]
            };
        }

        res.end(JSON.stringify(data));
    });

    server.listen(0, '127.0.0.1');

    return server;
};
