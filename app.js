const express = require( 'express' )
const url = 'mongodb://localhost:27017/test'
const app = express()
const port = 3500
const session = require('express-session');

;(async() => {
  const acl = await require('./getAcl')(url)

  app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'sessiontest',
  }))

  app.use(function(err, req, res, next ) {
    if( !err ) return next();
    res.status(500).send(err)
  })


  app.get('/info/:user_id', function(req, res, next ) {
    req.session.user_id = req.params.user_id
    acl.allowedPermissions(req.params.user_id, [ '/blogs', 'blogs_action', '/admin' ], function(err, permissions ){
      res.json( permissions );
    })
  })

  app.get('/blogs/:title', acl.middleware(1, getUserId),
    function( req, res, next ) {
      res.send( 'Welcome ' + getUserId(req, res) + ', title:' + req.params.title);
    }
  )

  app.post('/blogs/', acl.middleware(1, getUserId),
    function( req, res, next ) {
      res.send( 'Welcome ' + getUserId(req, res) + ', you can edit blog.');
    }
  )

// Starting the server
  app.listen( port, function() {
    console.log( 'ACL example listening on port ' + port );
  });

})()


function getUserId(req, res) {
  return req.session.user_id
}