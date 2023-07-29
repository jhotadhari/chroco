/**
 * eslint cnfig to use with `npm run format`
 *
 */
module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
	},
	'extends': [
		'eslint:recommended',
		'plugin:react/recommended',
	],
	'overrides': [
		{
			'env': {
				'node': true,
			},
			'files': ['.eslintrc.{js,cjs}'],
			'parserOptions': {
				'sourceType': 'script',
			},
		},
	],
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module',
	},
	'plugins': ['react'],
	'rules': {
		'switch-colon-spacing': [
			'error', {
				'after': true,
				'before': false,
			},
		],
		'no-mixed-spaces-and-tabs': 'error',
		'indent': [
			'error',
			'tab',
			{
				'FunctionDeclaration': {
					'body': 1,
					'parameters': 1,
				},
				'FunctionExpression': {
					'body': 1,
					'parameters': 1,
				},
				'SwitchCase': 1,
				'VariableDeclarator': 1,
				'outerIIFEBody': 1,
				'CallExpression': {
					'arguments': 1,
				},
				'MemberExpression': 1,
				'ArrayExpression': 1,
				'ObjectExpression': 1,
				'ImportDeclaration': 1,
			},
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		'quotes': [
			'error',
			'single',
		],
		'rest-spread-spacing': [
			'error',
			'never',
		],
		'space-in-parens': [
			'error',
			'always',
		],
		'space-before-blocks': [
			'error',
			'always',
		],
		'space-before-function-paren': [
			'error',
			'never',
		],
		'semi': [
			'error',
			'always',
		],
		'comma-style': [
			'error',
			'last',
		],
		'brace-style': [
			'error',
			'1tbs',
		],
		'comma-dangle': [
			'error',
			'always-multiline',
		],
		'prefer-arrow-callback': 'error',
		'no-trailing-spaces': 'error',
		'object-curly-newline': [
			'error', {
				'ImportDeclaration': 'always',
				'ObjectExpression': 'always',
				'ObjectPattern': {
					'multiline': true, 'minProperties': 2,
				},
				'ExportDeclaration': {
					'multiline': true, 'minProperties': 2,
				},

			},
		],
		'newline-per-chained-call': [
			'error', {
				'ignoreChainWithDepth': 2,
			},
		],
		'object-property-newline': [
			'error',
			{
				'allowAllPropertiesOnSameLine': true,
			},
		],
		'comma-spacing': [
			'error', {
				'before': false,
				'after': true,
			},
		],
		'array-bracket-newline': [
			'error', {
				'multiline': true,
				'minItems': 2,
			},
		],
		'array-element-newline': [
			'error',
			'consistent',
		],
	},
};
