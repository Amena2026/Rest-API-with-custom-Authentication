const { supabase } = require('../utils/supabase')
const bcrypt = require('bcrypt')

const CreateUser = async (req, res, next) => {
    try {
        const { username, name, password } = req.body
        console.log(username)
        console.log(name)
        console.log(password)

        if (username == null || name == null || password == null ) {
            return res.status(400).json({"error": "username, name and password fields cannot be blank",})
        }

        if (username.length < 3 || password.length < 3) {
            return res.status(400).json({"error": "username and password must be atleast 3 characters long"})
        }

        const saltRounds = 10
        const password_hash = await bcrypt.hash(password, saltRounds)

        const { data, error } = await supabase
          .from('users')
          .insert({username, name, password_hash})
          .select()
        if (error) throw error

        res.status(201).json(data)
    } catch (error) {
        next(error)
    }

}

const getAllUsers = async (req, res, next) => {
    try {
        const { data, error } = await supabase
          .from('users')
          .select()
        if (error) throw error

        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

const getIndividualUser = async (req, res, next) => {
    try {
        const id = req.params.id
        console.log("value of id: ", id)

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'user not found'})
            }
            throw error
        }

        if (!data) {
            return res.status(404).json({ error: 'user not found' })
        }

        console.log(data)

        res.status(200).json(data)
    } catch(error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id
        const { data, error } = await supabase
          .from('users')
          .delete()
          .eq('id', id)
          .select()

        if (error) throw error

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "user with given ID not found"})
        }

        res.status(204).send()
    } catch (error) {
        next(error)
    }

}

module.exports = { CreateUser, getAllUsers, getIndividualUser, deleteUser }