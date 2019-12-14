const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('noteful_notes')
    },
    getById(knex, id) {
        return knex.select('*').from('noteful_notes').where({ id }).first()
    },
    insertNote(knex, newNoteFields) {
        console.log('newNoteFields in service!',newNoteFields)
        return knex
            .db.raw(`INSERT INTO noteful_notes (folderId, name, content) 
                    VALUES(${newNoteFields.folderId}, ${newNoteFields.name}, ${newNoteFields.content})`)
            .returning('*')
            .then(rows => {
                console.log('Row', rows[0])
                return rows[0]
            })
    },
    deleteNote(knex, id) {
        return knex('noteful_notes')
            .where({ id })
            .delete()
    },
    updateNote(knex, id, newNoteFields) {
        return knex('noteful_notes')
            .where({ id })
            .update(newNoteFields)
    }
}

module.exports = NotesService