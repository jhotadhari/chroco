import Context from '../Context';
import { useContext } from "react";
import { TimeSlot } from "./TimeSlot";

export const TimeSlotsTable = () => {

	const {
		timeSlotSchema,
		timeSlots,
	} = useContext( Context );

  	return <div
		className='container-fluid py-4'
	>
		<table className="table py-4">
			<thead>
				<tr>
					{ !! timeSlotSchema ? Object.keys( timeSlotSchema ).map( key => {
						if ( '_id' === key ) {
							return null;
						}
						return <th
							scope="col"
							colspan={ 'title' === key ? 2 : 1 }
						>{ timeSlotSchema[key].title }</th>
					} ) : '' }
					<th scope="col">Duration</th>
					<th scope="col">Actions</th>
				</tr>
			</thead>
			<tbody>
				{ [...timeSlots].map( ( timeSlot, idx ) => (
					<TimeSlot
						key={ timeSlot._id }
						timeSlot={ timeSlot }
						idx={ idx }
					/>
				) ) }
			</tbody>
		</table>
	</div> ;
};
