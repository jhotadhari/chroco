const {
	contextBridge,
	ipcRenderer,
} = require( 'electron' );

contextBridge.exposeInMainWorld( 'api', {

	db: { compact: () => ipcRenderer.invoke( 'api:db:compact' ) },

	app: {
		getInfo: () => ipcRenderer.invoke( 'api:app:getInfo' ),
		onTogglePreferences: callback => ipcRenderer.on( 'toggle-preferences', callback ),
	},

	timeSlots: {
		schema: () => ipcRenderer.invoke( 'api:timeSlots:schema' ),
		get: filters => ipcRenderer.invoke( 'api:timeSlots:get', filters ),
		getCurrent: () => ipcRenderer.invoke( 'api:timeSlots:getCurrent' ),
		stop: timeSlot => ipcRenderer.invoke( 'api:timeSlots:stop', timeSlot ),
		delete: id => ipcRenderer.invoke( 'api:timeSlots:delete', id ),
		add: ( newTimeSlot, options ) => ipcRenderer.invoke( 'api:timeSlots:add', newTimeSlot, options ),
		update: newTimeSlot => ipcRenderer.invoke( 'api:timeSlots:update', newTimeSlot ),
	},

	settings: {
		getDefaults: () => ipcRenderer.invoke( 'api:settings:getDefaults' ),
		get: settingKey => ipcRenderer.invoke( 'api:settings:get', settingKey ),
		add: ( newSetting, options ) => ipcRenderer.invoke( 'api:settings:add', newSetting, options ),
		update: ( newSetting, options ) => ipcRenderer.invoke( 'api:settings:update', newSetting, options ),
	},

	darkMode: {
		getThemeSource: () => ipcRenderer.invoke( 'api:darkMode:getThemeSource' ),
		setThemeSource: themeSource => ipcRenderer.invoke( 'api:darkMode:setThemeSource', themeSource ),
	},

} );
