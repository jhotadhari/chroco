

const path = require( 'path' );
const { app } = require( 'electron' );

const timeSlotsSchemaBase = {
    _id: {
        type: 'text',
        title: '',
    },
    title: {
        type: 'text',
        title: 'Title',
        titlePlural: 'Titles',
    },
    project: {
        type: 'text',
        title: 'Project',
        titlePlural: 'Projects',
        hasSuggestions: true,
    },
    client: {
        type: 'text',
        title: 'Client',
        titlePlural: 'Clients',
        hasSuggestions: true,
    },
    user: {
        type: 'text',
        title: 'User',
        titlePlural: 'Users',
        hasSuggestions: true,
    },
    dateStart: {
        type: 'date',
        title: 'Start',
    },
    dateStop: {
        type: 'date',
        title: 'Stop',
    },
};

const settingsDefaults = {

    themeSource: 'system',

    hideFields: [],

    dbPath: {
        settings: path.join( app.getPath( 'userData' ), '/settings.db'),
        timeSlots: path.join( app.getPath( 'userData' ), '/timeSlots.db'),
    },

    timezones: [],

    filters: [
        // {
        //     field: 'client',
        //     type: 'include',
        //     value: 'cr',
        // }
    ],
};

module.exports = {
    timeSlotsSchemaBase,
    settingsDefaults,
};