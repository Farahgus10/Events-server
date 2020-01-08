'use strict';

const express = require('express');
const xss = require('xss')
const path = require('path')
const usersRouter = express.Router();
const UsersService = require('./Users-service')
const jsonBodyParser = express.json();

const serializeUsers = user => ({
  id: user.id,
  fullname: xss(user.fullname),
  username: xss(user.username),
  nickname: xss(user.nickname),
  date_created: user.date_created,
})

usersRouter
.route('/api/users')
.get((req, res, next) => {
  const db = req.app.get('db')

  UsersService.getAllUsers(db)
    .then(users => {
      res.json(users.map(serializeUsers))
    })
    .catch(next)
})

.post(jsonBodyParser, (req, res, next) => {
  const { fullname, username, nickname, password } = req.body
  const newUser = { fullname, username }

  for(const [key, value] of Object.entries(newUser)) {
    if(value == null) {
      return res.status(400).json({
        error: { message: `Missing ${key} in request body.`}
      })
    }
  }

  newUser.nickname = nickname;
  newUser.password = password;

  UsersService.insertUser(
    req.app.get('db'),
    newUser
  )
    .then(user => {
      res.status(201).location(path.posix.join(req.originalUrl, `/${user.id}`)).json(serializeUsers(user))
    })
    .catch(next)
})


usersRouter
  .route('/api/users/:user_id')
  .all((req, res, next) => {
    UsersService.getById(req.app.get('db'), req.params.user_id)
      .then(user => {
        if(!user) {
          return res.status(400).json({ error: { message: `User doesn't exist` } 
          })
        }
        res.user = user
        next()
      })
      .catch()
  })

  .get((req, res, next) => {
    res.json(serializeUsers(res.user))
  })

  .delete((req, res, next) => {
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
    .then(numRowsAffected => {
      res.status(204).end()
    })
    .catch(next)
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { fullname, username, password, nickname } = req.body
    const userToUpdate = { fullname, username, password, nickname }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'fullname', 'username', 'password' or 'nickname'`
        }
      })

      UsersService.updateUser(
        req.app.get('db'),
        req.params.user_id,
        userToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  

module.exports = usersRouter;