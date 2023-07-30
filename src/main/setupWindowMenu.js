const { Menu } = require( 'electron' );

const setupWindowMenu = win => {

	const menuTemplate = [
		{
			label: 'File',
			role: 'fileMenu',
			submenu: [
				{
					label: 'Preferences',
					accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P',
					click: () => win.webContents.send( 'toggle-preferences' ),
				},
				{ role: 'quit' },
			],
		},

		{ role: 'editMenu' },
		// {
		//     label: 'Edit',
		//     submenu: [
		//         { role: 'undo' },
		//         { role: 'redo' },
		//         { type: 'separator' },
		//         { role: 'cut' },
		//         { role: 'copy' },
		//         { role: 'paste' },
		//     ]
		// },

		{ role: 'viewMenu' },
		// {
		//     label: 'View',
		//     submenu: [
		//         { role: 'reload' },
		//         { role: 'forceReload' },
		//         { role: 'toggleDevTools' },
		//         { type: 'separator' },
		//         { role: 'resetZoom' },
		//         { role: 'zoomIn' },
		//         { role: 'zoomOut' },
		//         { type: 'separator' },
		//         { role: 'togglefullscreen' },
		//     ]
		// },

		// { role: 'windowMenu' },
		{
			label: 'Window',
			submenu: [
				{ role: 'minimize' },
				//   { role: 'zoom' },
				{ role: 'close' },
			],
		},

		// {
		//     role: 'help',
		//     submenu: [
		//     {
		//         label: 'Learn More',
		//         click: async () => {
		//             const { shell } = require( 'electron' )
		//             await shell.openExternal('https://electronjs.org')
		//         }
		//     }
		//     ]
		// },
	];
	const menu = Menu.buildFromTemplate( menuTemplate );
	Menu.setApplicationMenu( menu );
};

module.exports = setupWindowMenu;