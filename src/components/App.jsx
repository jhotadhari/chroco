import '../style/App.scss';
import {
	get,
} from 'lodash';
import {
	useEffect,
	useState,
	useContext,
} from 'react';
import Context from '../Context';
import useTimeSlotCrud from '../hooks/useTimeSlotCrud';
import Settings from './Settings/Settings';
import CreateTimeSlot from './CreateTimeSlot';
import TimeSlotsTable from './TimeSlotsTable';
import TimeSlotsFilters from './TimeSlotsFilters';
import {
	sortTimeSlotsCompare,
} from '../utils';
const { api } = window;

const eventTick = new Event( 'tick' );
setInterval( () => {
	window.dispatchEvent( eventTick );
}, 1000 );

const AppInner = () => {

	const {
		timeSlotCurrent,
		setTimeSlotCurrentEdit,
		themeSource,
	} = useContext( Context );

	const {stopTimeSlot} = useTimeSlotCrud();

	const [
		showSettings, setShowSettings,
	] = useState( false );

	useEffect( () => {
		api.app.onTogglePreferences( () => {
			setShowSettings( ! showSettings );
		} );
	}, [showSettings] );

	return <div
		data-bs-theme={ themeSource }
		onKeyDown={ e => {
			if (
				'Escape' === e.key
        && e.ctrlKey
        && get( timeSlotCurrent, '_id' )
			) {
				stopTimeSlot( {
					timeSlot: timeSlotCurrent,
				} );
				setTimeSlotCurrentEdit( {
				} );
			}
		} }
		tabIndex="0"
	>
		{ showSettings && <Settings
			showSettings={ showSettings }
			setShowSettings={ setShowSettings }
		/> }

		<CreateTimeSlot/>

		<TimeSlotsFilters/>

		<TimeSlotsTable/>
	</div>;
};

function App() {
	const [
		appInfo, setAppInfo,
	] = useState( {
	} );
	const [
		settings, setSettings,
	] = useState( [] );
	const [
		settingsDefaults, setSettingsDefaults,
	] = useState( null );
	const [
		themeSource, setThemeSource,
	] = useState( false );

	const [
		timeSlotSchema, setTimeSlotSchema,
	] = useState( null );
	const [
		timeSlots, setTimeSlots,
	] = useState( [] );
	const [
		timeSlotCurrent, setTimeSlotCurrent,
	] = useState( null );
	const [
		timeSlotCurrentEdit, setTimeSlotCurrentEdit,
	] = useState( null );

	const [
		fieldSuggestions, setFieldSuggestions,
	] = useState( {
	} );

	// Helper function to retrieve one setting value.
	const getSetting = ( key, _settings, _settingsDefaults ) => {
		let setting = ( _settings ? _settings : settings ).find( sett => get( sett, 'key' ) === key );
		return get( setting, 'value', get( _settingsDefaults ? _settingsDefaults : settingsDefaults, key ) );
	};

	// Initially set settings, settingsDefaults and apply theme colors.
	useEffect( () => {
		Promise.all( [
			// Get settings.
			new Promise( res => {
				api.settings.get().then( settings => {
					setSettings( settings );
					res( settings );
				} );
			} ),
			// Get settingsDefaults.
			new Promise( res => {
				api.settings.getDefaults().then( settingsDefaults => {
					setSettingsDefaults( settingsDefaults );
					res( settingsDefaults );
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

	// Load timeSlots when dbPath, startOfWeek or filters settings got changed.
	useEffect( () => {
		if ( getSetting( 'filters' ) ) {
			api.timeSlots.get( getSetting( 'filters' ) ).then( timeSlots => {
				if ( timeSlots ) {
					timeSlots.sort( sortTimeSlotsCompare );
					setTimeSlots( timeSlots );
				}
			} )
				.catch( err => {

					console.log( 'debug err', err ); // debug

				} );
		}
	}, [
		getSetting( 'dbPath' ), getSetting( 'filters' ), getSetting( 'startOfWeek' ),
	] );

	// Set timeSlotCurrent when timeSlots change.
	useEffect( () => {
		api.timeSlots.getCurrent().then( timeSlotCurrent => {
			setTimeSlotCurrent( timeSlotCurrent );
		} );
	}, [timeSlots] );

	const addFieldSuggestion = ( timeSlot, newFieldSuggestions, shouldSet ) => {
		newFieldSuggestions = newFieldSuggestions ? newFieldSuggestions : {
			...fieldSuggestions,
		};
		shouldSet = undefined === shouldSet ? true : shouldSet;

		Object.keys( timeSlotSchema ).filter( field => get( timeSlotSchema[field], 'hasSuggestions' ) )
			.map( field => {
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
				}
			} );
		if ( shouldSet ) {
			Object.keys( newFieldSuggestions ).map( key => newFieldSuggestions[key].sort() );
			setFieldSuggestions( newFieldSuggestions );
		}
		return newFieldSuggestions;
	};

	useEffect( () => {
		const newFieldSuggestions = {
			...fieldSuggestions,
		};
		[...timeSlots].map( timeSlot => {
			addFieldSuggestion( timeSlot, newFieldSuggestions, false );
		} );
		Object.keys( newFieldSuggestions ).map( key => newFieldSuggestions[key].sort() );
		setFieldSuggestions( newFieldSuggestions );
	}, [timeSlots] );

	return ! settingsDefaults ? null : <Context.Provider value={ {
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
		<AppInner/>
	</Context.Provider>;
}

export default App;
