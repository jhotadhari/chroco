
export const sortTimeSlotsCompare = ( timeSlotA, timeSlotB ) => {
    if ( timeSlotA.dateStart > timeSlotB.dateStart ) {
        return -1;
    }
    if ( timeSlotA.dateStart < timeSlotB.dateStart ) {
      return 1;
    }
    return 0;
};

export const formatSeconds = seconds => {
    let isNeg = false;
    if ( seconds < 0 ) {
        isNeg = true;
        seconds = seconds * ( -1 );
    }
    let d = Number( seconds );
    let h = Math.floor( d / 3600 );
    let m = Math.floor( d % 3600 / 60 );
    // let s = Math.floor( d % 3600 % 60 );
    return ( isNeg ? '- ' : '' ) + ( h ? h + ' h ' : '' ) + m + ' m';
};
