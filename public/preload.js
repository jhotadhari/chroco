const {
    contextBridge,
    ipcRenderer,
} = require('electron');

contextBridge.exposeInMainWorld( 'api', {

    db: {
        compact: () => ipcRenderer.invoke( 'api:db:compact' ),
    },

    timeSlots: {
        schema: () => ipcRenderer.invoke( 'api:timeSlots:schema' ),
        get: () => ipcRenderer.invoke( 'api:timeSlots:get' ),
        getCurrent: () => ipcRenderer.invoke( 'api:timeSlots:getCurrent' ),
        stop: timeSlot => ipcRenderer.invoke( 'api:timeSlots:stop', timeSlot ),
        delete: id => ipcRenderer.invoke( 'api:timeSlots:delete', id ),
        add: newTimeSlot => ipcRenderer.invoke( 'api:timeSlots:add', newTimeSlot ),
        update: newTimeSlot => ipcRenderer.invoke( 'api:timeSlots:update', newTimeSlot ),
    },

    settings: {
        getDefaults: () => ipcRenderer.invoke( 'api:settings:getDefaults' ),
        get: () => ipcRenderer.invoke( 'api:settings:get' ),
        add: newSetting => ipcRenderer.invoke( 'api:settings:add', newSetting ),
        update: newSetting => ipcRenderer.invoke( 'api:settings:update', newSetting ),
    },

    darkMode: {
        getThemeSource: () => ipcRenderer.invoke('api:darkMode:getThemeSource'),
        setThemeSource: themeSource => ipcRenderer.invoke('api:darkMode:setThemeSource', themeSource ),
    },

} );
