const fs = require( 'fs' );
const path = require('path');
const { serialHooks } = require( 'electron-packager/src/hooks' );
const appRootDir = require('app-root-dir').get();

module.exports = {
	packagerConfig: {
		asar: true,
		afterCopy: [
			serialHooks( [
				buildPath => {
			  		return new Promise( resolve => {
						fs.copyFileSync(
							path.join( appRootDir, 'README.md' ),
							path.join( buildPath, 'README.md' )
						);
						resolve();
					} );
				},
		  	] ),
		],
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {},
		},
	],
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'jhotadhari',
					name: 'chroco',
				},
				draft: false,
				prerelease: false,
			},
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		{
			name: '@electron-forge/plugin-webpack',
			config: {
				mainConfig: './webpack.main.config.js',
				renderer: {
					config: './webpack.renderer.config.js',
					entryPoints: [
						{
							html: './src/renderer/index.html',
							js: './src/renderer/renderer.js',
							name: 'main_window',
							preload: { js: './src/main/preload.js' },
						},
					],
				},
			},
		},
	],
};
