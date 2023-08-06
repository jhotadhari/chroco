import React, {
	useContext,
	useState,
	forwardRef,
	useRef,
	useEffect,
	createContext,
} from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import classnames from 'classnames';
import {
	get,
	isEqual,
	omit,
	camelCase,
} from 'lodash';
import { MultiSelect } from 'react-multi-select-component';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import Context from '../../Context';
import Icon from '../Icon.jsx';
const { api } = window;

const FieldsControlContext = createContext( {} );

const getFieldValidErrors = selectedField => {
	let errors = [];
	if ( selectedField.hasOwnProperty( 'newKey' ) && ! selectedField.newKey.length ) {
		errors = [
			...errors, 'Field key can\'t be empty.',
		];
	}
	if ( ! get( selectedField, 'title', '' ).length ) {
		errors = [
			...errors, 'Field title is required.',
		];
	}
	return errors;
};

const sortFields = fields => {
	let index;
	index = fields.findIndex( field => field.key === 'title' );
	fields = arrayMove( fields, index, 0 );
	index = fields.findIndex( field => field.key === 'dateStart' );
	fields = arrayMove( fields, index, fields.length - 1 );
	index = fields.findIndex( field => field.key === 'dateStop' );
	fields = arrayMove( fields, index, fields.length - 1 );
	return fields;
};

const getDefaultField = () => {
	const key = ( Math.random() + 1 ).toString( 36 ).substring( 7 );
	return {
		key,
		type: 'text',
		title: camelCase( key ),
		titlePlural: '',
		hasSuggestions: false,
		useDefault: 0,
		default: '',
	};
};

const shouldUpdateKeysOptions = [
	{
		value: 'update', label: 'Update all records keys in database',
	},
	{
		value: 'noupdate', label: 'Don\'t update records keys in database',
	},
];

const typeOptions = [
	{
		value: 'text', label: 'Text',
	},
	{
		value: 'bool', label: 'Boolean',
	},
];

const suggestionsOptions = [
	{
		value: true, label: 'Provide suggestions',
	},
	{
		value: false, label: 'Don\'t provide suggestions',
	},
];

const useDefaultMarks = {
	0: 'Do not use a default value',
	1: 'Use default value for new records',
	2: 'Apply default value when restarting a record, regardless of given value',
};

