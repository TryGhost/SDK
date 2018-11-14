const GhostContentApi = require('./content-api-sdk/index')
const GhostMembersLayer1 = require('./members-sdk/layer1')
const GhostMembersLayer2 = require('./members-sdk/layer2')
const members = GhostMembersLayer1.create()
const DomReady = require('domready')

const handleMembers = (blogUrl, contentApiKey, postId) => {
  const api = GhostContentApi.create({
    host: blogUrl,
    version: 'v2',
    key: contentApiKey
  })
  GhostMembersLayer2.init()
  members.getToken().then((token) => {
    if (token) {
      api.posts.read({ id: postId }, {}, token).then((post) => {
        console.log('Inserting post data from content api', post);
        document.querySelector('.post-content').innerHTML = post.html;
      }).catch((err) => {
        console.log("err", err);
        return err;
      })
    }
  })
}

const init = (blogUrl, contentApiKey, postId) => {

  DomReady(function () {
    handleMembers(blogUrl, contentApiKey, postId)
  })
}


export default {
    init: init
}
