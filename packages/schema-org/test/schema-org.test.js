// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');

const SchemaGenerator = require('../SchemaGenerator');

describe('Schema Org', function () {
    describe('Default structures (home)', function () {
        it('Defaults to home when no template provided', function () {
            const schemaGenerator = new SchemaGenerator();
            const schema = schemaGenerator.createSchema();

            Object.keys(schema).should.eql(['@context', '@type']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('WebSite');
        });

        it('Can render a valid schema with publisher', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
                site: {
                    title: 'Hello World'
                }
            };
            const schema = schemaGenerator.createSchema('home', data);

            Object.keys(schema).should.eql(['@context', '@type', 'publisher']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('WebSite');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('');
        });

        describe('Image Partial Combos', function () {
            it('Can render a publisher logo as string', function () {
                const schemaGenerator = new SchemaGenerator();
                const data = {
                    site: {
                        title: 'Hello World',
                        logo: 'https://example.com/content/images/logo.png'
                    }
                };
                const schema = schemaGenerator.createSchema('home', data);

                Object.keys(schema).should.eql(['@context', '@type', 'publisher']);
                schema['@context'].should.eql('https://schema.org');
                schema['@type'].should.eql('WebSite');

                Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
                schema.publisher['@type'].should.eql('Organization');
                schema.publisher.name.should.eql('Hello World');
                schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');
            });

            it('Can render a publisher logo w/ url only', function () {
                const schemaGenerator = new SchemaGenerator();
                const data = {
                    site: {
                        title: 'Hello World',
                        logo: {
                            url: 'https://example.com/content/images/logo.png'
                        }
                    }
                };
                const schema = schemaGenerator.createSchema('home', data);

                Object.keys(schema).should.eql(['@context', '@type', 'publisher']);
                schema['@context'].should.eql('https://schema.org');
                schema['@type'].should.eql('WebSite');

                Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
                schema.publisher['@type'].should.eql('Organization');
                schema.publisher.name.should.eql('Hello World');
                schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');
            });

            it('Can render a publisher logo & dimensions', function () {
                const schemaGenerator = new SchemaGenerator();
                const data = {
                    site: {
                        title: 'Hello World',
                        logo: {
                            url: 'https://example.com/content/images/logo.png',
                            dimensions: {
                                width: 250,
                                height: 150
                            }
                        }
                    }
                };
                const schema = schemaGenerator.createSchema('home', data);

                Object.keys(schema).should.eql(['@context', '@type', 'publisher']);
                schema['@context'].should.eql('https://schema.org');
                schema['@type'].should.eql('WebSite');

                Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
                schema.publisher['@type'].should.eql('Organization');
                schema.publisher.name.should.eql('Hello World');

                Object.keys(schema.publisher.logo).should.eql(['@type', 'url', 'width', 'height']);
                schema.publisher.logo['@type'].should.eql('ImageObject');
                schema.publisher.logo.width.should.eql(250);
                schema.publisher.logo.height.should.eql(150);
            });
        });
    });

    describe('Home (WebSite)', function () {
        it('Can render a basic valid schema with no data', function () {
            const schemaGenerator = new SchemaGenerator();
            const schema = schemaGenerator.createSchema('home');

            Object.keys(schema).should.eql(['@context', '@type']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('WebSite');
        });

        it('Can render a valid schema with publisher & main entity', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com'
                }
            };
            const schema = schemaGenerator.createSchema('home', data);

            Object.keys(schema).should.eql(['@context', '@type', 'publisher', 'mainEntityOfPage']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('WebSite');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('');

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');
        });

        it('Can render a valid schema with full data', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: {
                        url: 'https://example.com/content/images/logo.png',
                        dimensions: {
                            width: 250,
                            height: 150
                        }
                    }
                },
                meta: {
                    url: 'https://test.example.com',
                    description: 'Saying hello to the world',
                    image: {
                        url: 'https://example.com/content/images/cover.jpg',
                        dimensions: {
                            width: 300,
                            height: 400
                        }
                    }
                }
            };
            const schema = schemaGenerator.createSchema('home', data);

            Object.keys(schema).should.eql(['@context', '@type', 'publisher', 'mainEntityOfPage', 'url', 'image', 'description']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('WebSite');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');

            Object.keys(schema.publisher.logo).should.eql(['@type', 'url', 'width', 'height']);
            schema.publisher.logo['@type'].should.eql('ImageObject');
            schema.publisher.logo.url.should.eql('https://example.com/content/images/logo.png');
            schema.publisher.logo.width.should.eql(250);
            schema.publisher.logo.height.should.eql(150);

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');
            schema.url.should.eql('https://test.example.com');
            schema.description.should.eql('Saying hello to the world');

            Object.keys(schema.image).should.eql(['@type', 'url', 'width', 'height']);
            schema.image['@type'].should.eql('ImageObject');
            schema.image.url.should.eql('https://example.com/content/images/cover.jpg');
            schema.image.width.should.eql(300);
            schema.image.height.should.eql(400);
        });
    });

    describe('Tag (Series)', function () {
        it('Can render a basic valid schema with no data', function () {
            const schemaGenerator = new SchemaGenerator();
            const schema = schemaGenerator.createSchema('tag');

            Object.keys(schema).should.eql(['@context', '@type']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Series');
        });

        it('Can render a valid schema with publisher & main entity', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: 'https://example.com/content/images/logo.png'
                }
            };

            const schema = schemaGenerator.createSchema('tag', data);

            Object.keys(schema).should.eql(['@context', '@type', 'publisher', 'mainEntityOfPage']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Series');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');
        });

        it('Can render a valid schema with full data', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
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
            };

            const schema = schemaGenerator.createSchema('tag', data);

            Object.keys(schema).should.eql(['@context', '@type', 'publisher', 'mainEntityOfPage', 'name', 'url', 'image', 'description']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Series');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');

            schema.name.should.eql('Test-Tag');
            schema.url.should.eql('https://test.example.com');
            schema.description.should.eql('Saying hello to the world');
            schema.image.should.eql('https://example.com/content/images/cover.jpg');
        });
    });

    describe('Author (Person)', function () {
        it('Can render a basic valid schema with no data', function () {
            const schemaGenerator = new SchemaGenerator();
            const schema = schemaGenerator.createSchema('author');

            Object.keys(schema).should.eql(['@context', '@type']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Person');
        });

        it('Can render a valid schema with main entity & no publisher for Person', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: 'https://example.com/content/images/logo.png'
                }
            };

            const schema = schemaGenerator.createSchema('author', data);

            Object.keys(schema).should.eql(['@context', '@type', 'mainEntityOfPage']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Person');

            should.not.exists(schema.publisher);

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');
        });

        it('Can render a valid schema with full data', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
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
            };

            const schema = schemaGenerator.createSchema('author', data);

            Object.keys(schema).should.eql([
                '@context', '@type', 'mainEntityOfPage', 'name', 'url', 'sameAs', 'image', 'description'
            ]);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Person');

            should.not.exists(schema.publisher);

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');

            schema.name.should.eql('Joanne Bloggs');
            schema.url.should.eql('https://test.example.com/about/me');
            schema.sameAs.should.eql('https://twitter.com/test,https://facebook.com/test');
            schema.image.should.eql('https://example.com/content/images/cover.jpg');
            schema.description.should.eql('A person who writes things in places');
        });
    });

    describe('Post (Article)', function () {
        it('Can render a basic valid schema with no data', function () {
            const schemaGenerator = new SchemaGenerator();
            const schema = schemaGenerator.createSchema('post');

            Object.keys(schema).should.eql(['@context', '@type']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Article');
        });

        it('Can render a valid schema with publisher & main entity', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: 'https://example.com/content/images/logo.png'
                }
            };

            const schema = schemaGenerator.createSchema('post', data);

            Object.keys(schema).should.eql(['@context', '@type', 'publisher', 'mainEntityOfPage']);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Article');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');
        });

        it('Can render a valid schema with author', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
                site: {
                    title: 'Hello World',
                    url: 'https://example.com',
                    logo: 'https://example.com/content/images/logo.png'
                },
                author: {
                    url: 'https://test.example.com/about/me',
                    name: 'Joanne Bloggs',
                    description: 'A person who writes things in places',
                    image: 'https://example.com/content/images/cover.jpg',
                    sameAs: ['https://twitter.com/test', 'https://facebook.com/test']
                }
            };

            const schema = schemaGenerator.createSchema('post', data);

            Object.keys(schema).should.eql([
                '@context', '@type', 'publisher', 'mainEntityOfPage', 'author'
            ]);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Article');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');

            Object.keys(schema.author).should.eql(['@type', 'name', 'url', 'sameAs', 'image', 'description']);
            schema.author.name.should.eql('Joanne Bloggs');
            schema.author.url.should.eql('https://test.example.com/about/me');
            schema.author.sameAs.should.eql('https://twitter.com/test,https://facebook.com/test');
            schema.author.image.should.eql('https://example.com/content/images/cover.jpg');
            schema.author.description.should.eql('A person who writes things in places');
        });

        it('Can render a valid schema with all data except author', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
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
                }
            };

            const schema = schemaGenerator.createSchema('post', data);

            Object.keys(schema).should.eql([
                '@context', '@type', 'publisher', 'mainEntityOfPage', 'headline', 'url', 'datePublished', 'dateModified', 'image', 'keywords', 'description'
            ]);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Article');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');

            schema.url.should.eql('https://example.com/article/');
            schema.headline.should.eql('An interesting article');
            schema.datePublished.should.eql('2018-12-20T22:13:05.412');
            schema.dateModified.should.eql('2018-12-03T09:45:12.123Z');
            schema.keywords.should.eql('Foo,Bar,Baz');
            schema.description.should.eql('You&#x27;ll never guess what happened next...');
            schema.image.should.eql('https://example.com/content/images/article.gif');
        });

        it('Can render a valid schema with full data', function () {
            const schemaGenerator = new SchemaGenerator();
            const data = {
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
            };

            const schema = schemaGenerator.createSchema('post', data);

            Object.keys(schema).should.eql([
                '@context', '@type', 'publisher', 'mainEntityOfPage', 'author', 'headline', 'url', 'datePublished', 'dateModified', 'image', 'keywords', 'description'
            ]);
            schema['@context'].should.eql('https://schema.org');
            schema['@type'].should.eql('Article');

            Object.keys(schema.publisher).should.eql(['@type', 'name', 'logo']);
            schema.publisher['@type'].should.eql('Organization');
            schema.publisher.name.should.eql('Hello World');
            schema.publisher.logo.should.eql('https://example.com/content/images/logo.png');

            Object.keys(schema.mainEntityOfPage).should.eql(['@type', '@id']);
            schema.mainEntityOfPage['@type'].should.eql('WebPage');
            schema.mainEntityOfPage['@id'].should.eql('https://example.com');

            schema.url.should.eql('https://example.com/article/');
            schema.headline.should.eql('An interesting article');
            schema.datePublished.should.eql('2018-12-20T22:13:05.412');
            schema.dateModified.should.eql('2018-12-03T09:45:12.123Z');
            schema.keywords.should.eql('Foo,Bar,Baz');
            schema.description.should.eql('You&#x27;ll never guess what happened next...');
            schema.image.should.eql('https://example.com/content/images/article.gif');

            Object.keys(schema.author).should.eql(['@type', 'name', 'url', 'sameAs', 'image', 'description']);
            schema.author.name.should.eql('Joanne Bloggs');
            schema.author.url.should.eql('https://test.example.com/about/me');
            schema.author.sameAs.should.eql('https://twitter.com/test,https://facebook.com/test');
            schema.author.image.should.eql('https://example.com/content/images/cover.jpg');
            schema.author.description.should.eql('A person who writes things in places');
        });
    });
});
