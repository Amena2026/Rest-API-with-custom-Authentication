const { supabase } = require('../utils/supabase')

const getAll = async (req, res, next) => {
    try {
        const { data, error } = await supabase
          .from('blogs')
          .select()
        if (error) throw error

        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

const getIndividualBlog = async (req, res, next) => {
    try {
        const id = req.params.id
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single()
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'blog not found' })
            }
            throw error
        }

        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

const createBlog = async (req, res, next) => {
    try {
        const { title, author, url, likes = 0 } = req.body
        if (title == null || author == null || url == null) {
            return res.status(400).json({ error: 'title, author, and url are required' })
        }

        const { data, error } = await supabase
          .from('blogs')
          .insert({ title, author, url, likes })
          .select()
        if (error) throw error

        res.status(201).json(data)
    } catch (error) {
        next(error)
    }
}

const updateBlog = async (req, res, next) => {
    try {
        const id = req.params.id
        const { title, author, url, likes } = req.body
        if (title == null || author == null || url == null || likes == null) {
            return res.status(400).json({ error: 'title, author, url, and likes are required' })
        }

        const { data, error } = await supabase
          .from('blogs')
          .update({ title, author, url, likes })
          .eq('id', id)
          .select()
        if (error) throw error

        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

const deleteBlog = async (req, res, next) => {
    try {
        const id = req.params.id
        const { error } = await supabase
          .from('blogs')
          .delete()
          .eq('id', id)
        if (error) throw error

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAll,
    getIndividualBlog,
    createBlog,
    updateBlog,
    deleteBlog
}
