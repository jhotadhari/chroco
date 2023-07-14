import classnames from "classnames";
import dayjs from "dayjs";
import {
  get,
  isObject,
} from "lodash";
import {
  useState,
  useContext,
  useEffect,
  // useEffect,
  // useRef
} from "react";
import Icon from "./Icon";
import Context from '../Context';
import { formatSeconds } from '../utils';
const { api } = window;

const isValidDateInput = dateInputString => {
  const regex = /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-2][0-9]):([0-5][0-9]):([0-5][0-9])/;
  if ( ! regex.test( dateInputString ) ) {
    return false;
  }
  const dateParsed = regex.exec( dateInputString );
  if (
    7 !== dateParsed.length
    || parseInt( dateParsed[2], 10 ) > 12   // month
    || parseInt( dateParsed[3], 10 ) > 31   // day
    || parseInt( dateParsed[4], 10 ) > 23   // hour
    || parseInt( dateParsed[5], 10 ) > 59   // minute
    || parseInt( dateParsed[6], 10 ) > 59   // second
  ) {
    return false;
  }
  return true;
};

export const Duration = ( {
  timeSlot,
  editTimeSlot,
} ) => {

  const start = get( editTimeSlot, 'dateStart', get( timeSlot, 'dateStart' ) );
  const stop = get( editTimeSlot, 'dateStop', get( timeSlot, 'dateStop' ) );
  const isDirty =
       ( get( editTimeSlot, 'dateStart', get( timeSlot, 'dateStart' ) ) !== get( timeSlot, 'dateStart' ) )
    || ( get( editTimeSlot, 'dateStop', get( timeSlot, 'dateStop' ) ) !== get( timeSlot, 'dateStop' ) );

	const [intervalID, setIntervalID] = useState( null );
	const [tick, setTick] = useState( false );
	const shouldTick = ! stop;
	useEffect( () => {
    let iid = false
    const clear = () => {
      if ( ! shouldTick ) {
        clearInterval( intervalID );
        setIntervalID( false );
      }
      clearInterval( iid );
    }
		if ( shouldTick ) {
			if ( ! intervalID ) {
				iid = setInterval( () => {
					setTick( Math.random() );
				}, 1000 );
				setIntervalID( iid );
			}
		} else {
      if ( intervalID ) {
        clear()
      }
		}
		return clear;
	}, [shouldTick] );

  const _stop = stop ? stop : dayjs();
  const seconds = start && _stop
    ? dayjs( _stop ).diff( dayjs( start ), 'second' )
    : false;

  return <div
    className={ classnames( {
      "timeSlot--duration": true,
      "text-end": true,
      'align-middle': true,
      'bg-transparent': true,
      'col-3': true,
      'd-flex': true,
      'justify-content-end': true,
    } ) }
    >
    <span
      className={ classnames( {
        invalid: seconds < 0,
        'p-2': true,
        'dirty': isDirty,
      } ) }
    >
      { false !== seconds
        ? formatSeconds( seconds )
        : '- m' }
    </span>
  </div>;
};

export const DateInput = ( {
  field,
  timeSlot,
  updateTimeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const {
    timeSlotSchema,
    timeSlots,
    setTimeSlots,
   } = useContext( Context );
  const [tempVal, setTempVal] = useState( false );
  const format = 'YYYY-MM-DD HH:mm:ss';
  const val = get( timeSlot, field )
    ? dayjs( get( editTimeSlot, field, get( timeSlot, field ) ) ).format( format )
    : '';
  const isDirty = tempVal || ( get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field ) );
  const title = get( timeSlotSchema, [field,'title'], '' );

  return <input
      onKeyDown={ e => {
        if ( isDirty ) {
          switch( e.key ) {
            case 'Enter':
              updateTimeSlot( {
                timeSlot,
                timeSlots,
                setTimeSlots,
                editTimeSlot,
                setEditTimeSlot,
                // includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
              } );
              break;
            case 'Escape':
              const newEditTimeSlot = {...editTimeSlot}
              delete newEditTimeSlot[field];
              setEditTimeSlot( newEditTimeSlot );
              break;
          }
        }
      } }
      className={ classnames( {
        'form-control': true,
        'dirty': isDirty,
        'invalid': tempVal && ! isValidDateInput( tempVal ),
      } ) }
      type="text"
      disabled={ ! timeSlot[field] }
      onBlur={ () => {
        if ( tempVal && isValidDateInput( tempVal ) ) {
          setTempVal( false );
        }
      } }
      onChange={ ( e ) => {
        setTempVal( e.target.value );
        if ( isValidDateInput( e.target.value ) ) {
          setEditTimeSlot( {
            ...editTimeSlot,
            [field]: dayjs( e.target.value ).valueOf(),
          } );
        }
      } }
      value={ tempVal
        ? tempVal
        : val
      }
      title={ title }
      placeholder={ format }
    />;
};

