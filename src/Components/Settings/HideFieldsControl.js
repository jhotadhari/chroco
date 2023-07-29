import {
	useContext,
} from 'react';
import {
	difference,
	get,
} from 'lodash';
import {
	MultiSelect,
} from 'react-multi-select-component';
import Context from '../../Context';
const { api } = window;


const HideFieldsControl = ( {className} ) => {
	const {
		themeSource,
		settings,
		setSettings,
		timeSlotSchema,
		settingsDefaults,
	} = useContext( Context );

	const settingKey = 'hideFields';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => get( sett, 'key' ) === settingKey ) : undefined;

	const value = [...get( setting, 'value', settingsDefaults[settingKey] )].map( key => ( {
		value: key,
		label: timeSlotSchema ? get( timeSlotSchema, [
			key, 'title',
		] ) : '',
	} ) );

	const options = timeSlotSchema ? Object.keys( timeSlotSchema ).filter( key => key !== '_id' )
		.map( key => ( {
			value: key,
			label: timeSlotSchema[key].title,
			disabled: [
				'title', 'dateStart', 'dateStop',
			].includes( key ),
		} ) ) : [];

	const doUpdate = newVal => {
		if ( undefined === setting ) {
			// add new setting
			const newSetting = {
				key: settingKey,
				value: [...newVal].map( opt => opt.value ),
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
				value: [...newVal].map( opt => opt.value ),
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
		<label id={ 'setting-label-' + settingKey } className="form-label">Hide Fields</label>
		<div className="row">
			<div className="col-1"></div>
			<div className="col-9">
				<MultiSelect
					labelledBy={ 'setting-label-' + settingKey }
					className={ themeSource }
					hasSelectAll={ false }
					disableSearch={ true }
					options={ options }
					value={ value }
					onChange={ doUpdate }
				/>
			</div>

			{ difference( get( setting, 'value' ), settingsDefaults[settingKey] ).length > 0 && <div className="col">
				<button
					onClick={ () => doUpdate( settingsDefaults[settingKey] ) }
					type="button"
					className="btn btn-link border-0"
				>Reset</button>
			</div> }
		</div>
	</div>;
};

export default HideFieldsControl;
