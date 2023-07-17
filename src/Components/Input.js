import classnames from "classnames";
import {
  get,
} from "lodash";
import {
  useContext,
} from "react";

import Context from '../Context';

const Input = ( {
  field,
  useDefault,
  timeSlot,
  updateTimeSlot,
  editTimeSlot,
  setEditTimeSlot,
} ) => {
  const {
    timeSlotSchema,
    setTimeSlots,
    timeSlots,
   } = useContext( Context );
  const title = get( timeSlotSchema, [field,'title'], '' );
  const defaultVal = useDefault ? get( timeSlotSchema, [field, 'default'], '' ) : '';
  const isDirty = get( editTimeSlot, field, get( timeSlot, field ) ) !== get( timeSlot, field );
  const value = get( editTimeSlot, field, get( timeSlot, field, defaultVal ) );

  return <input
      onKeyDown={ e => {
        if ( isDirty ) {
          switch( e.key ) {
            case 'Enter':
              updateTimeSlot( {
                  timeSlot,
                  timeSlots,
                  setTimeSlots,
                  editTimeSlot,
                  setEditTimeSlot,
                  // includeFields: [field],	// ??? TODO Bug with group updateTimeSlots: other dirty fields loose their changes. Actually here it works fine, but disabled for now.
              } );
              break;
            case 'Escape':
              const newEditTimeSlot = {...editTimeSlot}
              delete newEditTimeSlot[field];
              setEditTimeSlot( newEditTimeSlot );
              break;
          }
        }
      } }
      className={ classnames( {
        'form-control': true,
        'dirty': isDirty,
      } ) }
      type="text"
      onChange={ ( e ) => {
        setEditTimeSlot( { ...editTimeSlot, [field]: e.target.value } );
      } }
      value={ value }
      title={ title }
      placeholder={ title }
    />;
};

export default Input;