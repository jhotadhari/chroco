import {
  useState,
  useContext,
} from "react";
import {
	omit,
	get,
} from "lodash";
import classnames from "classnames";
import Context from '../../Context';
const { api } = window;

const DbPathControl = () => {
	const {
		settingsDefaults,
		settings,
		setSettings,
	} = useContext( Context );

	const [errors,setErrors] = useState( [] );
	const [dbPathEdit,setDbPathEdit] = useState( {} );
	const [isCompacting,setIsCompacting] = useState( false );

	const settingKey = 'dbPath';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => get( sett, 'key' ) === settingKey ) : undefined;
	const val = get( setting, 'value', settingsDefaults[settingKey] )

	return <div className="mb-3">
		<label>Database paths</label>

		{ Object.keys( val ).sort().sort( ( a, b ) => 'settings' === a ? -1 : 1 ).map( key => {
			const value = get( dbPathEdit, key, val[key] )
			const isDirty = value !== get( val, key );

			const doUpdate = newVal => {
				if ( setting && get( setting, key ) === newVal ) {
					setDbPathEdit( omit( dbPathEdit, key ) );
				} else {
					setDbPathEdit( { ...dbPathEdit, [key]: newVal } );
				}
			};

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
						onChange={ e => doUpdate( e.target.value ) }
					/>
				</div>

				{ value !== settingsDefaults[settingKey][key] && <div className="col">
					<button
						onClick={ () => doUpdate( settingsDefaults[settingKey][key] ) }
						type="button"
						className="btn btn-link border-0"
					>Reset</button>
				</div> }

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
									value: {
										...val,
										...dbPathEdit,
									}
								};
								api.settings.add( newSetting ).then( ( addedSetting ) => {
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

export default DbPathControl;
