const {
    contextBridge,
    ipcRenderer,
} = require('electron');

contextBridge.exposeInMainWorld( 'api', {
    timeSlots: {
        // return   promise resolve array   items
        get: () => ipcRenderer.invoke( 'api:timeSlots:get' ),
        // return   promise resolve object  newTimeSlot
        add: newTimeSlot => ipcRenderer.invoke( 'api:timeSlots:add', newTimeSlot ),
        // return   promise resolve number  numberUpdated
        update: newTimeSlot => ipcRenderer.invoke( 'api:timeSlots:update', newTimeSlot ),


        delete: id => ipcRenderer.invoke( 'api:timeSlots:delete', id ),
    },

    settings: {
        ui: {
            // return   bool    isDarkMode
            toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
            // return   null
            system: () => ipcRenderer.invoke('dark-mode:system'),
        },
    },

} );
