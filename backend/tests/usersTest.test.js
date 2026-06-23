require('dotenv').config()
const {test, describe} = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

test('creation of a username with length < 3 returns 400', async () => {

    const newUser = {
        "username": "0",
        "name": "should fail",
        "password": "123456789"
    }

    const response = await api
      .post('/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
})

test('creation of a user with a fresh username', async () => {

    const newUser = {
        "username": "secondTest",
        "name": "test user",
        "password": "123456789"
    }

    const response = await api
      .post('/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    try {
        assert.strictEqual(response.body[0].username, newUser.username)
    } finally {
        await api.delete(`/users/${response.body[0].id}`).expect(204)
    }
})

