import { useState } from "react";
import dayjs from "dayjs";
// import db from "../../public/nedb/db";
const { api } = window;


export const CreateTimeSlot = ( { items, setTimeSlots } ) => {

  const [title, setTitle] = useState("");

  return (
    <div className="align-items-center container d-flex py-4">

      <input
        type="text"
        className="form-control"
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
                ...items,
              ] );
          } );
        } }
      >
        Add TimeSlot
      </button>

    </div>
  );
};
