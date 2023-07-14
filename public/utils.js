
const {
	existsSync,
	accessSync,
	constants,
} = require( 'fs' );
const path = require( 'path' );

/**
 * Check if path is existing and writable.
 * If not existing, check if parent is existing and writable.
 *
 */
const isPathValid = p => {

	if ( path.join( p, '..') === path.join( p ) ) {
		return false;	// is root
	}

	if ( existsSync( p ) ) {
		try {
			accessSync( p, constants.W_OK );
			return true;
		} catch ( err ) {
			return false;	// not writable
		}
	} else {
		return isPathValid( path.join( p, '..') );
	}
}

module.exports = {
    isPathValid,
};