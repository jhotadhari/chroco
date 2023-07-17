

const path = require( 'path' );
const { app } = require( 'electron' );

const settingsDefaults = {

    themeSource: 'system',

    hideFields: [],

    dbPath: {
        settings: path.join( app.getPath( 'userData' ), '/settings.db'),
        timeSlots: path.join( app.getPath( 'userData' ), '/timeSlots.db'),
        current: path.join( app.getPath( 'userData' ), '/current.db'),
    },

    timezones: [],
};

module.exports = {
    settingsDefaults,
};