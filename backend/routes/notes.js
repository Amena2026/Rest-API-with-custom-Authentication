const express = require('express')
const notesRouter = express.Router()
const noteController = require('../controllers/noteController')

// function to fetch all notes 
notesRouter.get('/', noteController.getAll)

// function to get a single note based on id 
notesRouter.get('/:id', noteController.getIndividualNote)

// function to create a new note for a given user
notesRouter.post('/', noteController.createNote)

// function to update a note 
notesRouter.put('/:id', noteController.updateNote)

// function to delete a note
notesRouter.delete('/:id', noteController.deleteNote)

module.exports = notesRouter;
