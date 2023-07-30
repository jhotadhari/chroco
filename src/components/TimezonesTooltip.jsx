import dayjs from 'dayjs';
import {
	useContext,
} from 'react';
import Context from '../Context';
import {
	dateFormat,
} from '../constants';
import {
	isValidTimezones,
} from '../utils';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
	Tooltip,
} from 'react-tooltip';
dayjs.extend( utc );
dayjs.extend( timezone );

const TimezonesTooltip = ( {
	value,
	tooltipId,
} ) => {
	const {
		getSetting,
		themeSource,
	} = useContext( Context );
	const tzs = getSetting( 'timezones' ).filter( tz => tz.length );
	return tzs && tzs.length > 0 ? <Tooltip
		variant={ themeSource }
		id={ tooltipId }
		className="rounded shadow border border-1 bg-body-tertiary"
	>
		<div className="d-flex flex-column align-items-end">
			{ [...tzs].map( ( tz, idx ) => {
				return isValidTimezones( tz ) ? <span key={ idx }>
					{ tz }: { dayjs( value ).tz( tz )
						.format( dateFormat ) }
				</span> : null;
			} ) }
		</div>
	</Tooltip> : null;
};

export default TimezonesTooltip;