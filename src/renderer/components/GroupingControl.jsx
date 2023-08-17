import React, { useContext } from 'react';
import {
	// toString,
	get,
	omit,
} from 'lodash';
import { MultiSelect } from 'react-multi-select-component';
import classnames from 'classnames';
import Context from '../Context';
import Icon from './Icon.jsx';
// const { api } = window;


const ItemRenderer = ( {
	checked,
	option,
	onClick,
	disabled,
} ) => (
	<div
		title={ option.hint || '' }
		className={`item-renderer ${disabled ? "disabled" : ""}`}
	>
	  <input
		type="checkbox"
		onChange={onClick}
		checked={checked}
		tabIndex={-1}
		disabled={disabled}
	  />
	  <span>{option.label}</span>
	</div>
);

const GroupingControl = ( { className } ) => {
	const {
		themeSource,
		settings,
		setSettings,
		settingsDefaults,
		getSetting,
	} = useContext( Context );

	const settingKey = 'groups';
	const setting = settings && Array.isArray( settings ) ? settings.find( sett => sett.key && sett.key === settingKey ) : undefined;

	const groups = getSetting( 'groups' );

	const optionsAll = [
		{
			label: 'Start day',
			value: 'dateStartDay',
		},
		...getSetting( 'fields' ).filter( field => '_id' !== field.key && (
			'title' === field.key || ! field.required
		) ).map( field => ( {
			value: field.key,
			label: field.title,
		} ) ),
	];

	let optionKeysRemaining = [...optionsAll].map( o => o.value );
	[...groups].map( group => {
		if ( 'restFields' !== group.id ) {
			optionKeysRemaining = optionKeysRemaining.filter( okr => ! group.fields.includes( okr ) );

		}
	} )

    return <div
		className={ classnames( [
			'container-fluid mb-5',
			'timeSlots-groups',
		] ) }
	>
        <div className="row">
            <div className="col">
                { 'Group records' }
            </div>
        </div>
        <div className="row mt-2 flex-nowrap" >

            <div className="col-1"></div>

            { [...groups].map( group => {

				let selected;
				let options;
				if ( 'restFields' === group.id ) {
					options = [...optionsAll].map( o => ( {
						...o,
						disabled: true,
					} ) );
					selected = options.filter( o => optionKeysRemaining.includes( o.value ) );
				} else {
					options = [...optionsAll];
					selected = options.filter( o => group.fields.includes( o.value ) );
					if ( selected.find( s => 'dateStartDay' === s.value ) ) {
						// If dateStartDay is selected, nothing else can be selected.
						options = [...options].map( o => ( {
							...o,
							disabled: 'dateStartDay' !== o.value,
							hint: 'The last group must contain all remaining fields.'
						} ) );
					} else {
						// Fields selected in other groups should be disabled.
						options = [...options].map( o => {
							const disabled = ! optionKeysRemaining.includes( o.value ) && ! [...selected].map( s => s.value ).includes( o.value )
							return {
								...o,
								disabled,
								...( disabled && { hint: '"' + o.label + '" is already selected by another group' } ),
							}
						} );
					}
				}
				let label = [...selected].map( o => o.label ).join( ' + ' );

                const checked = true;

				// console.log( 'debug options', options ); // debug

				// ??? TODO onChange callbacks doUpdate
				// ??? TODO btn remove group
				// ??? TODO btn add group
				// ??? TODO enable dnd sorting

                return <div key={ group.id } className="col group">
                    <div className='card'>

                        <div className='d-flex align-items-center justify-content-between position-relative'>


                            <span
                                className={ classnames( [
                                    'btn',
                                    'border-0',
                                    'drag-handle',
                                    group.disabledDnd ? 'disabled opacity-25' : '',
                                ] ) }
                            >
                                <Icon type="grip-vertical" />
                            </span>

							<MultiSelect
								// labelledBy={ 'setting-label-' + settingKey }
								className={ classnames( [ themeSource, 'flex-grow-1' ] ) }
								hasSelectAll={ false }
								disableSearch={ true }
								ClearSelectedIcon={ null }
								options={ options }
								value={ selected }
								valueRenderer={ ( selected, _options ) => selected.length
									? ( 'restFields' === group.id
										? 'All remaining: '
										: ''
									) + selected.map( ( { label } ) => label ).join( ', ' )
									: 'No Fields Selected'
								}
								ItemRenderer={ ItemRenderer }
								onChange={ res => null }
							/>

                            <div className="form-check form-switch">
                                <input
                                    title={ 'Grouping by "' + label + '" is ' + ( checked
                                        ? 'enabled'
                                        : 'disabled'
                                    ) }
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={ checked }
                                    disabled={ parseInt( group.enabled, 10 ) > 1 }
                                    onChange={ () => {
                                    	// setShouldGroupDays( ! shouldGroupDays );
                                    } }
                                />
                            </div>

                        </div>

                        {/* <div className='card-body'>
                            { '???' }
                        </div> */}

                    </div>
                </div>
            } ) }

        </div>
    </div>;
};

export default GroupingControl;
