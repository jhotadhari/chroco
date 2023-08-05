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

	return <div className='col'>
		<div
			className={ classnames( [
				'card h-100',
				selectedFieldIsDirty && 'border-success',
			] ) }
		>

			<div className="card-header">
				<span>
					Field Key: { selectedField.newKey || selectedField.key }
				</span>
				<button
					className={ classnames( ['btn btn-close float-end'] ) }
					type="button"
					// onClick={ () => setSelectedField( null ) }
					onClick={ () => setSelectedField( {} ) }
				>
				</button>
			</div>

			<div className="card-body">

				<div className='row'>
					<div className='col mb-3'>
						<label htmlFor={ selectedField.key + '-' + 'title' } className="form-label">Title Singular</label>
						{/* // ??? TODO onEscape */}
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
						{/* // ??? TODO onEscape */}
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


				{/* default */}


				{/* default force */}


				{/* ??? TODO check valid */}
				{/* ??? TODO check OnClick */}
				<span className='float-end'>
					{ selectedFieldIsDirty && <>
						Press <i>Enter</i> to
					</> }
					<button disabled={ ! selectedFieldIsDirty } className="btn btn-primary ms-1">Save</button></span>

			</div>
		</div>
	</div>;
};

const Field = forwardRef( ( {
	field,
	style,
	children,
}, ref ) => {

	const {
		selectedField,
		setSelectedField,
		selectedFieldIsDirty,
	} = useContext( FieldsControlContext );

	const value = get( selectedField, 'key' ) === field.key
		? get( selectedField, 'newKey',  selectedField.key )
		: field.key;

	const disabled = selectedField.key && selectedFieldIsDirty && selectedField.key !== field.key;

	// ??? TODO onEscape

	return <div
		ref={ ref }
		disabled={ disabled }
		className={ classnames( [
			'input-group',
			'position-relative',
			'sortable-item',
			disabled && 'opacity-25',
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

const SortableItem = ( {
	field,
	index,
} ) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		items,
	} = useSortable( { id: field.key } );

	const style = {
		transform: CSS.Transform.toString( transform ),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return <li
		style={ style }
		className={ items.length - 1 !== index ? 'mb-2' : '' }
	>
		<Field
			field={ field }
		>
			<span
				ref={ setNodeRef }
				{ ...listeners }
				{ ...attributes }
				className={ classnames( [
					'btn',
					'drag-handle',
					field.required ? 'disabled opacity-25' : 'border-light-subtle',
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

	useEffect( () => {
		setFieldsState( fields );
	}, [[...fields].map( f => f.key ).join( '' )] );

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
			doUpdate( newFields );
		}
	};

	return fieldsState && Array.isArray( fieldsState ) ? <FieldsControlContext.Provider
		value={ {
			selectedField,
			setSelectedField,
			selectedFieldIsDirty,
		} }
	>
		<div className={ className }>
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
								{ [...fieldsState].map( ( field, index ) => <SortableItem
									id={ field.key }
									key={ field.key }
									index={ index }
									field={ field }
									handle={ true }
								/> ) }
							</SortableContext>
						</ul>
					</DndContext>
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
