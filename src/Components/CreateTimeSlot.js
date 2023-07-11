import { useState, useContext } from "react";
import dayjs from "dayjs";
import Context from '../Context';
const { api } = window;

export const CreateTimeSlot = () => {

  const [title, setTitle] = useState( '' );

	const {
		timeSlots,
		setTimeSlots,
		timeSlotCurrent,
	} = useContext( Context );

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
