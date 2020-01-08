require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const eventsRouter = require('./Events/Events-router')
const UsersRouter = require('./Users/Users-router')
const CommentsRouter = require('./Comments/Comments-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())

app.use(eventsRouter);
app.use(UsersRouter);
app.use(CommentsRouter);

module.exports = app