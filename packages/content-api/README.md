# Content Api

## Install

`npm install @tryghost/content-api --save`

or

`yarn add @tryghost/content-api`


## Usage


```javascript
const GhostContentApi = require('@tryghost/content-api');

const api = GhostContentApi.create({
  host: 'https://host.tld/path/',
  version: 'v2',
  key: 'some-long-hex-string'
});

// Browsing posts returns Promise([Post...]);
// The resolved array will have a meta property
api.posts.browse({limit: 2, include: 'tags,authors'});
api.posts.browse();

// Reading posts returns Promise(Post);
api.posts.read({slug: 'something'});
api.posts.read({slug: 'something'}, {formats: ['html', 'plaintext']});

// Browsing authors returns Promise([Author...])
// The resolved array will have a meta property
api.authors.browse({limit: 2});
api.authors.browse();

// Reading authors returns Promise(Author);
api.authors.read({slug: 'something'});
api.authors.read({slug: 'something'}, {include: 'count.posts'}); // include can be array for any of these

// Browsing tags returns Promise([Tag...])
// The resolved array will have a meta property
api.tags.browse({limit: 2});
api.tags.browse();

// Reading tags returns Promise(Tag);
api.tags.read({slug: 'something'});
api.tags.read({slug: 'something'}, {include: 'count.posts'});

// Browsing pages returns Promise([Page...])
// The resolved array will have a meta property
api.pages.browse({limit: 2});
api.pages.browse();

// Reading pages returns Promise(Page);
api.pages.read({slug: 'something'});
```


## Helpers demo

Fetch the most recent 3 posts from your publications 'News' tag, and display them in a sane way (assume using browserify or similar).

```javascript
const API = require('@tryghost/content-api');
const helpers = require('@tryghost/helpers');
const renderer = require('myrenderer');
const template = `
   <div class="{{post_class}}">
      <h1>{{title}}</h1>
      <p>{{excerpt}}</p>
      <span class="meta">Posted by {{{author}}} in {{{tags}}}.</span>
   </div>
`;

const api = API.create({
  host: 'https://host.tld/path/',
  version: 'v2',
  key: 'some-long-hex-string'
});


api.posts
  .browse({limit: 3, include: 'tags,authors', filter: 'tags:news'})
    .then(posts => {
      posts.forEach(post => {
        const data = {
            title: post.title,
            excerpt: helpers.excerpt(post, {characters: 140}), // get excerpt, fall back to first 140 chars of article
            tags: helpers.tags(post, {visibility: 'public', limit: 3, autolink: true}), // get 3 public tags, convert to links
            author: helpers.authors(post, {autolink: true, limit 1}) // only show one author
        };
        // Assume renderer can combine template, data and make magic happen
        renderer(template, data);
      });
    });
```


## Develop

This is a mono repository, managed with [lerna](https://lernajs.io/).

Follow the instructions for the top-level repo.
1. `git clone` this repo & `cd` into it as usual
2. Run `yarn` to install top-level dependencies.


## Run

- `yarn dev`


## Test

- `yarn lint` run just eslint
- `yarn test` run lint and tests




# Copyright & License

Copyright (c) 2018 Ghost Foundation - Released under the [MIT license](LICENSE).
