const express = require('express')
const blogRouter = express.Router()
const blogController = require('../controllers/blogController')

blogRouter.get('/', blogController.getAll)
blogRouter.get('/:id', blogController.getIndividualBlog)
blogRouter.post('/', blogController.createBlog)
blogRouter.put('/:id', blogController.updateBlog)
blogRouter.delete('/:id', blogController.deleteBlog)

module.exports = blogRouter