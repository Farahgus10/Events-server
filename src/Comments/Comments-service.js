const Knex = require("knex")

const CommentsService = {
  getAllComment(db) {
      return db.select('*').from('event_comments')
  },
  insertComment(db, newComment) {
    return db.insert(newComment).into('event_comments').returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(db, id) {
    return db.from('event_comments').select('*').where({ id }).first()
  },
  deleteComment(db, id) {
    return db('event_comments').where({ id }).delete()
  },
  updateComment(db, id, newCommentFields) {
    return db('event_comments').where({ id }).update(newCommentFields)
  }
}

module.exports = CommentsService