export const Input = ( {
  field,
  useDefault,
  timeSlot,
  updateTimeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const {
    timeSlotSchema,
    setTimeSlots,
    timeSlots,
   } = useContext( Context );
  const title = get( timeSlotSchema, [field,'title'], '' );
  const defaultVal = useDefault ? get( timeSlotSchema, [field, 'default'], '' ) : '';
  const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );
  const value = get( editTimeSlot, field, get( timeSlot, field, defaultVal ) );

  return <input
      onKeyDown={ e => {
        if ( isDirty ) {
          switch( e.key ) {
            case 'Enter':
              updateTimeSlot( {
                  timeSlot,
                  timeSlots,
                  setTimeSlots,
                  editTimeSlot,
                  setEditTimeSlot,
                  // includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
              } );
              break;
            case 'Escape':
              const newEditTimeSlot = {...editTimeSlot}
              delete newEditTimeSlot[field];
              setEditTimeSlot( newEditTimeSlot );
              break;
          }
        }
      } }
      className={ classnames( {
        'form-control': true,
        'dirty': isDirty,
      } ) }
      type="text"
      onChange={ ( e ) => {
        setEditTimeSlot( { ...editTimeSlot, [field]: e.target.value } );
      } }
      value={ value }
      title={ title }
      placeholder={ title }
    />;
};





export const deleteTimeSlot = ( {
  deleteId,
  timeSlots,
  setTimeSlots,
} ) => {
  api.timeSlots.delete( deleteId ).then( numberDeleted => {
    if ( numberDeleted ) {
      const newTimeSlots = [...timeSlots];
      const idx = newTimeSlots.findIndex( ts => ts._id === deleteId );
      newTimeSlots.splice( idx, 1 );
      setTimeSlots( newTimeSlots );
    }
  } );
};

export const stopTimeSlot = ( {
  timeSlot,
  timeSlots,
  setTimeSlots,
} ) => {
  api.timeSlots.stop( timeSlot ).then( updatedTimeSlot => {
    if ( updatedTimeSlot ) {
      const newTimeSlots = [...timeSlots];
      const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
      newTimeSlots.splice( idx, 1, updatedTimeSlot );
      setTimeSlots( newTimeSlots );
    }
  } );
};

export const updateTimeSlot = ( {
  timeSlot,
  timeSlots,
  includeFields,
  setTimeSlots,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  if ( ! timeSlot || ! timeSlot._id ) {
    return;
  }
  let newEditTimeSlot = {};
  let newTimeSlot = {...timeSlot};
  if ( includeFields ) {
    Object.keys( editTimeSlot ).map( key => {
      if ( includeFields.includes( key ) ) {
        newTimeSlot[key] = editTimeSlot[key];
      } else {
        newEditTimeSlot[key] = editTimeSlot[key];
      }
    } );
  } else {
    newTimeSlot = {
      ...newTimeSlot,
      ...editTimeSlot,
    };
  }
  api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
    if ( numberUpdated ) {
      const newTimeSlots = [...timeSlots];
      const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
      newTimeSlots.splice( idx, 1, newTimeSlot );
      setTimeSlots( newTimeSlots );
      setEditTimeSlot( newEditTimeSlot );
    }
  } );
};

export const startTimeSlot = ( {
  timeSlot,
  timeSlots,
  setTimeSlots,
} ) => {
  const newTimeSlot = {
    ...timeSlot,
    dateStart: dayjs().valueOf(),
    dateStop: undefined,
  };
  [
    '_id',
    'createdAt',
    'updatedAt',
  ].map( key => {
    delete newTimeSlot[key];
  } );
  api.timeSlots.add( newTimeSlot ).then( ( { addedTimeSlot, stoppedTimeSlot } ) => {
    const newTimeSlots = [
      addedTimeSlot,
      ...timeSlots,
    ];
    if ( stoppedTimeSlot ) {
    const idxStopped = newTimeSlots.findIndex( ts => ts._id === stoppedTimeSlot._id );
      if ( idxStopped ) {
        newTimeSlots.splice( idxStopped, 1, stoppedTimeSlot );
      }
    }
    setTimeSlots( newTimeSlots );
  } );
};

