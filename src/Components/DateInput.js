import classnames from "classnames";
import dayjs from "dayjs";
import {
  get,
  omit,
} from "lodash";
import {
  useState,
  useContext,
} from "react";
import Context from '../Context';
import { dateFormat } from '../constants';
import {
  isValidTimezones,
} from '../utils';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Tooltip } from 'react-tooltip'
dayjs.extend( utc );
dayjs.extend( timezone );

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


const DateInput = ( {
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
    getSetting,
    themeSource,
   } = useContext( Context );
  const [tempVal, setTempVal] = useState( false );
  const val = get( timeSlot, field )
    ? dayjs( get( editTimeSlot, field, get( timeSlot, field ) ) ).format( dateFormat )
    : '';
  const isDirty = tempVal || ( get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field ) );
  const title = get( timeSlotSchema, [field,'title'], '' );
  const tzs = getSetting( 'timezones' ).filter( tz => tz.length );
  const tooltipId = get( timeSlot, '_id' ) + '-' + field + '-' + Math.round( Math.random() * 100000 );

  return <>
    <input
        data-tooltip-id={ tooltipId }
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
                setEditTimeSlot( omit( editTimeSlot, field ) );
                setTempVal( false )
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
        value={ tempVal ? tempVal : val }
        title={ title }
        placeholder={ dateFormat }
      />

      { tzs && tzs.length > 0 && <Tooltip
        variant={ themeSource }
        id={ tooltipId }
        className="rounded shadow border border-1 bg-body-tertiary"
      >
        <div className="d-flex flex-column align-items-end">
          { [...tzs].map( ( tz, idx ) => {
            return isValidTimezones( tz ) ? <span key={idx}>
              { tz }: { dayjs( tempVal ? tempVal : val ).tz( tz ).format( dateFormat ) }
            </span> : null;
          } ) }
        </div>
      </Tooltip> }

    </>;
};

export default DateInput;