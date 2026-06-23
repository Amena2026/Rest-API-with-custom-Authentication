require('dotenv').config()
const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const api = supertest(app)

// a fresh user is created for this test run so the suite doesn't depend on
// any pre-existing "root" user or note rows in the database
const testUser = {
    username: `notesTestUser_${Date.now()}`,
    name: 'notes test user',
    password: 'password123'
}

let token
let userId
let noteId

before(async () => {
    const createUserResponse = await api
      .post('/users')
      .send(testUser)
      .expect(201)

    userId = createUserResponse.body[0].id

    const loginResponse = await api
      .post('/login')
      .send({ username: testUser.username, password: testUser.password })
      .expect(200)

    token = loginResponse.body.token
})

after(async () => {
    await api.delete(`/users/${userId}`)
})

describe('HTTP post request to /login', () => {
    test('login with invalid credentials returns 401', async () => {
        const invalidUser = {
            username: testUser.username,
            password: 'wrong-password'
        }

        await api
          .post('/login')
          .send(invalidUser)
          .expect(401)
          .expect('Content-Type', /application\/json/)
    })

    test('a user with valid credentials can log in', async () => {
        const response = await api
          .post('/login')
          .send({ username: testUser.username, password: testUser.password })
          .expect(200)
          .expect('Content-Type', /application\/json/)

        assert.ok(response.body.token)
    })
})

describe('HTTP Post requests', () => {
    test('a valid jwt needs to be passed to create a note', async () => {
        const newNote = {
            content: "no token is being passed, so this should fail",
            important: true
        }

        await api
          .post('/notes')
          .send(newNote)
          .expect(401)
          .expect('Content-Type', /application\/json/)
    })

    test('a token belonging to a user that no longer exists in the DB returns 400', async () => {
        const tokenForMissingUser = jwt.sign(
          { username: 'ghost', id: '00000000-0000-0000-0000-000000000000' },
          process.env.SECRET,
          { expiresIn: '1h' }
        )
        const newNote = {
            content: "this token's user id does not exist in the DB",
            important: true
        }

        await api
          .post('/notes')
          .send(newNote)
          .set('Authorization', `Bearer ${tokenForMissingUser}`)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    })

    test('content and important fields are required in the post request', async () => {
        const newNote = {
            content: "important field is missing, this should fail"
        }

        await api
          .post('/notes')
          .send(newNote)
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    })

    test('a valid note can be created', async () => {
        const newNote = {
            content: "post requests to /notes need valid tokens passed in the authorization header",
            important: true
        }

        const response = await api
          .post('/notes')
          .send(newNote)
          .set('Authorization', `Bearer ${token}`)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body[0].content, newNote.content)
        noteId = response.body[0].id
    })
})

describe('HTTP Get requests', () => {
    test('/notes returns all notes successfully', async () => {
        await api
          .get('/notes')
          .expect(200)
          .expect('Content-Type', /application\/json/)
    })

    test('/notes/:id returns the note when it exists', async () => {
        const response = await api
          .get(`/notes/${noteId}`)
          .expect(200)
          .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.id, noteId)
    })

    test('/notes/:id returns 404 when the note does not exist', async () => {
        await api
          .get('/notes/00000000-0000-0000-0000-000000000000')
          .expect(404)
          .expect('Content-Type', /application\/json/)
    })
})

describe('HTTP put requests', () => {
    test('updating a valid note returns 200', async () => {
        const updatedNote = { important: false }

        const response = await api
          .put(`/notes/${noteId}`)
          .send(updatedNote)
          .expect(200)

        assert.strictEqual(response.body[0].important, false)
    })

    test('updating a note that does not exist returns 404', async () => {
        const updatedNote = { important: true }

        await api
          .put('/notes/00000000-0000-0000-0000-000000000000')
          .send(updatedNote)
          .expect(404)
    })
})

describe('HTTP delete requests', () => {
    test('a valid jwt needs to be passed to delete a note', async () => {
        await api
          .delete(`/notes/${noteId}`)
          .expect(401)
          .expect('Content-Type', /application\/json/)
    })

    test('only the note creator can delete the note', async () => {
        const otherUser = {
            username: `notesTestOtherUser_${Date.now()}`,
            name: 'other user',
            password: 'password123'
        }

        const createOtherUserResponse = await api
          .post('/users')
          .send(otherUser)
          .expect(201)
        const otherUserId = createOtherUserResponse.body[0].id

        const otherLoginResponse = await api
          .post('/login')
          .send({ username: otherUser.username, password: otherUser.password })
          .expect(200)
        const otherToken = otherLoginResponse.body.token

        try {
            await api
              .delete(`/notes/${noteId}`)
              .set('Authorization', `Bearer ${otherToken}`)
              .expect(401)
              .expect('Content-Type', /application\/json/)
        } finally {
            await api.delete(`/users/${otherUserId}`)
        }
    })

    test('cannot delete a nonexistent note', async () => {
        await api
          .delete('/notes/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /application\/json/)
    })

    test('a note can be deleted', async () => {
        await api
          .delete(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)
    })
})
