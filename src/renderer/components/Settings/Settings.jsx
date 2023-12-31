import React, { useRef } from 'react';
import classnames from 'classnames';
import ThemeControl from './ThemeControl.jsx';
import FieldsControl from './FieldsControl.jsx';
import DbPathControl from './DbPathControl.jsx';
import TimezonesControl from './TimezonesControl.jsx';
import StartOfWeekControl from './StartOfWeekControl.jsx';

const Settings = ( {
	showSettings,
	setShowSettings,
} ) => {
	const ref = useRef( null );
	// onKeyDown={ e => 'Escape' === e.key && setShowSettings( false ) }
	return showSettings ? <div
		onClick={ e => e.target === ref.current && setShowSettings( false ) }
		className={ classnames( [
			'modal',
			'fade',
			'modal-xl',
			'd-block',
			'bg-black',
			'bg-opacity-50',
			'bg-blur',
			showSettings ? 'show' : '',
		] ) }
		tabIndex="-1"
		ref={ ref }
	>
		<div className="modal-dialog">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">Preferences</h5>
					<button
						type="button"
						className="btn-close"
						aria-label="Close Preferences"
						title="Close Preferences"
						onClick={ () => setShowSettings( false ) }
					></button>
				</div>
				<div className="modal-body">

					<ThemeControl className="mb-5" />
					<StartOfWeekControl className="mb-5" />
					<FieldsControl className="mb-5" />
					<DbPathControl className="mb-5" />
					<TimezonesControl className="mb-5" />


				</div>
			</div>
		</div>
	</div> : null;
};

export default Settings;
