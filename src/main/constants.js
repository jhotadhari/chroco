

const path = require( 'path' );
const { app } = require( 'electron' );

const timeSlotsSchemaBase = {
	_id: {
		key: '_id',
		type: 'text',
		title: '',
		useDefault: 0,
	},

	title: {
		key: 'title',
		type: 'text',
		title: 'Title',
		titlePlural: 'Titles',
		required: true,
		useDefault: 0,
	},


	project: {
		key: 'project',
		type: 'text',
		title: 'Project',
		titlePlural: 'Projects',
		hasSuggestions: true,
		useDefault: 0,
	},
	client: {
		key: 'client',
		type: 'text',
		title: 'Client',
		titlePlural: 'Clients',
		hasSuggestions: true,
		useDefault: 0,
	},
	user: {
		key: 'user',
		type: 'text',
		title: 'User',
		titlePlural: 'Users',
		hasSuggestions: true,
		useDefault: '1',
		default: '{{ git.user.name }}',
	},
	billable: {
		key: 'billable',
		type: 'bool',
		title: 'Billable',
		useDefault: 2,
		default: '0',
	},



	dateStart: {
		key: 'dateStart',
		type: 'date',
		title: 'Start',
		required: true,
		useDefault: 0,
	},
	dateStop: {
		key: 'dateStop',
		type: 'date',
		title: 'Stop',
		required: true,
		useDefault: 0,
	},
};

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

	fields: [...Object.values( timeSlotsSchemaBase )],
};

module.exports = {
	timeSlotsSchemaBase,
	settingsDefaults,
};