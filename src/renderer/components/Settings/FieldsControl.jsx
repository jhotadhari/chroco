import React, {
	useContext,
	useState,
	forwardRef,
	useRef,
	useEffect,
	createContext,
} from 'react';
import classnames from 'classnames';
import {
	get,
	isEqual,
	omit,
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
			...errors, 'Field key can\'t be empty',
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

const FieldDetails = () => {
	const { themeSource } = useContext( Context );

	const {
		selectedField,
		setSelectedField,
		selectedFieldIsDirty,
		saveSelectedField,
		selectedFieldValidErrors,
		isUpdating,
	} = useContext( FieldsControlContext );

	const typeOptions = [
		{
			value: 'text', label: 'Text',
		},
		{
			value: 'bool', label: 'Boolean',
		},
	];

	const selectedTypeOption = typeOptions.find( opt => opt.value === selectedField.type );

	return selectedField.required ? null : <div className='col'>
		<div
			className={ classnames( [
				'card h-100',
				selectedFieldIsDirty && 'border-success',
			] ) }
		>
			<div className="card-header">
				<label htmlFor={ selectedField.key + '-' + 'key' } className="form-label me-2">Field Key</label>
				<input
					type="text"
					id={ selectedField.key + '-' + 'key' }
					className={ classnames( [
						'form-control',
						'w-50 d-inline-block',
						! /^[a-zA-Z0-9]+$/.test( get( selectedField, 'newKey',  selectedField.key ) ) && 'invalid',
						selectedFieldIsDirty && 'dirty',
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
				<button
					className={ classnames( ['btn btn-close float-end'] ) }
					type="button"
					onClick={ () => setSelectedField( {} ) }
				>
				</button>
			</div>

			<div className="card-body">

				<div className='row'>
					<div className='col mb-3'>
						<label htmlFor={ selectedField.key + '-' + 'title' } className="form-label">Title Singular</label>
						{/* // ??? TODO maybe required */}
						<input
							className="form-control"
							id={ selectedField.key + '-' + 'title' }
							value={ get( selectedField, 'title', '' ) }
							onChange={ e => setSelectedField( {
								...selectedField,
								title: e.target.value,
							} ) }
						/>
					</div>
					<div className='col mb-3'>
						<label htmlFor={ selectedField.key + '-' + 'titlePlural' } className="form-label">Title Plural</label>
						<input
							className="form-control"
							id={ selectedField.key + '-' + 'titlePlural' }
							aria-describedby={ selectedField.key + '-' + 'titlePlural' + 'desc' }
							value={ get( selectedField, 'titlePlural', '' ) }
							onChange={ e => setSelectedField( {
								...selectedField,
								titlePlural: e.target.value,
							} ) }
						/>
						<div id={ selectedField.key + '-' + 'titlePlural' + 'desc' } className="form-text">Fallback to singular title.</div>
					</div>
				</div>

				<div className='row'>

					<div className="col mb-3">
						<label id={ selectedField.key + '-' + 'type' } className="form-label">Field Type</label>
						<MultiSelect
							labelledBy={ selectedField.key + '-' + 'type' }
							ClearSelectedIcon={ null }
							closeOnChangedValue={ true }
							className={ themeSource }
							hasSelectAll={ false }
							disableSearch={ true }
							options={ typeOptions }
							value={ selectedTypeOption ? [selectedTypeOption] : [] }
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
					</div>

					<div className='col'></div>

				</div>

				{/* ??? TODO default */}

				{/* ??? TODO default force */}

			</div>

			<div className="card-footer">
				<span className='float-end d-inline-flex align-items-center'>
					{ selectedFieldValidErrors.length > 0 && [...selectedFieldValidErrors].map( ( err, idx ) => <span key={ idx } className='text-danger'>{ err }</span> ) }
					{ selectedFieldIsDirty && 0 === selectedFieldValidErrors.length && ! isUpdating && <>Press <i className='mx-1'>Enter</i> to</> }
					{ isUpdating &&<span className="ms-1 d-inline-flex align-items-center">
						<div className="spinner-border spinner-border-sm ms-auto me-2" aria-hidden="true"></div>
						<span role="status">Updating...</span>
					</span> }
					<button
						className="btn btn-primary ms-2"
						disabled={ selectedFieldValidErrors.length > 0 || isUpdating || ! selectedFieldIsDirty }
						onClick={ () => {
							// ??? TODO check valid
							saveSelectedField();
						} }
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
		// timeSlotSchema,
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

	const fields = get( setting, 'value', settingsDefaults[settingKey], [] ).filter( field => field.key !== '_id' );

	const selectedFieldIsDirty = selectedField.key && ! isEqual( fields.find( f => f.key === selectedField.key ), selectedField );

	const [
		fieldsState, setFieldsState,
	] = useState( fields );
	const [
		isUpdating, setIsUpdating,
	] = useState( false );

	// Update fieldsState if fields have changed.
	useEffect( () => {
		setFieldsState( fields );
	}, [[...fields].map( f => JSON.stringify( f ) ).join( '' )] );

	const doUpdate = newVal => new Promise( ( resolve, reject ) => {
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
				resolve();
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
			isUpdating,
		} }
	>
		<div
			className={ classnames( [
				className,
				'fields-control',
			] ) }
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
						{ isUpdating &&<span className="ms-1 d-inline-flex align-items-center">
							<div className="spinner-border spinner-border-sm ms-2 me-3" aria-hidden="true"></div>
							<span className="ms-2" role="status">Updating...</span>
						</span> }

						<button
							className="btn float-end"
							title="Add new field"
							disabled={ isUpdating || ( selectedField.key && selectedFieldIsDirty ) }
						>
							<Icon type="plus" />
						</button>
					</div>
				</div>

				{ selectedField.key && <FieldDetails
					field={ fields.find( f => f.key === selectedField.key ) }
				/> }

				<div className='col-1'></div>

				{/* { difference( get( setting, 'value' ), settingsDefaults[settingKey] ).length > 0 && <div className="col">
					<button
						onClick={ () => doUpdate( settingsDefaults[settingKey] ) }
						type="button"
						className="btn btn-link border-0"
					>Reset</button>
				</div> } */}
			</div>
		</div>
	</FieldsControlContext.Provider> : null;
};

export default FieldsControl;
