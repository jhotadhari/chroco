const {
    ipcMain,
    nativeTheme,
} = require('electron');
const db = require('./nedb/db');
const dayjs = require('dayjs');

const api = {
    timeSlots: {},
    settings: {},
};

// return   promise resolve array   timeSlots
api.timeSlots.get = () => new Promise( ( resolve, reject ) => {
    db.timeSlots.find( {} ).sort( { dateStart: -1 } ).exec( ( err, timeSlots ) => {
        resolve( timeSlots );
    } );
} );

// return   promise resolve object   timeSlot
api.timeSlots.getCurrent = () => new Promise( ( resolve, reject ) => {
    db.current.find( { type: 'timeSlot' } ).limit( 1 ).exec( ( err, currents ) => {
        if ( currents.length ) {
            db.timeSlots.find( { _id: currents[0].connectedId } ).limit( 1 ).exec( ( err, timeSlots ) => {
                resolve( timeSlots.length ? timeSlots[0] : null );
            } );
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

// return   promise resolve object  newTimeSlot
api.timeSlots.add = newTimeSlot => new Promise( ( resolve, reject ) => {
    const add = () => {
        db.timeSlots.insert( newTimeSlot, ( err, addedTimeSlot ) => {
            db.current.insert( { type: 'timeSlot', connectedId: addedTimeSlot._id }, ( err, addedCurrent ) => {
                resolve( addedTimeSlot );
            } );
        } );
    };
    // Maybe stop current one first, before adding a new one.
    api.timeSlots.getCurrent().then( currentTimeSlot => {
        if ( currentTimeSlot ) {
            api.timeSlots.stop( currentTimeSlot ).then( stoppedTimeSlot => {
                if ( stoppedTimeSlot ) {
                    add();
                }
            } )
        }
        add();
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

const setupApi = () => {

    /**
     * timeSlots
     *
     */
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
    ipcMain.handle('api:settings:ui:darkMode:toogle', () => {
        if ( nativeTheme.shouldUseDarkColors ) {
            nativeTheme.themeSource = 'light'
        } else {
            nativeTheme.themeSource = 'dark'
        }

        console.log( 'debug nativeTheme.shouldUseDarkColors', nativeTheme.shouldUseDarkColors ); // debug
        return nativeTheme.shouldUseDarkColors;
    } );

    ipcMain.handle('api:settings:ui:darkMode:system', () => {
        nativeTheme.themeSource = 'system'

        console.log( 'debug nativeTheme.shouldUseDarkColors', nativeTheme.shouldUseDarkColors ); // debug
    } );

    ipcMain.handle('api:settings:ui:darkMode:getThemeSource', () => {
        if ( nativeTheme.shouldUseDarkColors ) {
            return 'dark'
        } else {
            return 'light'
        }
    } );

}
module.exports = setupApi;