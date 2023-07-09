import { TimeSlot } from "./TimeSlot";

export const TimeSlots = ({ items, setTimeSlots }) => {
  return (
    <ul
      className="container py-4 list-unstyled"
    >
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
