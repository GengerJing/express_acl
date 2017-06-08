const Acl = require( 'acl' )
const mongodb = require('mongodb')

module.exports = async(url) => {
  const db = await mongodb.MongoClient.connect(url)
  const acl = new Acl(new Acl.mongodbBackend(db, 'acl_'))

  await acl.allow('guest', 'blogs_action', ['view'])

  await acl.allow('user', 'blogs_action', ['view', 'comment'])

  await acl.allow('owner', 'blogs_action', ['view', 'edit', 'delete'])

  await acl.addRoleParents('admin', ['owner', 'user'])

  await acl.allow([
    {
      roles: 'admin',
      allows: [
        { resources: '/blogs', permissions: '*' },
        { resources: '/admin', permissions: '*' }
      ]
    },
    {
      roles: 'owner',
      allows: [
        { resources: '/blogs', permissions: '*' },
        { resources: '/admin', permissions: ['get'] }
      ]
    },
    {
      roles: ['user', 'guest'],
      allows: [
        { resources: '/blogs', permissions: 'get'},
      ]
    },
  ])

  await acl.addUserRoles('lijingjing', 'admin')
  await acl.addUserRoles('longteng', 'owner')
  await acl.addUserRoles('xiaoming', 'user')
  await acl.addUserRoles('xiaozhang', 'guest')

  return acl
}