const FieldDetails = ( {
	field,
	fieldsState,
	setFieldsState,
} ) => {
	const { themeSource } = useContext( Context );

	const {
		selectedField,
		setSelectedField,
		selectedFieldIsDirty,
		saveSelectedField,
		selectedFieldValidErrors,
		doUpdate,
		setIsUpdating,
		isUpdating,
		hasFocus,
		shouldUpdateKeys,
		setShouldUpdateKeys,
	} = useContext( FieldsControlContext );

	return selectedField.required ? null : <div className='col'>
		<div
			className={ classnames( [
				'card h-100',
				selectedFieldIsDirty && 'border-success',
			] ) }
		>
			<div className="card-header d-flex align-items-center flex-row-reverse justify-content-between">
				<button
					className={ classnames( ['btn btn-close float-end'] ) }
					type="button"
					onClick={ () => setSelectedField( {} ) }
				>
				</button>
				<div className='d-flex align-items-center'>

					<label htmlFor={ selectedField.key + '-' + 'key' } className="form-label me-2 mb-0 nowrap">Field Key</label>
					<input
						type="text"
						id={ selectedField.key + '-' + 'key' }
						className={ classnames( [
							'form-control',
							'w-50 d-inline-block me-2',
							! /^[a-zA-Z0-9]+$/.test( get( selectedField, 'newKey',  selectedField.key ) ) && 'invalid',
							selectedField.newKey && 'dirty',
						] ) }
						value={ get( selectedField, 'newKey',  selectedField.key ) }
						onChange={ e => {
							if ( /^[a-zA-Z0-9]*$/.test( e.target.value ) ) {
								if ( e.target.value === selectedField.key ) {
									setSelectedField( omit( selectedField, 'newKey' ) );
								} else {
									setSelectedField( {
										...selectedField,
										newKey: e.target.value,
									} );
								}
							}
						} }
					/>
					{ selectedField.newKey && <MultiSelect
						ClearSelectedIcon={ null }
						className={ classnames( [
							themeSource, 'w-50',
						] ) }
						hasSelectAll={ false }
						disableSearch={ true }
						options={ shouldUpdateKeysOptions }
						value={ [shouldUpdateKeysOptions.find( opt => opt.value === shouldUpdateKeys )] }
						onChange={ selectedOptions => {
							if ( selectedOptions.length ) {
								if ( selectedOptions.length === 2 ) {
									selectedOptions = selectedOptions.filter( opt => opt.value !== shouldUpdateKeys );
								}
								setShouldUpdateKeys( selectedOptions[0].value );
							}
						} }
					/> }
				</div>
			</div>

			<div className="card-body">

				<div className='row'>
					<div className='col-17 mb-3'>
						<label htmlFor={ selectedField.key + '-' + 'title' } className="form-label">Title Singular</label>
						<input
							className={ classnames( [
								'form-control',
								selectedField.title !== field.title && 'dirty',
								! selectedField.title.length && 'invalid',
							] ) }
							id={ selectedField.key + '-' + 'title' }
							aria-describedby={ selectedField.key + '-' + 'title' + '-desc' }
							value={ get( selectedField, 'title', '' ) }
							onChange={ e => setSelectedField( {
								...selectedField,
								title: e.target.value,
							} ) }
						/>
						<div id={ selectedField.key + '-' + 'title' + '-desc' } className="form-text">Required</div>
					</div>
					<div className='col-17 mb-3'>
						<label htmlFor={ selectedField.key + '-' + 'titlePlural' } className="form-label">Title Plural</label>
						<input
							className={ classnames( [
								'form-control',
								selectedField.titlePlural !== field.titlePlural && 'dirty',
							] ) }
							id={ selectedField.key + '-' + 'titlePlural' }
							aria-describedby={ selectedField.key + '-' + 'titlePlural' + '-desc' }
							value={ get( selectedField, 'titlePlural', '' ) }
							onChange={ e => setSelectedField( {
								...selectedField,
								titlePlural: e.target.value,
							} ) }
						/>
						<div id={ selectedField.key + '-' + 'titlePlural' + '-desc' } className="form-text">Fallback to singular title</div>
					</div>

					<div className="col-17 mb-3">
						<label id={ selectedField.key + '-' + 'type' } className="form-label">Type</label>
						<MultiSelect
							labelledBy={ selectedField.key + '-' + 'type' }
							ClearSelectedIcon={ null }
							closeOnChangedValue={ true }
							className={ classnames( [
								themeSource,
								'border rounded',
								selectedField.type !== field.type && 'border-success',
							] ) }
							hasSelectAll={ false }
							disableSearch={ true }
							options={ typeOptions }
							value={ [typeOptions.find( opt => opt.value === selectedField.type ) || typeOptions[0]] }
							onChange={ selectedOptions => {
								if ( selectedOptions.length ) {
									if ( selectedOptions.length === 2 ) {
										selectedOptions = selectedOptions.filter( opt => opt.value !== selectedField.type );
									}
									setSelectedField( {
										...selectedField,
										type: selectedOptions[0].value,
									} );
								}
							} }
						/>
						<div id={ selectedField.key + '-' + 'type' + '-desc' } className="form-text">Required</div>
					</div>

					<div className='col-17 mb-3'>
						{ 'text' === selectedField.type && <>
							<label id={ selectedField.key + '-' + 'type' } className="form-label">Suggestions</label>
							<MultiSelect
								labelledBy={ selectedField.key + '-' + 'type' }
								aria-describedby={ selectedField.key + '-' + 'hasSuggestions' + '-desc' }
								ClearSelectedIcon={ null }
								closeOnChangedValue={ true }
								className={ classnames( [
									themeSource,
									'border rounded',
									selectedField.hasSuggestions !== field.hasSuggestions && 'border-success',
								] ) }
								hasSelectAll={ false }
								disableSearch={ true }
								options={ suggestionsOptions }
								value={ [suggestionsOptions.find( opt => opt.value === selectedField.hasSuggestions ) || suggestionsOptions[0]] }
								onChange={ selectedOptions => {
									if ( selectedOptions.length ) {
										if ( selectedOptions.length === 2 ) {
											selectedOptions = selectedOptions.filter( opt => opt.value !== selectedField.hasSuggestions );
										}
										setSelectedField( {
											...selectedField,
											hasSuggestions: selectedOptions[0].value,
										} );
									}
								} }
							/>
							<div id={ selectedField.key + '-' + 'hasSuggestions' + '-desc' } className="form-text">Whether to show suggestions while typing</div>
						</> }
					</div>

					<div className="col-17 mb-3">
						<label id={ selectedField.key + '-' + 'useDefault' } className="form-label">Use default value</label>
						<div className='px-2'>
							<Slider
								className={ classnames( [
									themeSource,
									selectedField.useDefault !== field.useDefault && 'dirty',
								] ) }
								min={ 0 }
								max={ 2 }
								marks={ useDefaultMarks }
								step={ 1 }
								value={ get( selectedField, 'useDefault', 0 ) }
								onChange={ newValue => setSelectedField( {
									...selectedField,
									useDefault: newValue,
								} ) }
								defaultValue={ 0 }
							/>
						</div>
						<div
							id={ selectedField.key + '-' + 'useDefault' + '-desc' }
							className='form-text useDefault-desc'
						>{ useDefaultMarks[get( selectedField, 'useDefault', 0 )] }</div>
					</div>

					<div className='col-17 mb-3'>
						{ '0' != get( selectedField, 'useDefault', '0' ) && <>
							<label htmlFor={ selectedField.key + '-' + 'default' } className="form-label">Default value</label>

							{ 'text' === selectedField.type && <>
								<input
									className={ classnames( [
										'form-control',
										selectedField.default !== field.default && 'dirty',
									] ) }
									id={ selectedField.key + '-' + 'default' }
									value={ get( selectedField, 'default', '' ) }
									onChange={ e => setSelectedField( {
										...selectedField,
										default: e.target.value,
									} ) }
								/>
							</> }

							{ 'bool' === selectedField.type && <>
								<div className="form-check form-switch">
									<input
										title={ 'Default value' }
										id={ selectedField.key + '-' + 'default' }
										className={ classnames( [
											'form-check-input',
											selectedField.default !== field.default && 'dirty',
										] ) }
										type="checkbox"
										role="switch"
										checked={ get( selectedField, 'default', '0' ) !== '0' }
										onChange={ () => setSelectedField( {
											...selectedField,
											default: get( selectedField, 'default', '0' ) === '0' ? '1' : '0',
										} ) }
									/>
								</div>
								<div
									id={ selectedField.key + '-' + 'default' + '-desc' }
									className={ classnames( [
										'form-text',
										'default' + '-desc',
										'type-bool',
									] ) }
								>{ get( selectedField, 'default', '0' ) === '0'
										? <>The field is initially <i>off</i></>
										: <>The field is initially <i>on</i></>
									}</div>

							</> }

						</> }
					</div>
				</div>
			</div>

			<div className="card-footer">
				<span className='d-flex align-items-center justify-content-between'>
					<button
						className="btn me-2 btn-outline-danger"
						title="Delete field"
						disabled={ isUpdating }
						onClick={ () => {
							const newFields = fieldsState.filter( f => f.key !== selectedField.key );
							setFieldsState( newFields );
							setIsUpdating( true );
							doUpdate( newFields ).then( () => {
								setIsUpdating( false );
								setSelectedField( {} );
							} );
						} }
					>
						Delete
					</button>

					<span className='flex-grow-1'></span>

					{ selectedFieldValidErrors.length > 0 && <span className='text-danger'>{ selectedFieldValidErrors.join( ' ' ) }</span> }
					{ selectedFieldIsDirty && 0 === selectedFieldValidErrors.length && ! isUpdating && hasFocus && <>Press <i className='mx-1'>Enter</i> to</> }
					{ isUpdating &&<span className="ms-1 d-inline-flex align-items-center">
						<div className="spinner-border spinner-border-sm ms-auto me-2" aria-hidden="true"></div>
						<span role="status">Updating...</span>
					</span> }
					<button
						className="btn btn-primary ms-2"
						disabled={ selectedFieldValidErrors.length > 0 || isUpdating || ! selectedFieldIsDirty }
						onClick={ saveSelectedField }
					>
						Save
					</button>
				</span>
			</div>

		</div>
	</div>;
};

