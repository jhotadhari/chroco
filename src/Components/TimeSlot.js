import classnames from "classnames";
import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";


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

const formatSeconds = seconds => {
  let d = Number( seconds );
  let h = Math.floor( d / 3600 );
  let m = Math.floor( d % 3600 / 60 );
  // let s = Math.floor( d % 3600 % 60 );
  return ( h ? h + ' h ' : '' ) + m + ' m';
};

const Duration = ( {
  start,
  stop,
} ) => {
  return <div className="timeSlot--duration">
    { ( start && stop
      ? formatSeconds( dayjs( stop ).diff( dayjs( start ), 'second' ) )
      : '- m' ) }
  </div>;
};

const DateInput = ( {
  field,
  timeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const [tempVal, setTempVal] = useState( false );
  const val = dayjs( editTimeSlot[field] ? editTimeSlot[field] : timeSlot[field] ).format('YYYY-MM-DD HH:mm:ss');
  return <div className={ "timeSlot--" + field }>
    <input
      id={ "timeSlot--" + field }
      className={ classnames( {
        'form-control': true,
        'dirty': tempVal || ( editTimeSlot[field] && editTimeSlot[field] !== timeSlot[field] ),
        'invalid': tempVal && ! isValidDateInput( tempVal ),
      } ) }
      type="text"
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
    />
  </div>
};

export const TimeSlot = ({ timeSlot, idx, timeSlots, setTimeSlots }) => {

  const [editTimeSlot, setEditTimeSlot] = useState( {} );

  const deleteTimeSlot = ( e ) => {
    e.preventDefault();
    api.timeSlots.delete( timeSlot._id ).then( numberDeleted => {
      if ( numberDeleted ) {
        const newTimeSlots = [...timeSlots];
        newTimeSlots.splice( idx, 1 );
        setTimeSlots( newTimeSlots );
      }
    } );
  };

  const stopTimeSlot = ( e ) => {
    e.preventDefault();
    const newTimeSlot = {
      ...timeSlot,
      dateStop: dayjs().valueOf(),
    };
    api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
      if ( numberUpdated ) {
        const newTimeSlots = [...timeSlots];
        newTimeSlots.splice( idx, 1, newTimeSlot );
        setTimeSlots( newTimeSlots );
      }
    } );
  };

  const updateTimeSlot = ( e ) => {
    e.preventDefault();
    const newTimeSlot = {
      ...timeSlot,
      ...editTimeSlot,
    };
    api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
      if ( numberUpdated ) {
        const newTimeSlots = [...timeSlots];
        newTimeSlots.splice( idx, 1, newTimeSlot );
        setTimeSlots( newTimeSlots );
        setEditTimeSlot( {} );
      }
    } );
  };

  // const restartTimeSlot = ( e ) => {
  //   e.preventDefault();
  //   let { _id, ...newTimeSlot } = editTimeSlot;
  //   newTimeSlot = {
  //     ...newTimeSlot,
  //     dateStart: dayjs().valueOf(),
  //     dateStop: false,
  //   };

  //   db.insert( newTimeSlot, ( err, newDoc ) => {
  //     if (!err) {
  //     }
  //   } );
  // };

  return <li
    className="d-flex justify-content-between align-items-center py-1"
  >

      <div className="timeSlot--title">
        <input
          className={ classnames( {
            'form-control': true,
            'dirty': editTimeSlot.title && editTimeSlot.title !== timeSlot.title,
          } ) }
          type="text"
          onChange={ ( e ) => {
            setEditTimeSlot( { ...editTimeSlot, title: e.target.value } );
          } }
          value={ editTimeSlot.title ? editTimeSlot.title : timeSlot.title }
        />
      </div>

      <DateInput
        field='dateStart'
        timeSlot={ timeSlot }
        editTimeSlot={ editTimeSlot }
        setEditTimeSlot={ setEditTimeSlot }
      />

      <DateInput
        field='dateStop'
        timeSlot={ timeSlot }
        editTimeSlot={ editTimeSlot }
        setEditTimeSlot={ setEditTimeSlot }
      />

      <Duration
        start={ editTimeSlot.dateStart ? editTimeSlot.dateStart : timeSlot.dateStart }
        stop={ editTimeSlot.dateStop ? editTimeSlot.dateStop : timeSlot.dateStop }
      />

      <button
        className="btn flex-shrink-0 save"
        onClick={ updateTimeSlot }
        disabled={ ! Object.keys( editTimeSlot ).length }
      >
        save
      </button>

      <button
        type='button'
        className="btn flex-shrink-0 delete"
        onClick={ deleteTimeSlot }
      >
        delete
      </button>

      <button
        type='button'
        disabled={ timeSlot.dateStop }
        className="btn flex-shrink-0 stop"
        onClick={ stopTimeSlot }
      >
        stop
      </button>

      {/* <button className="restart" onClick={ restartTimeSlot }>
        restart
      </button> */}



  </li>;
};
