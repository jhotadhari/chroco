import { useState } from "react";
import dayjs from "dayjs";
// import db from "../../public/nedb/db";
const { api } = window;


export const CreateTimeSlot = ( { timeSlots, setTimeSlots } ) => {

  const [title, setTitle] = useState("");

  return <div className="container-fluid input-group py-4 ">

    <input
      type="text"
      className="form-control mr-3"
      placeholder="Enter TimeSlot"
      onChange={ ( e ) => {
        setTitle( e.target.value );
      } }
      value={ title  }
    />

    <button
      type='button'
      className='btn'
      onClick={ e => {
        e.preventDefault();
        api.timeSlots.add( {
          title,
          dateStart: dayjs().valueOf(),
          dateStop: false,
        } ).then( addedTimeSlot => {
            console.log( 'debug addedTimeSlot', addedTimeSlot ); // debug
            setTitle( '' );
            setTimeSlots( [
              addedTimeSlot,
              ...timeSlots,
            ] );
        } );
      } }
    >
      Add TimeSlot
    </button>

  </div>;
};
