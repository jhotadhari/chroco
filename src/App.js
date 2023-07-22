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
import TimeSlotsFilters from './Components/TimeSlotsFilters';
import { sortTimeSlotsCompare } from './utils';
import {
	stopTimeSlot,
} from "./Components/TimeSlot";

const { api } = window;


const eventTick = new Event( 'tick' );
setInterval( () => {
  window.dispatchEvent( eventTick );
}, 1000 );

function App() {
  const [appInfo,setAppInfo ] = useState( {} );
  const [settings, setSettings] = useState( [] );
  const [settingsDefaults, setSettingsDefaults] = useState( null );
  const [themeSource, setThemeSource] = useState( false );

  const [timeSlotSchema, setTimeSlotSchema] = useState( null );
  const [timeSlots, setTimeSlots] = useState( [] );
  const [timeSlotCurrent, setTimeSlotCurrent] = useState( null );
  const [timeSlotCurrentEdit, setTimeSlotCurrentEdit] = useState( null );

  const [fieldSuggestions, setFieldSuggestions] = useState( {} );

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

  // Initially set appInfo.
  useEffect( () => {
    api.app.getInfo().then( newAppInfo => {
      setAppInfo( newAppInfo );
    } );
  }, [] );

  // Load timeSlots when dbPath of filters settings got changed.
  useEffect( () => {
    if ( getSetting( 'filters' ) ) {
      api.timeSlots.get( getSetting( 'filters' ) ).then( timeSlots => {
        if ( timeSlots ) {
          console.log( 'debug timeSlots', timeSlots ); // debug
          timeSlots.sort( sortTimeSlotsCompare );
          setTimeSlots( timeSlots );
        }
      } ).catch( err => {

        console.log( 'debug err', err ); // debug

      } );
    }
  }, [getSetting( 'dbPath' ), getSetting( 'filters' )] );

  // Set timeSlotCurrent when timeSlots change.
  useEffect( () => {
    api.timeSlots.getCurrent().then( timeSlotCurrent => {
      setTimeSlotCurrent( timeSlotCurrent );
    } );
  }, [timeSlots] );


  const addFieldSuggestion = ( timeSlot, newFieldSuggestions, shouldSet ) => {
    newFieldSuggestions = newFieldSuggestions ? newFieldSuggestions : {...fieldSuggestions};
    shouldSet = undefined === shouldSet ? true : shouldSet;

    Object.keys( timeSlotSchema ).filter( field => get( timeSlotSchema[field], 'hasSuggestions' ) ).map( field => {
      const val = get( timeSlot, field );
      if ( val && val.length ) {
        if ( newFieldSuggestions[field] ) {
          if ( ! newFieldSuggestions[field].includes( val ) ) {
            newFieldSuggestions[field] = [
              ...newFieldSuggestions[field],
              val,
            ];
          }
        } else {
          newFieldSuggestions[field] = [val];
        }
      };
    } );
    if ( shouldSet ) {
      Object.keys( newFieldSuggestions ).map( key => newFieldSuggestions[key].sort() )
      setFieldSuggestions( newFieldSuggestions );
    }
    return newFieldSuggestions;
  }

  useEffect( () => {
    const newFieldSuggestions = { ...fieldSuggestions };
    [...timeSlots].map( timeSlot => {
      addFieldSuggestion( timeSlot, newFieldSuggestions, false );
    } );
    Object.keys( newFieldSuggestions ).map( key => newFieldSuggestions[key].sort() )
    setFieldSuggestions( newFieldSuggestions );
  }, [timeSlots] );

  return ! settingsDefaults ? null : <div
    data-bs-theme={ themeSource }
		onKeyDown={ e => {
      if (
        'Escape' === e.key
        && e.ctrlKey
        && get( timeSlotCurrent, '_id' )
      ) {
        stopTimeSlot( {
          timeSlot: timeSlotCurrent,
          timeSlots,
          setTimeSlots,
        } );
        setTimeSlotCurrentEdit( {} );
      }
    } }
    tabIndex="0"
  >
    <Context.Provider value={ {
      appInfo,

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

      fieldSuggestions,
      addFieldSuggestion,
    } }>
      <Settings/>

      <CreateTimeSlot/>

      <TimeSlotsFilters/>

      <TimeSlotsTable/>

    </Context.Provider>
  </div>;
}

export default App;
