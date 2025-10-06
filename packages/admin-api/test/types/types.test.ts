import GhostAdminAPI = require("@tryghost/admin-api");

const assertType = <T>(_value: T) => {};

// Accept arbitrary version strings
const api = new GhostAdminAPI({ url: "test", version: "v5.9999", key: "" });

type Ghost = ReturnType<typeof GhostAdminAPI>;

// posts
const postsBrowsePromise = api.posts.browse();
assertType<ReturnType<Ghost["posts"]["browse"]>>(postsBrowsePromise);

postsBrowsePromise.then((posts) => {
    const readPromise = api.posts.read(posts[0], { include: "authors" });
    assertType<ReturnType<Ghost["posts"]["read"]>>(readPromise);
});

// tags
const tagsBrowsePromise = api.tags.browse();
assertType<ReturnType<Ghost["tags"]["browse"]>>(tagsBrowsePromise);

tagsBrowsePromise.then((tags) => {
    const tagPromise = api.tags.read(tags[0]);
    assertType<ReturnType<Ghost["tags"]["read"]>>(tagPromise);

    tagPromise.then((tag) => {
        if (tag.name) {
            assertType<string>(tag.name);
        }
    });
});

// webhooks
const webhookAdd = api.webhooks.add({
    event: "post.added",
    target_url: "https://example.com/webhook",
});
assertType<ReturnType<Ghost["webhooks"]["add"]>>(webhookAdd);

const webhookEdit = api.webhooks.edit({
    ...{ event: "post.published" },
    id: "webhook-id",
});
assertType<ReturnType<Ghost["webhooks"]["edit"]>>(webhookEdit);

const webhookDelete = api.webhooks.delete({ id: "webhook-id" });
assertType<ReturnType<Ghost["webhooks"]["delete"]>>(webhookDelete);

// users
assertType<ReturnType<Ghost["users"]["browse"]>>(api.users.browse());
assertType<ReturnType<Ghost["users"]["read"]>>(
    api.users.read({ id: "user-id" })
);
assertType<ReturnType<Ghost["users"]["edit"]>>(
    api.users.edit({ id: "user-id", name: "Test User" })
);
assertType<ReturnType<Ghost["users"]["delete"]>>(
    api.users.delete({ id: "user-id" })
);

// uploads
assertType<ReturnType<Ghost["images"]["upload"]>>(
    api.images.upload({ file: "test.jpg" })
);
assertType<ReturnType<Ghost["media"]["upload"]>>(
    api.media.upload({ file: "test-2.png", purpose: "test" })
);

// site
assertType<ReturnType<Ghost["site"]["read"]>>(api.site.read());
