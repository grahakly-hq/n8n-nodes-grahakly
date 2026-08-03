/**
 * Stricter pass run only at publish time — the community ruleset with the "still-default" name
 * allowances turned back on, so a package that never got renamed cannot be published by accident.
 */
module.exports = {
	extends: './.eslintrc.js',
	overrides: [
		{
			files: ['package.json'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			rules: { 'n8n-nodes-base/community-package-json-name-still-default': 'error' },
		},
	],
};
