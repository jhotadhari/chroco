import './style/App.scss';
import {
  useEffect,
  useState,
} from 'react';
import Context from './Context';
import Settings from './Components/Settings';
import { CreateTimeSlot } from './Components/CreateTimeSlot';
import { TimeSlotsTable } from './Components/TimeSlotsTable';
import { sortTimeSlotsCompare } from './utils';
const { api } = window;

const settingsDefaults = {
  themeSource: 'system',
  hideFields: [],
};

const eventTick = new Event( 'tick' );
setInterval( () => {
  window.dispatchEvent( eventTick );
}, 1000 );

function App() {
  const [settings, setSettings] = useState( [] );
  const [timeSlotSchema, setTimeSlotSchema] = useState( null );
  const [timeSlots, setTimeSlots] = useState( [] );
  const [timeSlotCurrent, setTimeSlotCurrent] = useState( null );
  const [timeSlotCurrentEdit, setTimeSlotCurrentEdit] = useState( null );
  const [themeSource, setThemeSource] = useState( false );

  // Helper function to retrieve one setting value.
  const getSetting = ( key, _settings ) => {
    let setting = ( _settings ? _settings : settings ).find( sett => sett.key && sett.key === key );
    return undefined !== setting && setting.value
      ? setting.value
      : ( settingsDefaults[key] ? settingsDefaults[key] : undefined )
  }

  // Initially set settings.
  useEffect( () => {
    api.settings.get().then( settings => {
      setSettings( settings );
      // Apply theme colors.
      api.darkMode.setThemeSource( getSetting( 'themeSource', settings ) ).then( () => {
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

  // Set timeSlotCurrent when timeSlots change.
  useEffect( () => {
    api.timeSlots.getCurrent().then( timeSlotCurrent => {
      setTimeSlotCurrent( timeSlotCurrent );
    } );
  }, [timeSlots] );

  return <div
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
