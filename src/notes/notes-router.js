const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

/*const serializeNotes = notes => ({
    id: notes.id,
    name: xss(notes.name),
    modified: notes.modified,
    folderId: notes.folderId,
    content: xss(notes.content),
}) */

notesRouter
    .route('/')
    .get((req, res, next) => {
        console.log('GET /api/notes called')
        NotesService.getAllNotes(req.app.get('db'))
        .then(notes => {
            res.json({notes})
        })
        .catch(next)
    })
    .post(jsonParser,(req, res, next) => {
        const { name, folderId, content } = req.body
        const newNote = { name, folderId, content }

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                res.status(400).json({
                    error: {
                        message: `Missing ${key} in the request body`
                    }
                })
            }
        }

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
        .then(note => {
            res.status(201)
                .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json({ note })
        })
        .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
        .then(note => {
            if (!note) {
                res.status(400).json({
                    error: {
                        message: `Note doesn't exist`
                    }
                })
            }
            res.note = note
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        serializeNotes(res.note)
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
        .then(numOfRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, modified, content } = req.body
        const updatedNote = { name, modified, content }

        const numOfValues = Object.values(updatedNote).filter(Boolean).length

        if (numOfValues === 0) {
            res.status(400).json({
                error: {
                    message: `Request body must be one of 'name', 'modified' or 'content'`
                }
            })
        }

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            updatedNote
        )
        .then(numOfRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = notesRouter