import {
	useContext,
} from 'react';
import {
	toString,
	difference,
	get,
} from 'lodash';
import {
	MultiSelect,
} from 'react-multi-select-component';
import Context from '../../Context';
const { api } = window;


const StartOfWeekControl = ( {className} ) => {
	const {
		themeSource,
		settings,
		setSettings,
		settingsDefaults,
	} = useContext( Context );

	const settingKey = 'startOfWeek';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => sett.key && sett.key === settingKey ) : undefined;

	const options = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	].map( ( label, valueInt ) => ( {
		value: toString( valueInt ), label,
	} ) );


	console.log( 'debug options', options ); // debug
	let value = get( setting, 'value' ) ? options.find( opt => opt.value === setting.value ) : undefined;
	value = value ? value : options.find( opt => opt.value === settingsDefaults[settingKey] );
	console.log( 'debug value', value ); // debug

	const doUpdate = newVal => {

		if ( undefined === setting ) {
			// add new setting
			const newSetting = {
				key: settingKey,
				value: newVal,
			};
			api.settings.add( newSetting ).then( ( addedSetting ) => {
				setSettings( [
					...settings, addedSetting,
				] );

			} );
		} else {
			// update setting
			const newSetting = {
				...setting,
				value: newVal,
			};
			api.settings.update( newSetting ).then( numberUpdated => {
				if ( numberUpdated ) {
					const newSettings = [...settings];
					const idx = newSettings.findIndex( sett => sett._id === setting._id );
					newSettings.splice( idx, 1, newSetting );
					setSettings( newSettings );
				}
			} );
		}
	};

	return <div className={ className }>
		<label id={ 'setting-label-' + settingKey } className="form-label">Week starts on</label>
		<div className="row">
			<div className="col-1"></div>
			<div className="col-9">
				<MultiSelect
					labelledBy={ 'setting-label-' + settingKey }
					className={ themeSource }
					hasSelectAll={ false }
					disableSearch={ true }
					ClearSelectedIcon={ null }
					options={ options }
					value={ value ? [value] : [] }
					onChange={ res => {
						if ( 2 === res.length ) {
							// remove old value
							res = [...res].filter( sett => sett.value !== value.value );
						}
						if ( 1 !== res.length ) {
							return;
						}
						doUpdate( res[0].value );
					} }
				/>
			</div>

			{ value.value !== settingsDefaults[settingKey] && <div className="col">
				<button
					onClick={ () => doUpdate( settingsDefaults[settingKey] ) }
					type="button"
					className="btn btn-link border-0"
				>Reset</button>
			</div> }

		</div>
	</div>;
};

export default StartOfWeekControl;
