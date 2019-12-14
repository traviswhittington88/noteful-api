const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('noteful_notes')
    },
    getById(knex, id) {
        return knex.select('*').from('noteful_notes').where({ id }).first()
    },
    insertNote(knex, newNoteFields) {
        return knex
            .insert(newNoteFields)
            .into('noteful_notes')
            .returning('*')
            .then(rows => {
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