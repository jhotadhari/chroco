import classnames from "classnames";
import dayjs from "dayjs";
import { useState } from "react";
import "../App.css";


const { api } = window;

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
    className="item"
  >
      <div className="title">
        <input
          className={ classnames( {
            'dirty': editTimeSlot.title && editTimeSlot.title !== item.title,
          } ) }
          type="text"
          onChange={ ( e ) => {
            setEditTimeSlot( { ...editTimeSlot, title: e.target.value } );
          } }
          value={ editTimeSlot.title ? editTimeSlot.title : item.title }
        />
      </div>


      <div className="date">
        <input
          className={ classnames( {
            'dirty': editTimeSlot.dateStart && editTimeSlot.dateStart !== item.dateStart,
          } ) }
          type="text"
          onChange={ ( e ) => {
            // setEditTimeSlot( { ...editTimeSlot, dateStart: dayjs( e.target.value ).valueOf() } );
          } }
          value={ dayjs(  editTimeSlot.dateStart ? editTimeSlot.dateStart : item.dateStart ).format('YYYY-MM-DD HH:mm:ss') }
        />
      </div>

      <div className="date">
        { item.dateStop && <input
          type="text"
          onChange={ ( e ) => {
            // setEditTimeSlot( { ...editTimeSlot, dateStop: dayjs( e.target.value ).valueOf() } );
          } }
          value={ dayjs( item.dateStop ).format('YYYY-MM-DD HH:mm:ss') }
        /> }

        { ! item.dateStop && <button
          type='button'
          className="stop"
          onClick={ stopTimeSlot }
        >
          stop
        </button> }
      </div>

      <div className="duration">
        { ( editTimeSlot.dateStart ? editTimeSlot.dateStart : item.dateStart ) && ( editTimeSlot.dateStop ? editTimeSlot.dateStop : item.dateStop ) && <>
          { dayjs( editTimeSlot.dateStop ? editTimeSlot.dateStop : item.dateStop ).diff( dayjs( editTimeSlot.dateStart ? editTimeSlot.dateStart : item.dateStart ), 'minute' ) + ' min' }
        </> }
      </div>

      <button
        className="save"
        onClick={ updateTimeSlot }
        disabled={ ! Object.keys( editTimeSlot ).length }
      >
        save
      </button>

      <button
        type='button'
        className="delete"
        onClick={ deleteTimeSlot }
      >
        delete
      </button>

      {/* <button className="restart" onClick={ restartTimeSlot }>
        restart
      </button> */}

    </li>;
};
