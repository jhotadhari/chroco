const rules = require( './webpack.rules' );

rules.push( {
	test: /\.s?css$/i,
	use: [
		{ loader: 'style-loader' },
		{ loader: 'css-loader' },
		{
			loader: 'sass-loader',
			options: { implementation: require.resolve( 'sass' ) },
		},
	],
} );

module.exports = {
	// Put your normal webpack config below here
	module: { rules },
};
