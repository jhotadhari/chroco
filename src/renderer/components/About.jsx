import React, {
	useRef,
	useContext,
} from 'react';
import classnames from 'classnames';
import Context from '../Context';
import Icon from './Icon.jsx';

const About = ( {
	showAbout,
	setShowAbout,
} ) => {

	const { appInfo } = useContext( Context );

	const ref = useRef( null );

	return showAbout ? <div
		onClick={ e => e.target === ref.current && setShowAbout( false ) }
		className={ classnames( [
			'modal',
			'fade',
			'modal-xl',
			'd-block',
			'bg-black',
			'bg-opacity-50',
			'bg-blur',
			showAbout ? 'show' : '',
		] ) }
		tabIndex="-1"
		ref={ ref }
	>
		<div className="modal-dialog">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">About - chroco - version { appInfo.version }</h5>
					<button
						type="button"
						className="btn-close"
						aria-label="Close About"
						title="Close About"
						onClick={ () => setShowAbout( false ) }
					></button>
				</div>
				<div className="modal-body">

					{ [...appInfo.readmeMdParts].filter( part => [
						'About',
						'Contribution',
						'Credits',
						'License',
					].includes( part.key ) ).map( part => {
						return <div key={ part.key }>
							{ 'About' !== part.key && <div className='h5'>{ part.key }</div> }
							<div dangerouslySetInnerHTML={ { __html: part.html.replace( /href=/g, 'target="_blank" href=' ) } } />
							{ 'License' === part.key && <Icon type="license" /> }
						</div>;
					} ) }

				</div>
			</div>
		</div>
	</div> : null;
};

export default About;
