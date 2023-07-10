const {
    ipcMain,
    nativeTheme,
} = require('electron');
const db = require('./nedb/db');

const setupApi = () => {

    /**
     * timeSlots
     *
     */
    ipcMain.handle( 'api:timeSlots:get', (_) => new Promise( ( resolve, reject ) => {
        db.timeSlots.find( {} ).sort( { dateStart: -1 } ).exec( ( err, timeSlots ) => {
            if ( err ) {
                reject( err );
            }
            resolve( timeSlots );
        } );
    } ) );

    ipcMain.handle( 'api:timeSlots:delete', ( _, id ) => new Promise( ( resolve, reject ) => {
        db.timeSlots.remove( { _id: id }, ( err, result ) => {
            if ( err ) {
                reject( err );
            }
            resolve( result );
        } );
    } ) );

    ipcMain.handle( 'api:timeSlots:add', ( _, newTimeSlot ) => new Promise( ( resolve, reject ) => {
        db.timeSlots.insert( newTimeSlot, ( err, addedTimeSlot ) => {
            if ( err ) {
                reject( err );
            }
            resolve( addedTimeSlot );
        } );
    } ) );

    ipcMain.handle( 'api:timeSlots:update', ( _, newTimeSlot ) => new Promise( ( resolve, reject ) => {
        if ( ! newTimeSlot._id ) {
            reject( '??? err no _id' );
        } else {
            db.timeSlots.update( { _id: newTimeSlot._id }, newTimeSlot, {}, (err, numberUpdated ) => {
                if ( err ) {
                    reject( err );
                }
                resolve( numberUpdated );
            } );
        }
    } ) );

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