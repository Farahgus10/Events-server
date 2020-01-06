'use strict'

const eventsService = {
  getEvents(db) {
    return db.select('*').from('events')
  },
  insertEvents(db, newEvents) {
    return db.insert(newMantra).into('mantras').returning('*')
    .then(rows => {
      return rows[0]
    })
  }
}

module.exports = eventsService;