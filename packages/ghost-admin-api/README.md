# ghost-admin-api

An extended `got` instance for working with the admin API

### Installation

```shell
yarn add ghost-admin-api
```

### Usage

```js
const GhostAdminAPI = require('ghost-admin-api');

const api = GhostAdminAPI.create({
    apiHost: 'http://localhost:2368/ghost/api/admin',
    applicationKey: '<an-application-key>'
});

api.get('/posts', {limit: 2, include: ['tags', 'authors']})
    .then(res => res.body)
    .then(console.log);
```

See the [`got` docs](https://github.com/sindresorhus/got) for more information.

### Installation (cli)

```shell
npm install -g ghost-admin-api
```

### Usage (cli)

```shell
$ ghost-admin-api http://localhost:2638/ghost/api/admin <applicationKey>
ghost-admin-api > api.get('/posts').then(res => console.log(res.body));
ghost-admin-api > api.get('/posts'), {limit: 2}).then(res => console.log(res.body));
```
