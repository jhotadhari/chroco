const {
	app,
	BrowserWindow,
	shell,
} = require( 'electron' );
const path = require( 'path' );
const {
	setupApi, api,
} = require( './setupApi' );
const setupWindowMenu = require( './setupWindowMenu' );

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if ( require( 'electron-squirrel-startup' ) ) {
	app.quit();
}

let mainWindow = null;
const createWindow = () => {
	if ( null === mainWindow ) {
		// Create the browser window.
		mainWindow = new BrowserWindow( {
			width: 1600,
			height: 800,
			webPreferences: {
				nodeIntegration: false, // is default value after Electron v5
				contextIsolation: true, // protect against prototype pollution
				enableRemoteModule: false, // turn off remote
				preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			},
		} );

		// and load the index.html of the app.
		mainWindow.loadURL( MAIN_WINDOW_WEBPACK_ENTRY );

		// Change window title.
		mainWindow.webContents.on( 'did-stop-loading', () => {
			mainWindow.setTitle( app.getName() + ' - offline time tracker' );
		} );

		// Open external url in external browser.
		mainWindow.webContents.setWindowOpenHandler( ( { url } ) => {
			shell.openExternal( url );
			return { action: 'deny' };
		} );

		setupWindowMenu( mainWindow );
		setupApi();
	}
};

const gotTheLock = app.requestSingleInstanceLock();
if ( ! gotTheLock ) {
	app.quit();
}

app.on( 'second-instance', ( event, commandLine, workingDirectory ) => {
	if ( mainWindow ) {
		if ( mainWindow.isMinimized() ) {
			mainWindow.restore();
		}
		mainWindow.focus();
	}
} );

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( 'ready', createWindow );

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
} );

app.on( 'activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if ( BrowserWindow.getAllWindows().length === 0 ) {
		createWindow();
	}
} );

// Compact db when closing app.
let shouldCompactDatafile = true;
app.on( 'before-quit', ( e ) => {
	if ( shouldCompactDatafile ) {
		e.preventDefault();
		api.db.compact().then( () => {
			shouldCompactDatafile = false;
			app.quit();
		} );
	}
} );