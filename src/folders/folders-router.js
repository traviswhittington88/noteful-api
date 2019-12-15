const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolders = folders => ({
    ...folders,
    name: xss(folders.name),
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(
            req.app.get('db')
        )
        .then(folders => {
            res.json(folders.map(serializeFolders))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newFolder = { name }

        for (const[key, value] of Object.entries(newFolder)) {
            if(value == null) {
                res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                })
            }
        }

        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
        .then(folder => {
            return res.status(201)  //created
                        .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                        .json(serializeFolders(folder))
        })
        .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folder_id
        )
        .then(folder => {
            if (!folder) {
                return res.status(400).json({
                    error: {
                        message: `That folder doesn't exists`
                    }
                })
            }
            res.folder = folder
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolders(res.folder))
    })
    .delete((req, res, next) => {
        FoldersService.deleteFolder(
            req.app.get('db'),
            req.params.folder_id
        )
        .then(numOfRowsAffected => {
            res.status(204).end()  //no content 
        })
        .catch(next)
    })
    .patch(jsonParser,(req, res, next) => {
        const { name } = req.body
        const updatedFolder = { name }

        const numOfValues = Object.values(updatedFolder).filter(Boolean).length

        if (numOfValues === 0) {
            res.status(400).json({
                error: {
                    message: `Request body must contain 'name'`
                }
            })
        }

        FoldersService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            updatedFolder
        )
        .then(numOfRowsAffected => {
            res.status(204).end()  // no content 
        })
        .catch(next)
    })


module.exports = foldersRouter