const Field = forwardRef( ( {
	field,
	style,
	children,
	disabled,
}, ref ) => {

	const {
		selectedField,
		setSelectedField,
		selectedFieldIsDirty,
	} = useContext( FieldsControlContext );

	const value = get( selectedField, 'key' ) === field.key
		? get( selectedField, 'newKey',  selectedField.key )
		: field.key;

	return <div
		ref={ ref }
		disabled={ disabled }
		className={ classnames( [
			'field',
			'input-group',
			'position-relative',
			'sortable-item',
			disabled && 'opacity-25',
			get( selectedField, 'key' ) === field.key && 'highlight',
		] ) }
		style={ style }
	>
		{ children }

		<input
			type="text"
			className={ classnames( [
				'form-control',
				! /^[a-zA-Z0-9]+$/.test( value ) && 'invalid',
				selectedFieldIsDirty && 'dirty',
			] ) }
			value={ value }
			disabled={ disabled || field.required }
			onChange={ e => {
				if ( /^[a-zA-Z0-9]*$/.test( e.target.value ) ) {
					if ( e.target.value === selectedField.key ) {
						setSelectedField( omit( selectedField, 'newKey' ) );
					} else {
						setSelectedField( {
							...selectedField,
							newKey: e.target.value,
						} );
					}
				}
			} }
			onFocus={ () => get( selectedField, 'key' ) !== field.key && setSelectedField( { ...field } ) }
		/>
	</div>;
} );

