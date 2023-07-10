const {
    contextBridge,
    ipcRenderer,
} = require('electron');

contextBridge.exposeInMainWorld( 'api', {
    timeSlots: {
        // return   promise resolve array   timeSlots
        get: () => ipcRenderer.invoke( 'api:timeSlots:get' ),
        // return   promise resolve object  newTimeSlot
        add: newTimeSlot => ipcRenderer.invoke( 'api:timeSlots:add', newTimeSlot ),
        // return   promise resolve number  numberUpdated
        update: newTimeSlot => ipcRenderer.invoke( 'api:timeSlots:update', newTimeSlot ),


        delete: id => ipcRenderer.invoke( 'api:timeSlots:delete', id ),
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
