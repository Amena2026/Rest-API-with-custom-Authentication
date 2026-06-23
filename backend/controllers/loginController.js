const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { supabase } = require('../utils/supabase')

const login = async (req, res, next) => {
    try {
        // extract the userName and password fields from the request body 
        const { username, password } = req.body

        // build a query to search for a user with the provided username 
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single()

        // next we want to check if the password provided by the user is equal to the password stored in the database 
        // since the hashes of the passwords are stored to the database, we use the bcrypt.compare method to check 
        // if passwords are equal 
        const passwordCorrect = data === null
        ? false
        : await bcrypt.compare(password, data.password_hash)
        
        // if a user is not found or the password is incorrect, the request is responded to with status code 401
        if (!(data && passwordCorrect)) {
            return res.status(401).json({
                error: 'invalid username or password'
            })
        }

        // create a token with the jwt sign method. The token contains the username and id of the user in 
        // and is digitally signed with the secret string in the .env file
        const userForToken = {
            username: data.username,
            id: data.id

        }

        const token = jwt.sign(userForToken, process.env.SECRET, {expiresIn: '1h'})

        // a successful request is responded with status code 200
        // the generated token and username of the user is sent back in the response body
        res.status(200).send({token, username: data.username, name: data.name})

    } catch (error) {
        next(error)
    }
}

module.exports = { login }