const SortableItem = ( { field } ) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		items,
	} = useSortable( { id: field.key } );

	const {
		selectedField,
		selectedFieldIsDirty,
	} = useContext( FieldsControlContext );

	const style = {
		transform: CSS.Transform.toString( transform ),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const disabled = selectedField.key && selectedFieldIsDirty && selectedField.key !== field.key;

	return <li
		style={ style }
		className="mb-2"
	>
		<Field
			field={ field }
			disabled={ disabled }
		>
			<span
				ref={ setNodeRef }
				{ ...listeners }
				{ ...attributes }
				className={ classnames( [
					'btn',
					'drag-handle',
					field.required ? 'disabled opacity-25' : (
						selectedField.key && selectedFieldIsDirty && selectedField.key === field.key
							? 'border-success'
							: ''
					),
					disabled && 'disabled',
				] ) }
			>
				<Icon type="grip-horizontal" />
			</span>
		</Field>
	</li>;
};

const FieldsControl = ( { className } ) => {
	const {
		// themeSource,
		settings,
		setSettings,
		settingsDefaults,
	} = useContext( Context );

	const ref = useRef( null );

	const [
		selectedField, setSelectedField,
	] = useState( {} );

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates } ),
	);

	const settingKey = 'fields';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => get( sett, 'key' ) === settingKey ) : undefined;

	let fields = get( setting, 'value', settingsDefaults[settingKey], [] ).filter( field => field.key !== '_id' );

	const selectedFieldIsDirty = selectedField.key && ! isEqual( fields.find( f => f.key === selectedField.key ), selectedField );

	const [
		shouldUpdateKeys, setShouldUpdateKeys,
	] = useState( 'update' );
	const [
		fieldsState, setFieldsState,
	] = useState( fields );
	const [
		isUpdating, setIsUpdating,
	] = useState( false );
	const [
		hasFocus, setHasFocus,
	] = useState( false );

	// Update fieldsState if fields have changed.
	useEffect( () => {
		setFieldsState( fields );
	}, [[...fields].map( f => JSON.stringify( f ) ).join( '' )] );

	const doUpdate = newVal => new Promise( ( resolve, reject ) => {
		const options = {};
		if ( selectedField.newKey && shouldUpdateKeys ) {
			options.shouldUpdateKeys = {
				oldKey: selectedField.key,
				newKey: selectedField.newKey,
			};
		}
		if ( undefined === setting ) {
			// add new setting
			const newSetting = {
				key: settingKey,
				value: newVal,
			};
			api.settings.add( newSetting, options ).then( ( addedSetting ) => {
				setSettings( [
					...settings, addedSetting,
				] );
				resolve();
			} );
		} else {
			// update setting
			const newSetting = {
				...setting,
				value: newVal,
			};
			api.settings.update( newSetting, options ).then( numberUpdated => {
				if ( numberUpdated ) {
					const newSettings = [...settings];
					const idx = newSettings.findIndex( sett => sett._id === setting._id );
					newSettings.splice( idx, 1, newSetting );
					setSettings( newSettings );
					resolve();
				}
			} );
		}
	} );

	const saveSelectedField = () => {
		if ( selectedField.key ) {
			let {
				newKey, ...newField
			} = selectedField;
			const index = fieldsState.findIndex( field => field.key === newField.key );
			newField.key = newKey || newField.key;
			if ( -1 !== index ) {
				const newFields = [...fieldsState];
				newFields[index] = newField;
				setIsUpdating( true );
				doUpdate( newFields ).then( () => {
					setSelectedField( { ...newField } );
					setIsUpdating( false );
			 	} );
			}
		}
	};

	const handleDragOver = ( {
		active,
		over,
	} ) => {
		const oldIndex = fieldsState.findIndex( field => field.key === active.id );
		const newIndex = fieldsState.findIndex( field => field.key === over.id );
		const newFieldsState = sortFields( arrayMove( fieldsState, oldIndex, newIndex ) );
		setFieldsState( newFieldsState );
	};

	const handleDragEnd = ( {
		active,
		over,
	} ) => {
		if ( active && over && active.id !== over.id ) {
			const oldIndex = fields.findIndex( field => field.key === active.id );
			const newIndex = fields.findIndex( field => field.key === over.id );
			const newFields = sortFields( arrayMove( fields, oldIndex, newIndex ) );
			setFieldsState( newFields );
			setIsUpdating( true );
			doUpdate( newFields ).then( () => {
				setIsUpdating( false );
			} );
		}
	};

	const selectedFieldValidErrors = getFieldValidErrors( selectedField );

	return fieldsState && Array.isArray( fieldsState ) ? <FieldsControlContext.Provider
		value={ {
			selectedField,
			setSelectedField,
			selectedFieldValidErrors,
			selectedFieldIsDirty,
			saveSelectedField,
			doUpdate,
			setIsUpdating,
			isUpdating,
			hasFocus,
			shouldUpdateKeys,
			setShouldUpdateKeys,
		} }
	>
		<div
			className={ classnames( [
				className,
				'fields-control',
				'outline-none',
			] ) }
			onFocus={ () => setHasFocus( true ) }
			onBlur={ () => setHasFocus( false ) }
			onKeyDown={ e => {
				if (
					'Enter' === e.key
					&& selectedField.key
					&& 0 === selectedFieldValidErrors.length
				) {
					saveSelectedField();
				}
				if ( 'Escape' === e.key && selectedField.key ) {
					if ( selectedFieldIsDirty ) {
						setSelectedField( { ...fields.find( f => f.key === selectedField.key ) } );
					} else {
						setSelectedField( {} );
					}
				}
			} }
			tabIndex="0"
		>
			<label id={ 'setting-label-' + settingKey } className="form-label">Fields</label>
			<div className="row">
				<div className="col-1"></div>
				<div className="col-13 position-relative">
					<DndContext
						sensors={ sensors }
						collisionDetection={ closestCenter }
						onDragEnd={ handleDragEnd }
						onDragOver={ handleDragOver }
					>
						<ul className="list-unstyled mb-0" ref={ ref }>
							<SortableContext
								items={ fieldsState }
								strategy={ verticalListSortingStrategy }
							>
								{ [...fieldsState].map( field => <SortableItem
									id={ field.key }
									key={ field.key }
									// index={ index }
									field={ field }
									handle={ true }
								/> ) }
							</SortableContext>
						</ul>
					</DndContext>

					<div className="w-100">

						{ ! isEqual(
							[
								settingsDefaults[settingKey].find( f => f.key === '_id' ), ...fields,
							],
							settingsDefaults[settingKey],
						) && <button
						// { [...fields].map( f => JSON.stringify( f ) ).join( '' ) != [...settingsDefaults[settingKey]].map( f => JSON.stringify( f ) ).join( '' ) && <button
						// { ! isEqual( fields, settingsDefaults[settingKey] ) && <button
							onClick={ () => {
								setSelectedField( {} );
								doUpdate( settingsDefaults[settingKey] );
							} }
							type="button"
							className="btn btn-link border-0"
						>Reset</button> }

						{ isUpdating &&<span className="ms-1 d-inline-flex align-items-center">
							<div className="spinner-border spinner-border-sm ms-2 me-3" aria-hidden="true"></div>
							<span className="ms-2" role="status">Updating...</span>
						</span> }

						<button
							className="btn float-end"
							title="Add new field"
							disabled={ isUpdating || ( selectedField.key && selectedFieldIsDirty ) }
							onClick={ () => {
								const newField = getDefaultField();
								const newFields = sortFields( [
									...fieldsState, newField,
								] );
								setFieldsState( newFields );
								setIsUpdating( true );
								doUpdate( newFields ).then( () => {
									setIsUpdating( false );
									setSelectedField( { ...newField } );
								} );
							} }
						>
							Add Field
						</button>
					</div>
				</div>

				{ selectedField.key && <FieldDetails
					field={ fields.find( f => f.key === selectedField.key ) }
					fieldsState={ fieldsState }
					setFieldsState={ setFieldsState }
				/> }

				<div className='col-1'></div>

			</div>
		</div>
	</FieldsControlContext.Provider> : null;
};

export default FieldsControl;
