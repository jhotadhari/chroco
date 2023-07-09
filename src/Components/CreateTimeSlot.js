import { useState } from "react";
import dayjs from "dayjs";
// import db from "../../public/nedb/db";
// import "../App.css";
const { api } = window;


export const CreateTimeSlot = ( { items, setTimeSlots } ) => {

  const [title, setTitle] = useState("");

  return (
    <div className="formContainer">

      <input
        type="text"
        placeholder="Enter TimeSlot"
        className="inputTODO"
        onChange={ ( e ) => {
          setTitle( e.target.value );
        } }
        value={ title  }
      />

      <button
        className="addTimeSlot"
        type='button'
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
