const jwt = require('jsonwebtoken')
const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  } else {
    request.token = null
  }
  next()
}

const userExtractor = (request, response, next) => {
  try {
    if (request.token) {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)
      request.user = {id: decodedToken.id, username: decodedToken.username}
    } else {
      request.user = null
    }
    next()
  } catch (error) {
    next(error)
  }
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.code === '22P02') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.code === '23505') {
    return response.status(409).json({ error: 'duplicate value violates unique constraint' })
  } else if (error.code === '23503') {
    return response.status(400).json({ error: 'foreign key constraint violation' })
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

module.exports = {
  requestLogger,
  tokenExtractor,
  userExtractor,
  unknownEndpoint,
  errorHandler
}