import { TimeSlot } from "./TimeSlot";

export const TimeSlots = ({ timeSlots, setTimeSlots }) => {
  return (
    <ul
      className="container-fluid py-4 list-unstyled"
    >
      { [...timeSlots].map( ( timeSlot, idx ) => (
        <TimeSlot
          key={ timeSlot._id }
          timeSlot={ timeSlot }
          idx={ idx }
          timeSlots={ timeSlots }
          setTimeSlots={ setTimeSlots }
        />
      ) ) }
    </ul>
  );
};
