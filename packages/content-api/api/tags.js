module.exports = {
    docName: 'tags',

    browse: {
        options: [
            'include',
            'filter',
            'fields',
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
            'debug'
        ],
        data: [
            'id',
            'slug',
            'visibility'
        ]
    }
};
