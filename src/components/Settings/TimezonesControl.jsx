import {
	useState,
	useContext,
} from 'react';
import {
	difference,
	get,
} from 'lodash';
import classnames from 'classnames';
import Context from '../../Context';
import {
	isValidTimezones,
} from '../../utils';
const { api } = window;

const TimezonesControl = ( {className} ) => {
	const {
		settings,
		setSettings,
		settingsDefaults,
	} = useContext( Context );

	const [
		editState, setEditState,
	] = useState( false );

	const settingKey = 'timezones';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => sett.key && sett.key === settingKey ) : undefined;
	const value = editState ? editState : get( setting, 'value', settingsDefaults[settingKey] );
	const isDirty = !! editState;

	const doUpdate = newVal => {
		newVal = newVal.split( ',' ).filter( tz => tz.length > 0 );
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
		<label id={ 'setting-label-' + settingKey } className="form-label">Tooltip Timezones</label>
		<div className="row">
			<div className="col-1"></div>
			<div className="col-9">
				<input
					className={ classnames( [
						isDirty ? 'dirty' : '',
						'form-control',
					] ) }
					aria-labelledby={ 'setting-label-' + settingKey }
					style={ {
						width: '100%',
					} }
					value={ Array.isArray( value ) ? value.join( ',' ) : value }
					onChange={ e => {
						if ( isValidTimezones( e.target.value ) ) {
							doUpdate( e.target.value );
							setEditState( false );
						} else {
							setEditState( e.target.value.split( ',' ).filter( tz => tz.length > 0 ) );
						}
					} }
				/>
				<span
					className="d-block mt-2 font-style-italic"
				>Comma separated timezones.</span>
				<span
					className="d-block font-style-italic"
				>Example: UTC,America/Guatemala,Asia/Kolkata.</span>
			</div>

			{ difference( value, settingsDefaults[settingKey] ).length > 0 && <div className="col">
				<button
					onClick={ () => {
						doUpdate( settingsDefaults[settingKey].join( ',' ) );
						setEditState( false );
					} }
					type="button"
					className="btn btn-link border-0"
				>Reset</button>
			</div> }
		</div>
	</div>;
};

export default TimezonesControl;