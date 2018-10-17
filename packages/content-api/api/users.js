module.exports = {
    docName: 'users',

    browse: {
        options: [
            'include',
            'filter',
            'fields',
            'limit',
            'status',
            'order',
            'debug'
        ]
    },

    read: {
        options: [
            'include',
            'filter',
            'fields',
            'debug'
        ],
        data: [
            'id',
            'slug',
            'status',
            'email',
            'role'
        ]
    }
};
