const express = require('express')
const userRouter = express.Router()
const userController = require('../controllers/userController')

userRouter.get('/', userController.getAllUsers)
userRouter.get('/:id', userController.getIndividualUser)
userRouter.post('/', userController.CreateUser)
userRouter.delete('/:id', userController.deleteUser)

module.exports = userRouter