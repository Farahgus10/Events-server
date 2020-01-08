'use strict';

const express = require('express');
const xss = require('xss')
const path = require('path')
const commentsRouter = express.Router();
const CommentsService = require('./Comments-service')
const jsonBodyParser = express.json();

const serializeComment = comment => ({
  id: comment.id,
  text: xss(comment.text),
  date_commented: comment.date_commented,
  user_id: comment.user_id, 
  event_id: comment.event_id
})

commentsRouter
.route('/api/comments')
.get((req, res, next) => {
  const db = req.app.get('db')

  CommentsService.getAllComment(db)
    .then(comments => {
      res.json(comments.map(serializeComment))
    })
    .catch(next)
})

.post(jsonBodyParser, (req, res, next) => {
  const { text, user_id, event_id, date_commented } = req.body
  const newComment = { text, user_id, event_id }

  for(const [key, value] of Object.entries(newComment)) {
    if(value == null) {
      return res.status(400).json({
        error: { message: `Missing ${key} in request body.`}
      })
    }
  }

  newComment.date_commented = date_commented;

  CommentsService.insertComment(
    req.app.get('db'),
    newComment
  )
    .then(comment => {
      res.status(201).location(path.posix.join(req.originalUrl, `/${comment.id}`)).json(serializeComment(comment))
    })
    .catch(next)
})


commentsRouter
  .route('/api/comments/:comment_id')
  .all((req, res, next) => {
    CommentsService.getById(req.app.get('db'), req.params.comment_id)
      .then(comment => {
        if(!comment) {
          return res.status(400).json({ error: { message: `Comment doesn't exist` } 
          })
        }
        res.comment = comment
        next()
      })
      .catch()
  })

  .get((req, res, next) => {
    res.json(serializeComment(res.comment))
  })

  .delete((req, res, next) => {
    CommentsService.deleteComment(
      req.app.get('db'),
      req.params.comment_id
    )
    .then(numRowsAffected => {
      res.status(204).end()
    })
    .catch(next)
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { text, date_commented } = req.body
    const commentToUpdate = { text, date_commented }

    const numberOfValues = Object.values(commentToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'text', or 'date_commented'.`
        }
      })

      CommentsService.updateComment(
        req.app.get('db'),
        req.params.comment_id,
        commentToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  

module.exports = commentsRouter;