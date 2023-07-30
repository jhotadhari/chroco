import React, {
	useContext,
} from 'react';
import {
	get,
} from 'lodash';
import {
	MultiSelect,
} from 'react-multi-select-component';
import Context from '../../Context';
const { api } = window;

const ThemeControl = ( {className} ) => {
	const {
		setThemeSource,
		themeSource,
		settings,
		setSettings,
		settingsDefaults,
	} = useContext( Context );

	const settingKey = 'themeSource';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => sett.key && sett.key === settingKey ) : undefined;

	const options = [
		{
			value: 'system',	label: 'System',
		},
		{
			value: 'dark',	label: 'Dark',
		},
		{
			value: 'light',	label: 'Light',
		},
	];

	let value = get( setting, 'value' ) ? options.find( opt => opt.value === setting.value ) : undefined;
	value = value ? value : options.find( opt => opt.value === settingsDefaults[settingKey] );

	const doUpdate = newVal => {
		const updateFrontend = () => api.darkMode.setThemeSource( newVal ).then( () => {
			api.darkMode.getThemeSource().then( src => {
				setThemeSource( src );
			} );
		} );

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
				updateFrontend();

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
					updateFrontend();
				}
			} );
		}
	};

	return <div className={ className }>
		<label id={ 'setting-label-' + settingKey } className="form-label">Color Theme</label>
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

export default ThemeControl;
