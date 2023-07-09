import "../App.css";
import { TimeSlot } from "./TimeSlot";

export const TimeSlots = ({ items, setTimeSlots }) => {
  return (
    <ul className="items-cont">
      { [...items].map( ( val, idx ) => (
        <TimeSlot
          key={val._id}
          item={val}
          idx={idx}
          items={items}
          setTimeSlots={setTimeSlots}
        />
      ) ) }
    </ul>
  );
};
