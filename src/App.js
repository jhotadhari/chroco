// import logo from './logo.svg';
import './style/App.scss';
import { useEffect, useState } from "react";
// import db from "./nedb/db";
// import db from "db";




import { CreateTimeSlot } from "./Components/CreateTimeSlot";
import { TimeSlots } from "./Components/TimeSlots";
const { api } = window;

function App() {
  const [items, setTimeSlots] = useState([]);
  const [themeSource, setThemeSource] = useState( false );

  useEffect(() => {
    api.timeSlots.get().then( timeSlots => {
      setTimeSlots( timeSlots );
    } );
  }, [] );

  useEffect(() => {
    if ( ! themeSource ) {
      api.settings.ui.darkMode.getThemeSource().then( src => {
        setThemeSource( src );
      } );
    }
  }, [themeSource] );

  return <div
    className="container-xxl"
    data-bs-theme={ themeSource }
  >

      <div className="settings container py-4">

        <button
          className='btn'
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
        items={items}
        setTimeSlots={setTimeSlots}
      />
      <TimeSlots
        items={items}
        setTimeSlots={setTimeSlots}
      />
  </div>;
}

export default App;
