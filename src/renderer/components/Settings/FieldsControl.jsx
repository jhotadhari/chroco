import React, {
	useContext,
	useState,
	forwardRef,
	useRef,
	useEffect,
} from 'react';
import classnames from 'classnames';
import { get } from 'lodash';
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

const Field = forwardRef( ( {
	field,
	style,
	setSelectedKey,
	selectedKey,
	children,
}, ref ) => {

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
			value={ field.title }
			disabled={ field.required }
			onChange={ () => null }
		/>
		<button
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
		</button>
	</div>;
} );

const SortableItem = ( {
	field,
	setSelectedKey,
	selectedKey,
} ) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable( { id: field.key } );

	const style = {
		transform: CSS.Transform.toString( transform ),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return <li
		style={ style }
		className='pb-2'
	>
		<Field
			setSelectedKey={ setSelectedKey }
			selectedKey={ selectedKey }
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

	return fieldsS && Array.isArray( fieldsS ) ? <div className={ className }>
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
					<ul className="list-unstyled" ref={ ref }>

						<SortableContext
							items={ fieldsS }
							strategy={ verticalListSortingStrategy }
						>
							{ [...fieldsS].map( field => <SortableItem
								id={ field.key }
								key={ field.key }
								setSelectedKey={ setSelectedKey }
								selectedKey={ selectedKey }
								field={ field }
								handle={ true }
							/> ) }
						</SortableContext>
					</ul>
				</DndContext>
			</div>

			<div className='col-1'></div>
			{ selectedKey && <div className='col border rounded p-3'>
				{ selectedKey }

				<button
					className={ classnames( ['btn btn-close float-end'] ) }
					type="button"
					onClick={ () => setSelectedKey( null ) }
				>
				</button>

			</div> }
			<div className='col-1'></div>

			{/* { difference( get( setting, 'value' ), settingsDefaults[settingKey] ).length > 0 && <div className="col">
				<button
					onClick={ () => doUpdate( settingsDefaults[settingKey] ) }
					type="button"
					className="btn btn-link border-0"
				>Reset</button>
			</div> } */}
		</div>
	</div> : null;
};

export default FieldsControl;
