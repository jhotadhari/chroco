import './style/App.scss';
import {
  get,
} from 'lodash';
import {
  useEffect,
  useState,
} from 'react';
import Context from './Context';
import Settings from './Components/Settings/Settings';
import { CreateTimeSlot } from './Components/CreateTimeSlot';
import { TimeSlotsTable } from './Components/TimeSlotsTable';
import { sortTimeSlotsCompare } from './utils';
const { api } = window;


const eventTick = new Event( 'tick' );
setInterval( () => {
  window.dispatchEvent( eventTick );
}, 1000 );

function App() {
  const [settings, setSettings] = useState( [] );
  const [settingsDefaults, setSettingsDefaults] = useState( null );
  const [themeSource, setThemeSource] = useState( false );

  const [timeSlotSchema, setTimeSlotSchema] = useState( null );
  const [timeSlots, setTimeSlots] = useState( [] );
  const [timeSlotCurrent, setTimeSlotCurrent] = useState( null );
  const [timeSlotCurrentEdit, setTimeSlotCurrentEdit] = useState( null );

  // Helper function to retrieve one setting value.
  const getSetting = ( key, _settings, _settingsDefaults ) => {
    let setting = ( _settings ? _settings : settings ).find( sett => get( sett, 'key' ) === key );
    return get( setting, 'value', get( _settingsDefaults ? _settingsDefaults : settingsDefaults, key ) );
  }

  // Initially set settings, settingsDefaults and apply theme colors.
  useEffect( () => {
    Promise.all( [
      // Get settings.
      new Promise( res => {
        api.settings.get().then( settings => {
          setSettings( settings );
          res( settings )
        } );
      } ),
      // Get settingsDefaults.
      new Promise( res => {
        api.settings.getDefaults().then( settingsDefaults => {
          setSettingsDefaults( settingsDefaults );
          res( settingsDefaults )
        } );
      } ),
      ] ).then( ( [
        settings,
        settingsDefaults,
      ] ) => {
        // Apply theme colors.
        api.darkMode.setThemeSource( getSetting( 'themeSource', settings, settingsDefaults ) ).then( () => {
          api.darkMode.getThemeSource().then( src => {
            setThemeSource( src );
          } );
        } );
      } );
  }, [] );

  // Initially set timeSlotSchema.
  useEffect( () => {
    api.timeSlots.schema().then( schema => {
      setTimeSlotSchema( schema );
    } );
  }, [] );

  // Initially load timeSlots.
  useEffect( () => {
    api.timeSlots.get().then( timeSlots => {
      timeSlots.sort( sortTimeSlotsCompare );
      setTimeSlots( timeSlots );
    } );
  }, [] );

  // Load timeSlots when dbPath settings got changed.
  useEffect( () => {
    api.timeSlots.get().then( timeSlots => {
      timeSlots.sort( sortTimeSlotsCompare );
      setTimeSlots( timeSlots );
    } );
  }, [getSetting( 'dbPath' )] );

  // Set timeSlotCurrent when timeSlots change.
  useEffect( () => {
    api.timeSlots.getCurrent().then( timeSlotCurrent => {
      setTimeSlotCurrent( timeSlotCurrent );
    } );
  }, [timeSlots] );

  return ! settingsDefaults ? null : <div
    className=''
    data-bs-theme={ themeSource }
  >
    <Context.Provider value={ {
      timeSlotSchema,
      timeSlots,
      setTimeSlots,

      timeSlotCurrent,
      timeSlotCurrentEdit,
      setTimeSlotCurrentEdit,

      themeSource,
      setThemeSource,
      settings,
      getSetting,
      setSettings,
      settingsDefaults,
    } }>
      <Settings/>

      <CreateTimeSlot/>

      <TimeSlotsTable/>

    </Context.Provider>
  </div>;
}

export default App;
