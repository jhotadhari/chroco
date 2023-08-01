

const path = require( 'path' );
const { app } = require( 'electron' );

const timeSlotsSchemaBase = {
	_id: {
		key: '_id',
		type: 'text',
		title: '',
	},

	title: {
		key: 'title',
		type: 'text',
		title: 'Title',
		titlePlural: 'Titles',
		required: true,
	},


	project: {
		key: 'project',
		type: 'text',
		title: 'Project',
		titlePlural: 'Projects',
		hasSuggestions: true,
	},
	client: {
		key: 'client',
		type: 'text',
		title: 'Client',
		titlePlural: 'Clients',
		hasSuggestions: true,
	},
	user: {
		key: 'user',
		type: 'text',
		title: 'User',
		titlePlural: 'Users',
		hasSuggestions: true,
	},
	billable: {
		key: 'billable',
		type: 'bool',
		title: 'Billable',
		default: '0',
	},



	dateStart: {
		key: 'dateStart',
		type: 'date',
		title: 'Start',
		required: true,
	},
	dateStop: {
		key: 'dateStop',
		type: 'date',
		title: 'Stop',
		required: true,
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