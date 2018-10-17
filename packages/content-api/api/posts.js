module.exports = {
    docName: 'posts',

    browse: {
        options: [
            'include',
            'filter',
            'fields',
            'formats',
            'status',
            'limit',
            'order',
            'debug'
        ]
    },

    read: {
        options: [
            'include',
            'filter',
            'fields',
            'status',
            'formats',
            'debug'
        ],
        data: [
            'id',
            'slug',
            'status',
            'uuid'
        ]
    }
};
