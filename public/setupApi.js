const {
    ipcMain,
    nativeTheme,
} = require('electron');
const dayjs = require('dayjs');
const { exec } = require('child_process');
const db = require('./nedb/db');

const api = {
    db: {},
    timeSlots: {},
    settings: {},
};

api.db.compact = () => new Promise( ( resolve, reject ) => {
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

// return   promise resolve object timeSlot schema
let schema = false;
api.timeSlots.schema = () => new Promise( ( resolve, reject ) => {
    if ( ! schema ) {
        schema = {
            _id: {
                type: 'text',
                title: '',
            },
            title: {
                type: 'text',
                title: 'Title',
            },
            project: {
                type: 'text',
                title: 'Project',
            },
            client: {
                type: 'text',
                title: 'Client',
            },
            user: {
                type: 'text',
                title: 'User',
            },
            dateStart: {
                type: 'date',
                title: 'Start',
            },
            dateStop: {
                type: 'date',
                title: 'Stop',
            },
        }
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
api.timeSlots.get = () => new Promise( ( resolve, reject ) => {
    db.timeSlots.find( {} ).sort( { dateStart: -1 } ).exec( ( err, timeSlots ) => {
        resolve( timeSlots );
    } );
} );

// return   promise resolve object   timeSlot
api.timeSlots.getCurrent = () => new Promise( ( resolve, reject ) => {
    db.current.find( { type: 'timeSlot' } ).exec( ( err, currents ) => {

        if ( currents.length ) {
            // Should be length 1,

            let timeSlot = null;
            resolve( [...currents].reduce( ( accumulatorPromise, current, index ) => {
                return accumulatorPromise.then( () => {
                    return new Promise( ( res, reject ) => {
                        db.timeSlots.find( { _id: current.connectedId } ).limit( 1 ).exec( ( err, timeSlots ) => {
                            if ( timeSlots.length ) {
                                timeSlot = timeSlots[0];
                                res( timeSlots[0] );
                            } else {
                                // This should actually not happen. Just delete that zombie.
                                db.current.remove( { type: 'timeSlot', _id: current._id }, ( err, numberDeleted ) => {
                                    res( timeSlot );
                                } );
                            }
                        } );
                    } );
                } ).catch( err => console.log( err ) );
            }, Promise.resolve() ) );




        } else {
            resolve( null );
        }
    } );
} );

// return   promise resolve object  updatedTimeSlot
api.timeSlots.stop = timeSlot => new Promise( ( resolve, reject ) => {
    if ( ! timeSlot._id ) {
        reject( '??? err no _id' );
    } else {
        const newTimeSlot = {
            ...timeSlot,
            dateStop: dayjs().valueOf(),
        };
        db.current.remove( { type: 'timeSlot', connectedId: newTimeSlot._id }, ( err, numberDeleted ) => {
            db.timeSlots.update( { _id: newTimeSlot._id }, newTimeSlot, {}, (err, numberUpdated ) => {
                if ( numberUpdated ) {
                    resolve( newTimeSlot );
                }
                reject();
            } );
        } );
    }
} );

// return   promise resolve number  numberDeleted
api.timeSlots.delete = id => new Promise( ( resolve, reject ) => {
    Promise.all( [
        // Try to remove current.
        new Promise( res => {
            db.current.remove( { type: 'timeSlot', _id: id }, ( err, numberDeleted ) => {
                res( true );
            } );
        } ),
        // Remove timeSlot.
        new Promise( res => {
            db.timeSlots.remove( { _id: id }, ( err, numberDeleted ) => {
                res( true );
            } );
        } ),
    ] ).then( () => {
        resolve( true );
    } );
} );

// return   promise resolve object  addedTimeSlot, stoppedTimeSlot
api.timeSlots.add = newTimeSlot => new Promise( ( resolve, reject ) => {
    const add = stoppedTimeSlot => {
        db.timeSlots.insert( newTimeSlot, ( err, addedTimeSlot ) => {
            db.current.insert( { type: 'timeSlot', connectedId: addedTimeSlot._id }, ( err, addedCurrent ) => {
                const result = {
                    addedTimeSlot,
                    stoppedTimeSlot,
                };
                resolve( result );
            } );
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

// return   promise resolve number  numberUpdated
api.timeSlots.update = newTimeSlot => new Promise( ( resolve, reject ) => {
    if ( ! newTimeSlot._id ) {
        reject( '??? err no _id' );
    } else {
        db.timeSlots.update( { _id: newTimeSlot._id }, newTimeSlot, {}, (err, numberUpdated ) => {
            resolve( numberUpdated );
        } );
    }
} );




// return   promise resolve array   settings
api.settings.get = () => new Promise( ( resolve, reject ) => {
    db.settings.find( {}, ( err, settings ) => {
        resolve( settings );
    } );
} );

// return   promise resolve object  addedTimeSlot
api.settings.add = newSetting => new Promise( ( resolve, reject ) => {
    db.settings.insert( newSetting, ( err, addedSetting ) => {
        resolve( addedSetting );
    } );
} );

// return   promise resolve number  numberUpdated
api.settings.update = newSetting => new Promise( ( resolve, reject ) => {
    if ( ! newSetting._id ) {
        reject( '??? err no _id' );
    } else {
        db.settings.update( { _id: newSetting._id }, newSetting, {}, (err, numberUpdated ) => {
            resolve( numberUpdated );
        } );
    }
} );



const setupApi = () => {

    ipcMain.handle( 'api:db:compact', (_) =>                        api.db.compact() );

    /**
     * timeSlots
     *
     */
    ipcMain.handle( 'api:timeSlots:schema', (_) =>                  api.timeSlots.schema() );
    ipcMain.handle( 'api:timeSlots:get', (_) =>                     api.timeSlots.get() );
    ipcMain.handle( 'api:timeSlots:getCurrent', (_) =>              api.timeSlots.getCurrent() );
    ipcMain.handle( 'api:timeSlots:stop', ( _, timeSlot ) =>        api.timeSlots.stop( timeSlot ) );
    ipcMain.handle( 'api:timeSlots:delete', ( _, id ) =>            api.timeSlots.delete( id ) );
    ipcMain.handle( 'api:timeSlots:add', ( _, newTimeSlot ) =>      api.timeSlots.add( newTimeSlot ) );
    ipcMain.handle( 'api:timeSlots:update', ( _, newTimeSlot ) =>   api.timeSlots.update( newTimeSlot ) );

    /**
     * settings
     *
     */
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
    api
};