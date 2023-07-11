
export const sortTimeSlotsCompare = ( timeSlotA, timeSlotB ) => {
    if ( timeSlotA.dateStart > timeSlotB.dateStart ) {
        return -1;
    }
    if ( timeSlotA.dateStart < timeSlotB.dateStart ) {
      return 1;
    }
    return 0;
};


