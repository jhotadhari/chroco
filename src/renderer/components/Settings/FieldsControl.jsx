import React, {
	useContext,
	useState,
	forwardRef,
	useRef,
	useEffect,
	createContext,
} from 'react';
import classnames from 'classnames';
import { get } from 'lodash';
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

const FieldDetails = ( {
	field,
} ) => {
	const {
		themeSource,
	} = useContext( Context );

	const {
		selectedKey,
		setSelectedKey,
	} = useContext( FieldsControlContext );

	const typeOptions = [
		{ value: 'text', label: 'Text' },
		{ value: 'bool', label: 'Boolean' },
	];

	return <div className='col'>
		<div className='card h-100'>

			<div className="card-header">
				<span>
					{ field.key }
				</span>
				<button
					className={ classnames( ['btn btn-close float-end'] ) }
					type="button"
					onClick={ () => setSelectedKey( null ) }
				>
				</button>
			</div>

			<div className="card-body">

				<div className='row'>
					<div className='col mb-3'>
						<label htmlFor={ field.key + '-' + 'title' } className="form-label">Title Singular</label>
						<input
							className="form-control"
							id={ field.key + '-' + 'title' }
							value={ get( field, 'title', '' ) }
							onChange={ () => null }
						/>
					</div>
					<div className='col mb-3'>
						<label htmlFor={ field.key + '-' + 'title' } className="form-label">Title Plural</label>
						<input
							className="form-control"
							id={ field.key + '-' + 'titlePlural' }
							aria-describedby={ field.key + '-' + 'titlePlural' + 'desc' }
							value={ get( field, 'titlePlural', '' ) }
							onChange={ () => null }
						/>
						<div id={ field.key + '-' + 'titlePlural' + 'desc' } className="form-text">Fallback to singular title.</div>
					</div>
				</div>

				<div className='row'>

					<div className="col mb-3">
						<label id={ field.key + '-' + 'type' } className="form-label">Field Type</label>
						<MultiSelect
							labelledBy={ field.key + '-' + 'type' }
							ClearSelectedIcon={ null }
							closeOnChangedValue={ true }
							className={ themeSource }
							hasSelectAll={ false }
							disableSearch={ true }
							options={ typeOptions }
							value={ [typeOptions[0]] }
							onChange={ selectedOpt => null }
						/>
					</div>

					<div className='col'></div>

				</div>


				{/* default */}


				{/* default force */}


				<span className='float-end'>Press <i>Enter</i> to <button className="btn btn-primary ms-1">Save</button></span>

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
		selectedKey,
		setSelectedKey,
	} = useContext( FieldsControlContext );

	return <div
		ref={ ref }
		className={ classnames( [
			'input-group',
			'position-relative',
			'sortable-item',
			! selectedKey || selectedKey === field.key ? '' : 'opacity-25',
		] ) }
		style={ style }
	>
		{ children }

		<input
			type="text"
			className="form-control"
			placeholder="Field Title"
			value={ field.key }
			disabled={ field.required }
			onChange={ () => null }
			onFocus={ () => setSelectedKey( field.key ) }
		/>
		{/* <button
			className={ classnames( [
				'btn btn-outline-secondary',
				selectedKey === field.key ? 'text-body-emphasis' : '',
			] ) }
			type="button"
			disabled={ field.required }
			onClick={ () => selectedKey === field.key
				? setSelectedKey( null )
				: setSelectedKey( field.key )
			}
		>
			<Icon type="gear" />
		</button> */}
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
		selectedKey, setSelectedKey,
	] = useState( null );

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates } ),
	);

	const settingKey = 'fields';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => get( sett, 'key' ) === settingKey ) : undefined;

	const fields = get( setting, 'value', settingsDefaults[settingKey], [] ).filter( field => field.key !== '_id' );

	const [
		fieldsS, setFieldsS,
	] = useState( fields );

	useEffect( () => {
		setFieldsS( fields );
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
		const oldIndex = fieldsS.findIndex( field => field.key === active.id );
		const newIndex = fieldsS.findIndex( field => field.key === over.id );
		const newFieldsS = sortFields( arrayMove( fieldsS, oldIndex, newIndex ) );
		setFieldsS( newFieldsS );
	};

	const handleDragEnd = ( {
		active,
		over,
	} ) => {
		if ( active && over && active.id !== over.id ) {
			const oldIndex = fields.findIndex( field => field.key === active.id );
			const newIndex = fields.findIndex( field => field.key === over.id );
			const newFields = sortFields( arrayMove( fields, oldIndex, newIndex ) );
			setFieldsS( newFields );
			doUpdate( newFields );
		}
	};

	return fieldsS && Array.isArray( fieldsS ) ? <FieldsControlContext.Provider
		value={ {
			selectedKey,
			setSelectedKey,
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
								items={ fieldsS }
								strategy={ verticalListSortingStrategy }
							>
								{ [...fieldsS].map( ( field, index ) => <SortableItem
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

				{ selectedKey && <FieldDetails
					field={ fields.find( f => f.key === selectedKey ) }
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
