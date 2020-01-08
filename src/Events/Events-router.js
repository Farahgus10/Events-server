'use strict';

const express = require('express');
const eventsRouter = express.Router();
const eventsService = require('./Events-service');
const jsonBodyParser = express.json();


eventsRouter
.route('/api/events')
.get((req, res, next) => {
  

  const db = req.app.get('db');
  eventsService.getEvents(db)
    .then(results => {
      if(!results) {
        return res.status(404).json({
          error: { message: 'No results' }
        })
      }
      res.json(results);
      next();
    })
    .catch(next);
})

.post(jsonBodyParser, (req, res, next) => {
  const db = req.app.get('db');
  const { events } = req.body;
  const newEvents = { events }; 

  for (const [key, value] of Object.entries(newEvents))
    if (value === null || value === undefined) 
      return res.status(400).json({
        error: `Missing ${key} in request body`
      });
  
      eventsService.insertEvents(
    db,
    newEvents
  )
    .then(event => {
      res
      .status(201)
      .location(req.originalUrl, `/${event.id}`)
      .json(event);
    })
    .catch(next);
})

module.exports = eventsRouter;