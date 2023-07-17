import classnames from "classnames";
import dayjs from "dayjs";
import {
  get,
} from "lodash";
import useTick from "../hooks/useTick";
import {
  formatSeconds,
} from '../utils';

const Duration = ( {
  timeSlot,
  editTimeSlot,
} ) => {

  const start = get( editTimeSlot, 'dateStart', get( timeSlot, 'dateStart' ) );
  const stop = get( editTimeSlot, 'dateStop', get( timeSlot, 'dateStop' ) );
  const isDirty =
       ( get( editTimeSlot, 'dateStart', get( timeSlot, 'dateStart' ) ) !== get( timeSlot, 'dateStart' ) )
    || ( get( editTimeSlot, 'dateStop', get( timeSlot, 'dateStop' ) ) !== get( timeSlot, 'dateStop' ) );

  useTick( ! stop );

  const _stop = stop ? stop : dayjs();
  const seconds = start && _stop
    ? dayjs( _stop ).diff( dayjs( start ), 'second' )
    : false;

  return <div
    className={ classnames( {
      "timeSlot--duration": true,
      "text-end": true,
      'align-middle': true,
      'bg-transparent': true,
      'col-3': true,
      'd-flex': true,
      'justify-content-end': true,
    } ) }
    >
    <span
      className={ classnames( {
        invalid: seconds < 0,
        'p-2': true,
        'dirty': isDirty,
      } ) }
    >
      { false !== seconds
        ? formatSeconds( seconds )
        : '- m' }
    </span>
  </div>;
};

export default Duration;