// import supabase
const { supabase } = require('../utils/supabase')
const jwt = require('jsonwebtoken')

// function to get all notes
const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
          .from('notes')
          .select()
        if (error) throw error

        res.status(200).json(data)
    } catch (error) {
       next(error)
    }
}

// function to get an individual note
const getIndividualNote = async (req, res, next) => {
    try {
        const id = req.params.id
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single();
        if (error && error.code !== 'PGRST116') {
            throw error
        }

        if (!data) {
            return res.status(404).json({ error: 'note not found' })
        }

        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

// we will refactor the createNote function above to create new notes only if the post request has a
// valid token attached
const createNote = async (req, res, next)  => {
    try {
        const body = req.body
        // check if the user provided a valid jwt
        if (!req.user || !req.user.id) {
            return res.status(401).json({error: 'token invalid'})
        }

        // confirm a user exists in the database with the user ID from the request token
        const {data: user, error: userError} = await supabase
          .from('users')
          .select('*')
          .eq('id', req.user.id)
          .single()

        if (userError && userError.code !== 'PGRST116') {
            throw userError
        }

        // if there doesnt exist a user with the given id return status code 400
        if (!user) {
            return res.status(400).json({ error: 'UserId missing or not valid' })
        }

        // input validation: if user doesnt provide content or important fields in the body then return 400
        if (body.content == null || body.important == null) {
            return res.status(400).json({ error: 'content or important field missing' })
        }

        // now that we comfirmed there exists a user with the id provided in the jwt id field, and that the user
        // has provided content and important fields in the body of the request, we can insert the fields into the db
        const {data, error} = await supabase
          .from('notes')
          .insert({ content: body.content, important: body.important, user_id: req.user.id })
          .select()
        if (error) throw error

        res.status(201).json(data)
    } catch (error) {
        next(error)
    }

}

// function to update an already existing note 

const updateNote = async (req, res, next) => {
    try {
        const id = req.params.id
        const { important } = req.body
        if (important == null) {
            return res.status(400).json({"error": "content or important field missing"})
        }
        const { data, error } = await supabase
          .from('notes')
          .update({ important })
          .eq('id', id)
          .select()
        
        if (error) throw error

        if (!data || data.length === 0 ) {
            return res.status(404).json({error: "note with the given ID not found"})
        }

        res.status(200).json(data)
    } catch (error) {
        next(error)
    }

}

const deleteNote = async (req, res, next) => {
    try {
        const id = req.params.id

        // check if the user provided a valid jwt
        if (!req.user || !req.user.id) {
            return res.status(401).json({error: 'token invalid'})
        }

        // fetch the note being deleted so we can check who owns it
        const {data: note, error: noteError} = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single()

        if (noteError && noteError.code !== 'PGRST116') {
            throw noteError
        }

        if (!note) {
            return res.status(404).json({ error: "note with given ID not found"})
        }

        // only the note's creator may delete it
        if (note.user_id !== req.user.id) {
            return res.status(401).json({error: 'only note creator can delete note'})
        }

        const { data, error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .select()
        
        if (error) throw error

        // throw error if the note never existed
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "note with given ID not found"})
        }

        res.status(204).send()

    } catch(error) {
        next(error)
    }
}

module.exports = {
    getAll,
    getIndividualNote,
    createNote,
    updateNote,
    deleteNote
}


