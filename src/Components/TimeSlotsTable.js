import classnames from "classnames";
import { useContext } from "react";
import Context from '../Context';
import { TimeSlot } from "./TimeSlot";

export const TimeSlotsTable = () => {

	const {
		timeSlotSchema,
		timeSlots,
		themeSource,
	} = useContext( Context );

  	return <div
		className='container-fluid py-4'
	>
		<table
			className={ classnames( {
				"py-4": true,
				"table": true,
				"table-sm": true,
				"table-dark": 'dark' === themeSource,
			} ) }
		>
			<thead>
				<tr>
					{ !! timeSlotSchema ? Object.keys( timeSlotSchema ).map( key => {
						if ( '_id' === key ) {
							return null;
						}
						return <th
							key={ key }
							className='bg-transparent'
							scope="col"
							colSpan={ 'title' === key ? 2 : 1 }
						>{ timeSlotSchema[key].title }</th>
					} ) : '' }
					<th className='bg-transparent' scope="col">Duration</th>
					<th className='bg-transparent' scope="col">Actions</th>
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
