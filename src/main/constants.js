

const path = require( 'path' );
const { app } = require( 'electron' );

const settingsDefaults = {

	themeSource: 'system',

	hideFields: [],

	dbPath: {
		settings: path.join( app.getPath( 'userData' ), '/settings.db' ),
		timeSlots: path.join( app.getPath( 'userData' ), '/timeSlots.db' ),
	},

	timezones: [],

	startOfWeek: '1', // Monday

	filters: [
		{
			field: 'dateStart',
			type: 'week',
			value: 0,
		},
	],

	fields: [
		{
			key: '_id',
			type: 'text',
			title: '',
			useDefault: 0,
		},
		{
			key: 'title',
			type: 'text',
			title: 'Title',
			titlePlural: 'Titles',
			required: true,
			useDefault: 0,
		},
		{
			key: 'project',
			type: 'text',
			title: 'Project',
			titlePlural: 'Projects',
			hasSuggestions: true,
			useDefault: 0,
		},
		{
			key: 'client',
			type: 'text',
			title: 'Client',
			titlePlural: 'Clients',
			hasSuggestions: true,
			useDefault: 0,
		},
		{
			key: 'user',
			type: 'text',
			title: 'User',
			titlePlural: 'Users',
			hasSuggestions: true,
			useDefault: '1',
			default: '{{ git.user.name }}',
		},
		{
			key: 'billable',
			type: 'bool',
			title: 'Billable',
			useDefault: 2,
			default: '0',
		},
		{
			key: 'dateStart',
			type: 'date',
			title: 'Start',
			required: true,
			useDefault: 0,
		},
		{
			key: 'dateStop',
			type: 'date',
			title: 'Stop',
			required: true,
			useDefault: 0,
		},
	],
};

module.exports = {
	settingsDefaults,
};