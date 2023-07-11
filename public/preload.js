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
        ui: {
            'darkMode': {
                // return   bool    isDarkMode
                toggle: () => ipcRenderer.invoke('api:settings:ui:darkMode:toogle'),
                // return   null
                system: () => ipcRenderer.invoke('api:settings:ui:darkMode:system'),
                // return   string  dark|light
                getThemeSource: () => ipcRenderer.invoke('api:settings:ui:darkMode:getThemeSource'),
            },
        },
    },

} );
