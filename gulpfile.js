const { src, dest } = require('gulp');

// Copies node/credential SVG icons into dist alongside the compiled JS — tsc does not move assets.
function buildIcons() {
	return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes')).on('end', () => {});
}

exports['build:icons'] = buildIcons;
