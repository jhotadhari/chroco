const {
    app,
    Tray,
    Menu,
    nativeImage,
    BrowserWindow,
    ipcMain,
    nativeTheme,
} = require('electron');

const isDev = require('electron-is-dev');
const path = require('path')
const db = require('./nedb/db');


function createWindow() {

    // Create the browser window.
    const win = new BrowserWindow( {
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, 'preload.js'),
        },
    } );

    // and load the index.html of the app.
    // win.loadFile("index.html");
    win.loadURL( isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    );

    // Open the DevTools.
    if ( isDev ) {
        win.webContents.openDevTools();
    }

    const icon = nativeImage.createFromPath( 'assets/tray.png' );
    let tray = new Tray(icon);
    tray.setToolTip( '???This is my application' )
    tray.setTitle( '???This is my title' )
    const contextMenu = Menu.buildFromTemplate( [
        { label: 'Item1', type: 'radio' },
        { label: 'Item2', type: 'radio' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' }
    ] );
    tray.setContextMenu( contextMenu );

    ipcMain.handle( 'api:timeSlots:get', (_) => new Promise( ( resolve, reject ) => {
        db.find( {} ).sort( { dateStart: -1 } ).exec( ( err, timeSlots ) => {
            if ( err ) {
                reject( err );
            }
            resolve( timeSlots );
        } );
    } ) );

    ipcMain.handle( 'api:timeSlots:delete', ( _, id ) => new Promise( ( resolve, reject ) => {
        db.remove( { _id: id }, ( err, result ) => {
            if ( err ) {
                reject( err );
            }
            resolve( result );
        } );
    } ) );

    ipcMain.handle( 'api:timeSlots:add', ( _, newTimeSlot ) => new Promise( ( resolve, reject ) => {
        db.insert( newTimeSlot, ( err, addedTimeSlot ) => {
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
            db.update( { _id: newTimeSlot._id }, newTimeSlot, {}, (err, numberUpdated ) => {
                if ( err ) {
                    reject( err );
                }
                resolve( numberUpdated );
            } );
        }
    } ) );

    ipcMain.handle('dark-mode:toggle', () => {
        if ( nativeTheme.shouldUseDarkColors ) {
            nativeTheme.themeSource = 'light'
        } else {
            nativeTheme.themeSource = 'dark'
        }
        return nativeTheme.shouldUseDarkColors
    } );

    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system'
    } );

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then( createWindow );

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
} );

app.on( 'activate', () => {
    if ( BrowserWindow.getAllWindows().length === 0 ) {
        createWindow();
    }
} );
