// import logo from './logo.svg';
import './style/App.scss';
import { useEffect, useState } from "react";
// import db from "./nedb/db";
// import db from "db";




import { CreateTimeSlot } from "./Components/CreateTimeSlot";
import { TimeSlots } from "./Components/TimeSlots";
const { api } = window;

function App() {
  const [timeSlots, setTimeSlots] = useState( [] );
  const [timeSlotCurrent, setTimeSlotCurrent] = useState( null );
  const [themeSource, setThemeSource] = useState( false );

  useEffect(() => {
    api.timeSlots.get().then( timeSlots => {
      setTimeSlots( timeSlots );
    } );
  }, [] );

  useEffect(() => {
    api.timeSlots.getCurrent().then( timeSlotCurrent => {
      setTimeSlotCurrent( timeSlotCurrent );
    } );
  }, [timeSlots] );

  useEffect(() => {
    if ( ! themeSource ) {
      api.settings.ui.darkMode.getThemeSource().then( src => {
        setThemeSource( src );
      } );
    }
  }, [themeSource] );

  return <div
    className=""
    data-bs-theme={ themeSource }
  >

      <div className="settings container-fluid py-4">

        <button
          className='btn me-3'
          type='button'
          onClick={ e => {
            e.preventDefault();
            api.settings.ui.darkMode.toggle().then( isDarkMode => setThemeSource( false ) );
          } }
        >Toggle Dark Mode</button>

        <button
          className='btn'
          type='button'
          onClick={ e => {
            e.preventDefault();
            api.settings.ui.darkMode.system().then( () => setThemeSource( false ) );
          } }
        >Reset to System Theme</button>

      </div>



      <CreateTimeSlot
        timeSlots={timeSlots}
        setTimeSlots={setTimeSlots}
        timeSlotCurrent={timeSlotCurrent}
      />
      <TimeSlots
        timeSlots={timeSlots}
        setTimeSlots={setTimeSlots}
        timeSlotCurrent={timeSlotCurrent}
      />
  </div>;
}

export default App;
