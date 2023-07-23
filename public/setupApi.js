const {
    ipcMain,
    nativeTheme,
    app,
} = require( 'electron' );
const {
    isString,
    isObject,
    isArray,
    set,
    get,
} = require( 'lodash' );
const dayjs = require( 'dayjs' );
const { exec } = require( 'child_process' );
const getDb = require( './nedb/db' );
const {
    timeSlotsSchemaBase,
    settingsDefaults,
} = require( './constants' );
const {
    isPathValid,
    isValidTimezones,
    isValidRegex,
    getDateValuesForFilter,
} = require( './utils' );
const { debug } = require('console');

const api = {
    app: {},
    db: {},
    timeSlots: {},
    settings: {},
};

api.db.compact = () => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        Promise.all( Object.keys( db ).map( key => {
            return new Promise( res => {
                db[key].persistence.compactDatafile();
                db[key].on( 'compaction.done', () => {
                    res( true );
                } );
            } );
        } ) ).then( () => {
            resolve( true );
        } );
    } );
} );

// return   promise resolve object appInfo
api.app.getInfo = () => new Promise( ( resolve, reject ) => {
    const appInfo = {
        name: app.getName(),
        version: app.getVersion(),
    };
    resolve( appInfo );
} );

// return   promise resolve object timeSlot schema
let schema = false;
api.timeSlots.schema = () => new Promise( ( resolve, reject ) => {
    if ( ! schema ) {
        schema = {...timeSlotsSchemaBase};
        exec( 'git config --global user.name', { encoding: 'utf-8' }, (error, stdout) => {
            if ( ! error && stdout.length ) {
                schema.user.default = stdout;
            }
            resolve( schema )
        } );
    } else {
        resolve( schema );
    }
} );

// return   promise resolve array   timeSlots
api.timeSlots.get = filters => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        let query = {};
        if ( filters && Array.isArray( filters ) ) {
            [...filters].map( filter => {

                switch( timeSlotsSchemaBase[filter.field].type ) {
                    case 'text':
                        if ( filter.value.length && isValidRegex( filter.value ) ) {
                            // query['$and'] = query['$and'] ? query['$and'] : {};
                            switch( filter.type ) {
                                case 'include':
                                    set( query, [filter.field,'$regex'], new RegExp( filter.value ) );
                                    break;
                                case 'exclude':
                                    set( query, ['$not','$or'], [
                                        ...get( query, ['$not','$or'], [] ),
                                        {
                                            [filter.field]: new RegExp( filter.value ),
                                        }
                                    ] );
                                    break;
                            }
                        }
                        break;
                    case 'date':
                        if ( 'dateStart' === filter.field ) {
                            if ( 'custom' === filter.type ) {
                                set( query, ['dateStart','$gte'], filter.value.from );
                                set( query, ['dateStart','$lte'], filter.value.to );
                            } else {
                                const values = getDateValuesForFilter( { timeFrame: filter.type, value: filter.value } );
                                set( query, ['dateStart','$gte'], values.from );
                                set( query, ['dateStart','$lte'], values.to );
                            }
                        }
                        break;
                }
            } );
        }
        db.timeSlots.find( query ).sort( { dateStart: -1 } ).exec( ( err, timeSlots ) => {
            resolve( timeSlots );
        } );
    } );
} );

// return   promise resolve object   timeSlot
api.timeSlots.getCurrent = () => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        db.timeSlots.find( { dateStop: { $exists: false } } ).sort( { dateStart: -1 } ).limit( 1 ).exec( ( err, timeSlots ) => {
            resolve( timeSlots.length ? timeSlots[0] : null );
        } );
    } );
} );

// return   promise resolve object  updatedTimeSlot
api.timeSlots.stop = timeSlot => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        if ( ! timeSlot._id ) {
            reject( '??? err no _id' );
        } else {
            const newTimeSlot = {
                ...timeSlot,
                dateStop: dayjs().valueOf(),
            };
            db.timeSlots.update( { _id: newTimeSlot._id }, newTimeSlot, {}, (err, numberUpdated ) => {
                if ( numberUpdated ) {
                    resolve( newTimeSlot );
                }
                reject();
            } );
        }
    } );
} );

// return   promise resolve number  numberDeleted
api.timeSlots.delete = id => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        db.timeSlots.remove( { _id: id }, ( err, numberDeleted ) => {
            resolve( numberDeleted );
        } );
    } );
} );

// return   promise resolve object  addedTimeSlot, stoppedTimeSlot
api.timeSlots.add = newTimeSlot => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        const add = stoppedTimeSlot => {
            db.timeSlots.insert( newTimeSlot, ( err, addedTimeSlot ) => {
                const result = {
                    addedTimeSlot,
                    stoppedTimeSlot,
                };
                resolve( result );
            } );
        };
        // Maybe stop current one first, before adding a new one.
        api.timeSlots.getCurrent().then( currentTimeSlot => {
            if ( currentTimeSlot ) {
                api.timeSlots.stop( currentTimeSlot ).then( stoppedTimeSlot => {
                    if ( stoppedTimeSlot ) {
                        add( stoppedTimeSlot );
                    }
                } )
            } else {
                add();
            }
        } )
    } );
} );

// return   promise resolve number  numberUpdated
api.timeSlots.update = newTimeSlot => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        if ( ! newTimeSlot._id ) {
            reject( '??? err no _id' );
        } else {
            db.timeSlots.update( { _id: newTimeSlot._id }, newTimeSlot, {}, (err, numberUpdated ) => {
                resolve( numberUpdated );
            } );
        }
    } );
} );



