import classnames from "classnames";
import dayjs from "dayjs";
import { useState } from "react";


const { api } = window;

const Duration = ( {
  start,
  stop,
} ) => {

  return <div className="timeSlot--duration">
    { ( start && stop ? dayjs( stop ).diff( dayjs( start ), 'minute' ) : '---' ) + ' min' }
  </div>;
};

export const TimeSlot = ({ item, idx, items, setTimeSlots }) => {

  const [editTimeSlot, setEditTimeSlot] = useState( {} );

  const deleteTimeSlot = ( e ) => {
    e.preventDefault();
    api.timeSlots.delete( item._id ).then( timeSlots => {
      const newTimeSlots = [...items];
      newTimeSlots.splice( idx, 1 );
      setTimeSlots( newTimeSlots );
    } );
  };

  const stopTimeSlot = ( e ) => {
    e.preventDefault();
    const newTimeSlot = {
      ...item,
      dateStop: dayjs().valueOf(),
    };
    api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
      if ( numberUpdated ) {
        const newTimeSlots = [...items];
        newTimeSlots.splice( idx, 1, newTimeSlot );
        setTimeSlots( newTimeSlots );
      }
    } );
  };

  const updateTimeSlot = ( e ) => {
    e.preventDefault();
    const newTimeSlot = {
      ...item,
      ...editTimeSlot,
    };
    api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
      if ( numberUpdated ) {
        const newTimeSlots = [...items];
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
            'dirty': editTimeSlot.title && editTimeSlot.title !== item.title,
          } ) }
          type="text"
          onChange={ ( e ) => {
            setEditTimeSlot( { ...editTimeSlot, title: e.target.value } );
          } }
          value={ editTimeSlot.title ? editTimeSlot.title : item.title }
        />
      </div>

      <div className="timeSlot--dateStart">
        <input
          className={ classnames( {
            'form-control': true,
            'dirty': editTimeSlot.dateStart && editTimeSlot.dateStart !== item.dateStart,
          } ) }
          type="text"
          onChange={ ( e ) => {
            // setEditTimeSlot( { ...editTimeSlot, dateStart: dayjs( e.target.value ).valueOf() } );
          } }
          value={ dayjs(  editTimeSlot.dateStart ? editTimeSlot.dateStart : item.dateStart ).format('YYYY-MM-DD HH:mm:ss') }
        />
      </div>

      <div className="timeSlot--dateStop">
        <input
          className={ classnames( {
            'form-control': true,
            'dirty': editTimeSlot.dateStop && editTimeSlot.dateStop !== item.dateStop,
          } ) }
          type="text"
          disabled={ ! item.dateStop }
          onChange={ ( e ) => {
            // setEditTimeSlot( { ...editTimeSlot, dateStop: dayjs( e.target.value ).valueOf() } );
          } }
          value={ item.dateStop
            ? dayjs( editTimeSlot.dateStop ? editTimeSlot.dateStop : item.dateStop ).format('YYYY-MM-DD HH:mm:ss')
            : '---'
          }
        />
      </div>

      <Duration
        start={ editTimeSlot.dateStart ? editTimeSlot.dateStart : item.dateStart }
        stop={ editTimeSlot.dateStop ? editTimeSlot.dateStop : item.dateStop }
      />

      <button
        className="btn save"
        onClick={ updateTimeSlot }
        disabled={ ! Object.keys( editTimeSlot ).length }
      >
        save
      </button>

      <button
        type='button'
        className="btn delete"
        onClick={ deleteTimeSlot }
      >
        delete
      </button>

      <button
        type='button'
        disabled={ item.dateStop }
        className="btn stop"
        onClick={ stopTimeSlot }
      >
        stop
      </button>

      {/* <button className="restart" onClick={ restartTimeSlot }>
        restart
      </button> */}



  </li>;
};
