import React, {
    useContext,
    useState,
} from 'react';
import classnames from 'classnames';
import {
	difference,
	get,
} from 'lodash';

import {
	SortableContainer,
	SortableElement,
	sortableHandle,
} from 'react-sortable-hoc';
import { arrayMoveImmutable as arrayMove } from 'array-move';


// import { MultiSelect } from 'react-multi-select-component';
import Context from '../../Context';
import Icon from '../Icon.jsx';
const { api } = window;


const DragHandle = sortableHandle( ( {
    disabled,
} ) => <span
    className={ classnames( [
        'btn',
        'drag-handle',
        disabled ? 'disabled opacity-25' : 'border-light-subtle',
    ] ) }
>
<Icon
	type={ 'grip-horizontal' }
/></span> );


const SortableItem = SortableElement( ( {
    field,
	className,
    setSelectedKey,
    selectedKey,
} ) => <div
    className={ classnames( [
        'input-group',
        'z-3',
        className,
        ! selectedKey || selectedKey === field.key ? '' : 'opacity-25',
    ] ) }
>

    <DragHandle
        disabled={ field.required }
    />

    <input
        type="text"
        className="form-control"
        placeholder="Field Title"
        value={ field.title }
        disabled={ field.required }
    />
    <button
        className={classnames( [
            "btn btn-outline-secondary",
            selectedKey === field.key ? 'text-body-emphasis' : ''
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


</div> );



const SortableList = SortableContainer( ( {
	fields,
    setSelectedKey,
    selectedKey,
} ) => <div className="border border-1 rounded p-2">

    { [...fields].map( ( field, index ) => {

        return <SortableItem
            setSelectedKey={ setSelectedKey }
            selectedKey={ selectedKey }
            key={ field.key }
            index={ index }
            field={ field }
            disabled={ field.required }
            className={ index + 1 === fields.length ? '' : 'mb-2' }
        />
    } ) }



</div>);





const FieldsControl = ( { className } ) => {
	const {
		themeSource,
		settings,
		setSettings,
		timeSlotSchema,
		settingsDefaults,
	} = useContext( Context );

    const [selectedKey,setSelectedKey] = useState( null )

	const settingKey = 'fields';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => get( sett, 'key' ) === settingKey ) : undefined;

	const fields = get( setting, 'value', settingsDefaults[settingKey], [] ).filter( field => field.key !== '_id' );


    console.log( 'debug fields', fields ); // debug
	// const options = timeSlotSchema ? Object.keys( timeSlotSchema ).filter( key => key !== '_id' )
	// 	.map( key => ( {
	// 		value: key,
	// 		label: timeSlotSchema[key].title,
	// 		disabled: [
	// 			'title', 'dateStart', 'dateStop',
	// 		].includes( key ),
	// 	} ) ) : [];

	const doUpdate = newVal => {
        // newVal = [{
        //     key: '_id',
        // }, ...newVal];

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

	const onSortEnd = ( { oldIndex, newIndex } ) => {
        if ( ! get( fields[oldIndex], 'required' ) ) {
            const newFields = arrayMove( fields, oldIndex, newIndex );
            doUpdate( newFields );
        }
	};

	return fields && Array.isArray( fields ) ? <div className={ className }>
		<label id={ 'setting-label-' + settingKey } className="form-label">Fields</label>
		<div className="row">
			<div className="col-1"></div>
			<div className="col-13 position-relative">

                { selectedKey && <div
                    className='position-absolute z-3 w-100 h-100'
                />}

                <SortableList
                    fields={ fields }
                    onSortEnd={ onSortEnd }
                    setSelectedKey={ setSelectedKey }
                    selectedKey={ selectedKey }
                    useDragHandle={ true }
                />
            </div>

			<div className='col-1'></div>
			{ selectedKey && <div className='col border rounded p-3'>
                { selectedKey }


                <button
                    className={classnames( [
                        "btn btn-close float-end",
                    ] ) }
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