const validateSetting = setting => {
    let errors = [];
    switch( setting.key ) {
        case 'dbPath':
            if ( ! isObject( setting.value ) ) {
                return [setting.key + ' must be type of object'];
            }
            ['settings','timeSlots'].map( key => {
                if ( ! Object.keys( setting.value ).includes( key ) ) {
                    errors = [...errors, 'dbPath requires key "' + key + '".' ];
                }
            } );
            Object.keys( setting.value ).map( p => {
                if ( ! isString( p ) ) {
                    errors = [...errors, 'Path should be a string.' ];
                } else {
                    if ( ! isPathValid( setting.value[p] ) ) {
                        errors = [...errors, 'Path ' + setting.value[p] + ' is not writable.' ];
                    }
                }
            } );
            return errors.length ? errors : true;
        case 'hideFields':
            if ( ! isArray( setting.value ) ) {
                return [setting.key + ' must be type of array'];
            }
            [...setting.value].map( val => {
                if ( ! isString( val ) ) {
                    errors = [...errors, 'hideFields array can only hold strings.' ];
                }
            } );
            return errors.length ? errors : true;
        case 'themeSource':
            if ( ! isString( setting.value ) ) {
                return [setting.key + ' must be type of string.'];
            }
            const valid = ['system','dark','light'];
            if ( valid.includes( setting.value ) ) {
                return true;
            } else {
                return ['themeSource must be one of "' + valid.join( '|' ) + '".'];
            }
        case 'timezones':
            if ( ! isArray( setting.value ) ) {
                return [setting.key + ' must be type of array.'];
            }
            if ( ! isValidTimezones( setting.value ) ) {
                return ['Timezone not valid.'];
            }
            return true;
        case 'filters':
            if ( ! isArray( setting.value ) ) {
                return [setting.key + ' must be type of array.'];
            }
            // ??? TODO validate filters
            return true;
        default:
            return ['"' + setting.key + '" is not a valid settings key.'];
    }
}

// return   promise resolve object   settingsDefaults
api.settings.getDefaults = () => new Promise( ( resolve, reject ) => {
    resolve( settingsDefaults );
} );
// return   promise resolve array   settings
api.settings.get = () => new Promise( ( resolve, reject ) => {
    getDb().then( db => {
        db.settings.find( {}, ( err, settings ) => {
            resolve( settings );
        } );
    } );
} );

// return   promise resolve object  addedTimeSlot
api.settings.add = newSetting => new Promise( ( resolve, reject ) => {
    const valid = validateSetting( newSetting );
    if ( true !== valid ) {
        return reject( valid.join( '#####' ) )
    }
    getDb().then( db => {
        db.settings.insert( newSetting, ( err, addedSetting ) => {
            resolve( addedSetting );
        } );
    } );
} );

// return   promise resolve number  numberUpdated
api.settings.update = newSetting => new Promise( ( resolve, reject ) => {
    const valid = validateSetting( newSetting );
    if ( true !== valid ) {
        return reject( valid.join( '#####' ) )
    }
    getDb().then( db => {
        if ( ! newSetting._id ) {
            reject( '??? err no _id' );
        } else {
            db.settings.update( { _id: newSetting._id }, newSetting, {}, (err, numberUpdated ) => {
                resolve( numberUpdated );
            } );
        }
    } );
} );



const setupApi = () => {

    ipcMain.handle( 'api:db:compact', (_) =>                        api.db.compact() );
    ipcMain.handle( 'api:app:getInfo', (_) =>                       api.app.getInfo() );

    /**
     * timeSlots
     *
     */
    ipcMain.handle( 'api:timeSlots:schema', (_) =>                  api.timeSlots.schema() );
    ipcMain.handle( 'api:timeSlots:get', (_, filters) =>            api.timeSlots.get( filters ) );
    ipcMain.handle( 'api:timeSlots:getCurrent', (_) =>              api.timeSlots.getCurrent() );
    ipcMain.handle( 'api:timeSlots:stop', ( _, timeSlot ) =>        api.timeSlots.stop( timeSlot ) );
    ipcMain.handle( 'api:timeSlots:delete', ( _, id ) =>            api.timeSlots.delete( id ) );
    ipcMain.handle( 'api:timeSlots:add', ( _, newTimeSlot ) =>      api.timeSlots.add( newTimeSlot ) );
    ipcMain.handle( 'api:timeSlots:update', ( _, newTimeSlot ) =>   api.timeSlots.update( newTimeSlot ) );

    /**
     * settings
     *
     */
    ipcMain.handle( 'api:settings:getDefaults', (_) =>              api.settings.getDefaults() );
    ipcMain.handle( 'api:settings:get', (_) =>                      api.settings.get() );
    ipcMain.handle( 'api:settings:add', (_, newSetting) =>          api.settings.add( newSetting ) );
    ipcMain.handle( 'api:settings:update', (_, newSetting) =>       api.settings.update( newSetting ) );

    /**
     * darkMode
     *
     */
    ipcMain.handle('api:darkMode:setThemeSource', (_, themeSource) => {
        nativeTheme.themeSource = themeSource
        return nativeTheme.shouldUseDarkColors;
    } );
    ipcMain.handle('api:darkMode:getThemeSource', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light' );

}

module.exports = {
    setupApi,
    api,
    settingsDefaults,
};