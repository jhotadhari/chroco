import dayjs from 'dayjs';
import { omit } from 'lodash';
import { useContext } from 'react';
import Context from '../Context';
const { api } = window;

const useTimeSlotCrud = () => {
	const {
		timeSlots,
		setTimeSlots,
	} = useContext( Context );

	const startTimeSlot = ( {
		timeSlot,
		maybeForceDefaults,
	} ) => {
		const newTimeSlot = omit( {
			...timeSlot,
			dateStart: dayjs().valueOf(),
			dateStop: undefined,
		}, [
			'_id',
			'createdAt',
			'updatedAt',
		] );

		api.timeSlots.add( newTimeSlot, { maybeForceDefaults } ).then( ( {
			addedTimeSlot, stoppedTimeSlot,
		} ) => {
			const newTimeSlots = [
				addedTimeSlot,
				...timeSlots,
			];
			if ( stoppedTimeSlot ) {
				const idxStopped = newTimeSlots.findIndex( ts => ts._id === stoppedTimeSlot._id );
				if ( idxStopped ) {
					newTimeSlots.splice( idxStopped, 1, stoppedTimeSlot );
				}
			}
			setTimeSlots( newTimeSlots );
		} );
	};

	const updateTimeSlot = ( {
		timeSlot,
		includeFields,
		editTimeSlot,
		setEditTimeSlot,
	} ) => {
		if ( ! timeSlot || ! timeSlot._id ) {
			return;
		}
		let newEditTimeSlot = {};
		let newTimeSlot = { ...timeSlot };
		if ( includeFields ) {
			Object.keys( editTimeSlot ).map( key => {
				if ( includeFields.includes( key ) ) {
					newTimeSlot[key] = editTimeSlot[key];
				} else {
					newEditTimeSlot[key] = editTimeSlot[key];
				}
			} );
		} else {
			newTimeSlot = {
				...newTimeSlot,
				...editTimeSlot,
			};
		}
		api.timeSlots.update( newTimeSlot ).then( numberUpdated => {
			if ( numberUpdated ) {
				const newTimeSlots = [...timeSlots];
				const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
				newTimeSlots.splice( idx, 1, newTimeSlot );
				setTimeSlots( newTimeSlots );
				setEditTimeSlot( newEditTimeSlot );
			}
		} );
	};

	const stopTimeSlot = ( { timeSlot } ) => {
		api.timeSlots.stop( timeSlot ).then( updatedTimeSlot => {
			if ( updatedTimeSlot ) {
				const newTimeSlots = [...timeSlots];
				const idx = newTimeSlots.findIndex( ts => ts._id === timeSlot._id );
				newTimeSlots.splice( idx, 1, updatedTimeSlot );
				setTimeSlots( newTimeSlots );
			}
		} );
	};

	const deleteTimeSlot = ( { deleteId } ) => {
		api.timeSlots.delete( deleteId ).then( numberDeleted => {
			if ( numberDeleted ) {
				const newTimeSlots = [...timeSlots];
				const idx = newTimeSlots.findIndex( ts => ts._id === deleteId );
				newTimeSlots.splice( idx, 1 );
				setTimeSlots( newTimeSlots );
			}
		} );
	};

	return {
		startTimeSlot,
		updateTimeSlot,
		stopTimeSlot,
		deleteTimeSlot,
	};
};
export default useTimeSlotCrud;