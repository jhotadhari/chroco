import { useState } from "react";
import dayjs from "dayjs";
const { api } = window;

export const CreateTimeSlot = ( {
  timeSlots,
  setTimeSlots,
  timeSlotCurrent,
} ) => {

  const [title, setTitle] = useState("");

  return <div className="container-fluid input-group py-4 ">

    <input
      type="text"
      disabled={ !! timeSlotCurrent }
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
      disabled={ !! timeSlotCurrent }
      onClick={ e => {
        e.preventDefault();
        api.timeSlots.add( {
          title,
          dateStart: dayjs().valueOf(),
          dateStop: false,
        } ).then( addedTimeSlot => {
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
