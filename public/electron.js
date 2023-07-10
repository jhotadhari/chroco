const {
    app,
    Tray,
    Menu,
    nativeImage,
    BrowserWindow,
} = require('electron');

const isDev = require('electron-is-dev');
const path = require('path')
const setupApi = require('./setupApi');
const db = require('./nedb/db');


function createWindow() {

    // Create the browser window.
    const win = new BrowserWindow( {
        width: 1400,
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

    setupApi();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then( () => {
    createWindow();
    // if ( isDev ) {
    //     const {
    //         default: installExtension,
    //         REACT_DEVELOPER_TOOLS,
    //     } = require('electron-devtools-installer');
    //     installExtension( REACT_DEVELOPER_TOOLS, true )
    //         .then((name) => {
    //             createWindow();
    //             console.log(`Added Extension:  ${name}`);
    //         } )
    //         .catch((err) => console.log('An error occurred: ', err));
    // } else {
    //     createWindow();
    // }
} );

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

// Compact db when closing app.
let shouldCompactDatafile = true;
app.on( 'before-quit', ( e ) => {
    if ( shouldCompactDatafile ) {
        e.preventDefault()
		Promise.all( Object.keys( db ).map( key => {
			return new Promise( resolve => {
                db[key].persistence.compactDatafile();
                db[key].on( 'compaction.done', () => {
                    resolve( true );
                } );
			} );
		} ) ).then( () => {
            shouldCompactDatafile = false;
            app.quit();
        } );
    }
} );