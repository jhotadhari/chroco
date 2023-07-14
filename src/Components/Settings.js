import {
  useState,
  useContext,
} from "react";
import {
	omit,
	get,
} from "lodash";
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
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => sett.key && sett.key === settingKey ) : undefined;

	const options = [
		{ value: 'system',	label: 'System' },
		{ value: 'dark',	label: 'Dark' },
		{ value: 'light',	label: 'Light' },
	];

	let value = setting && setting.value ? options.find( opt => opt.value === setting.value ) : undefined;
		value = value ? value : options.find( opt => opt.value === settingsDefaults[settingKey] );

	return <div className="mb-3">
		<label id={ 'setting-label-' + settingKey } className="form-label">Color Theme</label>
		<div className="row">
			<div className="col-1"></div>
			<div className="col-9">
				<MultiSelect
					labelledBy={ 'setting-label-' + settingKey }
					className={ themeSource }
					hasSelectAll={ false }
					disableSearch={ true }
					options={ options }
					value={ value ? [value] : [] }
					onChange={ res => {
						if ( 2 === res.length ) {
							// remove old value
							res = [...res].filter( sett => sett.value !== value.value )
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
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => sett.key && sett.key === settingKey ) : undefined;

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

const DbPathControl = () => {
	const {
		settings,
		setSettings,
	} = useContext( Context );

	const [errors,setErrors] = useState( [] );
	const [dbPathEdit,setDbPathEdit] = useState( {} );
	const [isCompacting,setIsCompacting] = useState( false );

	const settingKey = 'dbPath';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => sett.key && sett.key === settingKey ) : undefined;

	return <div className="mb-3">
		<label>Database paths</label>

		{ Object.keys( setting.value ).sort().sort( ( a, b ) => 'settings' === a ? -1 : 1 ).map( key => {
			const value = get( dbPathEdit, key, setting.value[key] )
			const isDirty = value !== get( setting.value, key );
			return <div key={ key } className="row mb-2">
				<div className="col-1"></div>
				<div className="col-3 d-flex align-items-center">
					<label
						id={ 'setting-label-' + settingKey + '-' + key }
						className="form-label mb-0"
					>
						{ key }
					</label>
				</div>
				<div className="col-10">
					<input
						onKeyDown={ e => isDirty && 'Escape' === e.key ? setDbPathEdit( omit( dbPathEdit, key ) ) : null }
						aria-labelledby={ 'setting-label-' + settingKey + '-' + key }
						style={ { width: '100%' } }
						className={ classnames( [
							isDirty ? 'dirty' : '',
							'form-control',
						] ) }
						disabled={ key === 'settings' }
						value={ value }
						onChange={ e => {
							if ( setting[key] === e.target.value ) {
								setDbPathEdit( omit( dbPathEdit, key ) );
							} else {
								setDbPathEdit( { ...dbPathEdit, [key]: e.target.value } );
							}
						} }
					/>
				</div>
			</div>;
		} ) }

		<div className="row">
			<div className="col-1"></div>
			<div className="col-13">
				<div className="d-flex justify-content-between">

					<button
						disabled={ ! Object.keys( dbPathEdit ).length }
						className='btn'
						type='button'
						onClick={ e => {
							if ( undefined === setting ) {
								// add new setting
								const newSetting = {
									key: settingKey,
									value: dbPathEdit,
								};
								api.settings.add( newSetting ).then( ( { addedSetting } ) => {
									setSettings( [...settings, addedSetting] );
									setErrors( [] );
									setDbPathEdit( {} );
								} ).catch( err => {
									setErrors( err.message.replace( /Error\sinvoking\sremote\smethod.*?':\s?/, '' ).split( '#####' ) );
								} );
							} else {
								// update setting
								const newSetting = {
									key: settingKey,
									...setting,
									value: {
										...setting.value,
										...dbPathEdit,
									},
								};
								api.settings.update( newSetting ).then( numberUpdated => {
									if ( numberUpdated ) {
										const newSettings = [...settings];
										const idx = newSettings.findIndex( sett => sett._id === setting._id );
										newSettings.splice( idx, 1, newSetting );
										setSettings( newSettings );
										setErrors( [] );
										setDbPathEdit( {} );
									}
								} ).catch( err => {
									setErrors( err.message.replace( /Error\sinvoking\sremote\smethod.*?':\s?/, '' ).split( '#####' ) );
								} );
							}
						} }
						>Apply db changes</button>

						<button
							className='btn'
							type='button'
							disabled={ isCompacting }
							onClick={ () => {
								setIsCompacting( true );
								api.db.compact().then( () => setIsCompacting( false ) ) ;
							} }
						>Compact db</button>
				</div>

				{ errors.length ? [...errors].map( ( err, idx ) => <div key={ idx } className={ classnames(
					'border',
					'border-danger',
					'p-3',
					'mt-3',
					'rounded',
				) }>{ err }</div> ) : '' }


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
			<DbPathControl/>
		</div> }

	</div>;
}

export default Settings;
