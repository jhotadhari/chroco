// import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";
// import db from "./nedb/db";
// import db from "db";




import { CreateTimeSlot } from "./Components/CreateTimeSlot";
import { TimeSlots } from "./Components/TimeSlots";

function App() {
  const [items, setTimeSlots] = useState([]);

  useEffect(() => {
    window.api.timeSlots.get().then( timeSlots => {
      setTimeSlots( timeSlots );
    } );
  }, [] );

  return (
    <div className="App">
      <div className="dark-mode">

        <button
          type='button'
          onClick={ e => {
            e.preventDefault();
            window.api.settings.ui.toggle().then( isDarkMode => {
              console.log( 'debug isDarkMode', isDarkMode ); // debug
            } );
          } }
        >Toggle Dark Mode</button>

        <button
          type='button'
          onClick={ e => {
            e.preventDefault();
            window.api.settings.ui.system().then( () => {
              // document.getElementById('theme-source').innerHTML = 'System'
            } );
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
    </div>
  );
}

export default App;
