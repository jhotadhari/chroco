import Icon from "../Icon";
import ThemeControl from "./ThemeControl";
import HideFieldsControl from "./HideFieldsControl";
import DbPathControl from "./DbPathControl";
import TimezonesControl from "./TimezonesControl";

const Settings = ( {
	showSettings,
	setShowSettings,
} ) => {

	return <div className="settings container-fluid mt-2 mb-3">

		<div className="row mb-3">
			<div className="col">{ showSettings && <h3>Settings</h3> }</div>
			<div className="col d-flex justify-content-end">

				<button
					className='btn float-right'
					type='button'
					title={ showSettings ? 'Open Settings' : 'Close Settings' }
					onClick={ () => {
						setShowSettings( ! showSettings );
					} }
				>
					<Icon type='gear'/>
				</button>
			</div>
		</div>

		{ showSettings && <div className="settings pb-3 mb-4 border-bottom">
			<ThemeControl/>
			<HideFieldsControl/>
			<DbPathControl/>
			<TimezonesControl/>
		</div> }

	</div>;
}

export default Settings;
