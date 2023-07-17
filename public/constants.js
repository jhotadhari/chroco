

const path = require( 'path' );
const { app } = require( 'electron' );

const settingsDefaults = {

    themeSource: 'system',

    hideFields: [],

    dbPath: {
        settings: path.join( app.getPath( 'userData' ), '/settings.db'),
        timeSlots: path.join( app.getPath( 'userData' ), '/timeSlots.db'),
    },

    timezones: [],
};

module.exports = {
    settingsDefaults,
};