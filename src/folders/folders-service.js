const FoldersService = {
    getAllFolders(knex) {
        return knex
            .select('*')
            .from('noteful_folders')
    },
    getById(knex, id) {
        return knex
            .select('*')
            .from('noteful_folders')
            .where({ id })
            .first()
    },
    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('noteful_folders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteFolder(knex, id) {
        return knex('noteful_folders')
            .where({ id })
            .delete()
    },
    updateFolder(knex, id, newFolderFields) {
        return knex('noteful_folders')
            .where({ id })
            .update(newFolderFields)

    }
}

module.exports = FoldersService