export const TimeSlot = ( {
  timeSlot,
} ) => {

  const [editTimeSlot, setEditTimeSlot] = useState( {} );

	const {
		timeSlotSchema,
		timeSlots,
		setTimeSlots,
		getSetting,
    timeSlotCurrent,
    timeSlotCurrentEdit,
    setTimeSlotCurrentEdit,
	} = useContext( Context );

  const isCurrent = !! timeSlotCurrent && timeSlotCurrent._id === timeSlot._id;
  const _editTimeSlot = isCurrent ? timeSlotCurrentEdit : editTimeSlot;
  const _setEditTimeSlot = isCurrent ? setTimeSlotCurrentEdit : setEditTimeSlot;

  return <div className={ classnames( [
		'row',
		! timeSlot.dateStop > 0 ? 'highlight' : '',
	] ) }>

    <div className="col-1"></div>

    { !! timeSlotSchema ? Object.keys( timeSlotSchema ).filter( key => ! [
      ...getSetting( 'hideFields' ),
      '_id',
    ].includes( key ) ).map( key => {
      switch( timeSlotSchema[key].type ) {
        case 'text':
            return <div
              key={ key }
              className={ classnames( [
                'timeSlot--' + key,
                'title' === key ? 'col-9' : 'col'
              ] ) }
            ><Input
              field={ key }
              timeSlot={ timeSlot }
              updateTimeSlot={ () => updateTimeSlot( {
                timeSlot,
                timeSlots,
                setTimeSlots,
                editTimeSlot: _editTimeSlot,
                setEditTimeSlot: _setEditTimeSlot,
              } ) }
              editTimeSlot={ _editTimeSlot }
              setEditTimeSlot={ _setEditTimeSlot }
            /></div>;
        case 'date':
          return <div
            className={ "col timeSlot--" + key }
            key={ key }
          ><DateInput
            field={ key }
            timeSlot={ timeSlot }
            updateTimeSlot={ () => updateTimeSlot( {
              timeSlot,
              timeSlots,
              setTimeSlots,
              editTimeSlot: _editTimeSlot,
              setEditTimeSlot: _setEditTimeSlot,
            } ) }
            editTimeSlot={ _editTimeSlot }
            setEditTimeSlot={ _setEditTimeSlot }
          /></div>;
        default:
            return null;
      }
    } ) : '' }

      <Duration
				timeSlot={ timeSlot }
				editTimeSlot={ _editTimeSlot }
      />

      <div
        className={ "col-4 timeSlot--actions d-flex" }
      >
        <button
          className="btn me-2 save"
          onClick={ () => updateTimeSlot( {
            timeSlot,
            timeSlots,
            setTimeSlots,
            editTimeSlot: _editTimeSlot,
            setEditTimeSlot: _setEditTimeSlot,
          } ) }
          disabled={ ! isObject( _editTimeSlot ) || ! Object.keys( _editTimeSlot ).length }
					title="Save"
        >
          <Icon type='save'/>
        </button>

        <button
          type='button'
          className={ 'btn me-2 ' + ( timeSlot.dateStop ? 'start' : 'stop' ) }
          onClick={ () => timeSlot.dateStop ? startTimeSlot( {
            timeSlot,
            timeSlots,
            setTimeSlots,
          } ) : stopTimeSlot( {
            timeSlot,
            timeSlots,
            setTimeSlots,
          } ) }
					title={ timeSlot.dateStop ? 'Start' : 'Stop' }
        >
          { timeSlot.dateStop && <Icon type='play'/> }
          { ! timeSlot.dateStop && <Icon type='stop'/> }
        </button>

        <button
          type='button'
          className="btn delete"
          onClick={ () => deleteTimeSlot( {
            deleteId: timeSlot._id,
            timeSlots,
            setTimeSlots,
          } ) }
					title="Delete"
        >
          <Icon type='trash'/>
        </button>

      </div>

  </div>;
};
