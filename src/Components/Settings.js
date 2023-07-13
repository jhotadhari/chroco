import {
  useEffect,
  useState,
  useContext,
} from "react";
import classnames from "classnames";
import { MultiSelect } from "react-multi-select-component";
import Icon from "./Icon";
import Context from '../Context';
const { api } = window;

const ThemeControl = () => {
	const {
		setThemeSource,
		themeSource,
		settings,
		setSettings,
		settingsDefaults,
	} = useContext( Context );

	const settingKey = 'themeSource';
	const setting = settings.find( sett => sett.key && sett.key === settingKey );

	const options = [
		{ value: 'system',	label: 'System' },
		{ value: 'dark',	label: 'Dark' },
		{ value: 'light',	label: 'Light' },
	];

	let value = setting && setting.value ? options.find( opt => opt.value === setting.value ) : undefined;
		value = value ? value : options.find( opt => opt.value === settingsDefaults[settingKey] );

	return <div className="mb-3">
		<label id={ settingKey } className="form-label">Color Theme</label>
		<div className="row">
			<div className="col-1"></div>
			<div className="col-9">
				<MultiSelect
					labelledBy={ settingKey }
					className={ themeSource }
					hasSelectAll={ false }
					disableSearch={ true }
					options={ options }
					value={ value ? [value] : [] }
					onChange={ res => {
						if ( 2 === res.length ) {
							// remove old value
							res = [...res].filter( sett => sett.value !== setting.value )
						}
						if ( res.length < 0 || res.length > 1 ) {
							return;
						}

						const updateFrontend = () => api.darkMode.setThemeSource( res[0].value ).then( () => {
							api.darkMode.getThemeSource().then( src => {
								setThemeSource( src );
							} );
						} );

						if ( undefined === setting ) {
							// add new setting
							const newSetting = {
								key: settingKey,
								value: res[0].value,
							};
							api.settings.add( newSetting ).then( ( { addedSetting } ) => {
								setSettings( [...settings, addedSetting] );
								updateFrontend();

							} );
						} else {
							// update setting
							const newSetting = {
								...setting,
								value: res[0].value,
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
					} }
				/>
			</div>
		</div>
	</div>;
}

const HideFieldsControl = () => {
	const {
		themeSource,
		settings,
		setSettings,
		timeSlotSchema,
		settingsDefaults,
	} = useContext( Context );

	const settingKey = 'hideFields';
	const setting = settings.find( sett => sett.key && sett.key === settingKey );

	const value = [...( setting && setting.value ? setting.value : settingsDefaults[settingKey] )].map( key => ( {
		value: key,
		label: !! timeSlotSchema ? timeSlotSchema[key].title : '',
	} ) );

	const options = !! timeSlotSchema ? Object.keys( timeSlotSchema ).filter( key => key !== '_id').map( key => ( {
		value: key,
		label: timeSlotSchema[key].title,
		disabled: ['title','dateStart','dateStop'].includes( key ),
	} ) ) : [];

	return <div className="mb-3">
		<label id={ settingKey } className="form-label">Hide Fields</label>
		<div className="row">
			<div className="col-1"></div>
			<div className="col-9">
				<MultiSelect
					labelledBy={ settingKey }
					className={ themeSource }
					hasSelectAll={ false }
					disableSearch={ true }
					options={ options }
					value={ value }
					onChange={ res => {
						if ( undefined === setting ) {
							// add new setting
							const newSetting = {
								key: settingKey,
								value: [...res].map( opt => opt.value ),
							};
							api.settings.add( newSetting ).then( ( { addedSetting } ) => {
								setSettings( [...settings, addedSetting] );
							} );
						} else {
							// update setting
							const newSetting = {
								...setting,
								value: [...res].map( opt => opt.value ),
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
					} }
				/>
			</div>
		</div>
	</div>;
}

const Settings = () => {
	const [showSettings, setShowSettings] = useState( false );

	return <div className="settings container-fluid mt-2 mb-3">

		<div className="row mb-3">
			<div className="col">{ showSettings && <h3>Settings</h3> }</div>
			<div className="col d-flex justify-content-end">

				<button
					className='btn float-right'
					type='button'
					title={ showSettings ? 'Open Settings' : 'Close Settings' }
					onClick={ () => {
						setShowSettings( ! showSettings );
					} }
				>
					<Icon type='gear'/>
				</button>
			</div>
		</div>

		{ showSettings && <div className="settings pb-3 mb-4 border-bottom">
			<ThemeControl/>
			<HideFieldsControl/>
		</div> }

	</div>;
}

export default Settings;
