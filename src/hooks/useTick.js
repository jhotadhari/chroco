
import {
	useState,
	useEffect,
} from "react";

const useTick = shouldTick => {
	const [intervalID, setIntervalID] = useState( null );
	const [tick, setTick] = useState( false );
  	useEffect( () => {
		let iid = false
		const clearTick = () => {
		  if ( ! shouldTick ) {
			clearInterval( intervalID );
			setIntervalID( false );
		  }
		  clearInterval( iid );
		}
		const setupTick = () => {
			iid = setInterval( () => {
				setTick( Math.random() );
			}, 1000 );
			setIntervalID( iid );
			window.removeEventListener( 'tick' , setupTick );
		}
		if ( shouldTick ) {
			if ( ! intervalID ) {
				window.addEventListener( 'tick', setupTick, { once: true } );
			}
		} else {
			if ( intervalID ) {
				clearTick()
			}
		}
		return clearTick;
	}, [shouldTick] );
}
export default useTick;