require('./utils');

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const SchemaGenerator = require('../SchemaGenerator');

const snapshotDir = path.join(__dirname, 'fixtures', 'snapshots');

function loadSnapshot(name) {
    return JSON.parse(fs.readFileSync(path.join(snapshotDir, `${name}.json`), 'utf8'));
}

describe('Schema Org Snapshots', function () {
    let schemaGenerator;

    beforeEach(function () {
        schemaGenerator = new SchemaGenerator();
    });

    describe('Home (WebSite)', function () {
        it('matches snapshot for basic schema with no data', function () {
            const schema = schemaGenerator.createSchema('home');
            assert.deepEqual(schema, loadSnapshot('home-basic'));
        });

        it('matches snapshot for full schema with all data', function () {
            const schema = schemaGenerator.createSchema('home', {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: {
                        url: 'https://example.com/content/images/logo.png',
                        dimensions: {width: 250, height: 150}
                    }
                },
                meta: {
                    url: 'https://test.example.com',
                    description: 'Saying hello to the world',
                    image: {
                        url: 'https://example.com/content/images/cover.jpg',
                        dimensions: {width: 300, height: 400}
                    }
                }
            });
            assert.deepEqual(schema, loadSnapshot('home-full'));
        });
    });

    describe('Tag (Series)', function () {
        it('matches snapshot for basic schema with no data', function () {
            const schema = schemaGenerator.createSchema('tag');
            assert.deepEqual(schema, loadSnapshot('tag-basic'));
        });

        it('matches snapshot for full schema with all data', function () {
            const schema = schemaGenerator.createSchema('tag', {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: 'https://example.com/content/images/logo.png'
                },
                meta: {
                    url: 'https://test.example.com',
                    name: 'Test-Tag',
                    description: 'Saying hello to the world',
                    image: 'https://example.com/content/images/cover.jpg'
                }
            });
            assert.deepEqual(schema, loadSnapshot('tag-full'));
        });
    });

    describe('Author (Person)', function () {
        it('matches snapshot for basic schema with no data', function () {
            const schema = schemaGenerator.createSchema('author');
            assert.deepEqual(schema, loadSnapshot('author-basic'));
        });

        it('matches snapshot for full schema with all data', function () {
            const schema = schemaGenerator.createSchema('author', {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: 'https://example.com/content/images/logo.png'
                },
                meta: {
                    url: 'https://test.example.com/about/me',
                    name: 'Joanne Bloggs',
                    description: 'A person who writes things in places',
                    image: 'https://example.com/content/images/cover.jpg',
                    sameAs: ['https://twitter.com/test', 'https://facebook.com/test']
                }
            });
            assert.deepEqual(schema, loadSnapshot('author-full'));
        });
    });

    describe('Post (Article)', function () {
        it('matches snapshot for basic schema with no data', function () {
            const schema = schemaGenerator.createSchema('post');
            assert.deepEqual(schema, loadSnapshot('post-basic'));
        });

        it('matches snapshot for full schema with all data', function () {
            const schema = schemaGenerator.createSchema('post', {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: 'https://example.com/content/images/logo.png'
                },
                meta: {
                    url: 'https://example.com/article/',
                    title: 'An interesting article',
                    datePublished: '2018-12-20T22:13:05.412',
                    dateModified: '2018-12-03T09:45:12.123Z',
                    image: 'https://example.com/content/images/article.gif',
                    keywords: ['Foo', 'Bar', 'Baz'],
                    description: 'You\'ll never guess what happened next...'
                },
                author: {
                    url: 'https://test.example.com/about/me',
                    name: 'Joanne Bloggs',
                    description: 'A person who writes things in places',
                    image: 'https://example.com/content/images/cover.jpg',
                    sameAs: ['https://twitter.com/test', 'https://facebook.com/test']
                }
            });
            assert.deepEqual(schema, loadSnapshot('post-full'));
        });
    });
});
