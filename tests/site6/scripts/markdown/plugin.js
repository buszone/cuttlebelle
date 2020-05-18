module.exports = exports = (md, {
	_ID = null,          // The ID of the current page
	_self = null,        // The relative path to the content file; can be md or yaml file
	_isDocs = false,     // A boolean value, true in docs context only
	_parents = null,     // An array of all parent pages IDs
	_pages = null,       // An object of all pages and their props; with ID as key
	_storeSet = null,    // The store setter
	_store = null,       // The store getter
	_nav = null,         // A nested object of your site structure
	_relativeURL = null, // A helper function to make an absolute URL relative
	_parseYaml = null,   // The YAML parsing function
	_parseReact = null,  // A function that parses React to static markup
	_globalProp = null   // A prop that can be set globally from the `package.json`
} = {}) => {
	const headingLevels = {
		1: 'display-1',
		2: 'display-2',
		3: 'display-3',
		4: 'display-4',
		5: 'display-5',
		6: 'display-6',
	};

	md.renderer.rules.heading_open = ( tokens, idx, options ) => {
		const idAttrPosition = tokens[idx].attrIndex('id');
		if( idAttrPosition >= 0 ) {
			tokens[idx].attrs = tokens[idx].attrs.splice( idAttrPosition, 1 );
		}

		let display;
		let text = tokens[idx + 1].content;
		if( text.startsWith('[') ) {
			const displayText = text.split(']');
			display = displayText[ 0 ].substring( 1 );

			text = displayText.splice( 1 ).join(']');
		}
		else {
			const level = tokens[idx].tag.replace('h', '');
			display = Object.keys( headingLevels ).reverse()[ level ];
		}

		tokens[idx + 1].content = text;
		tokens[idx + 1].children[0].content = text;

		if( headingLevels[display] ) {
			tokens[idx].attrPush(['class', headingLevels[ display ]]);
		}

		return md.renderer.renderToken( tokens, idx, options );
	};

	md.renderer.rules.link_open = ( tokens, idx, options ) => {
		let href = tokens[idx].attrGet('href');
		if( href.startsWith('http://') || href.startsWith('https://') ) {
			tokens[idx].attrPush( [ 'rel', 'external' ] );
		}

		return md.renderer.renderToken( tokens, idx, options );
	}

	md.core.ruler.before('normalize', 'entityEncode', (state) => {
		state.src = state.src
			.replace(/\—/g, '!!!mdash!!!')
			.replace(/\–/g, '!!!ndash!!!')
			.replace(/\.\.\./g, '!!!hellip!!!');
	});

	const originalTextRenderer = md.renderer.rules.text;

	md.renderer.rules.text = (tokens, idx) => {
		let text = originalTextRenderer(tokens, idx);
		return text
			.replace(/!!!mdash!!!/g, '<span class="markdown-mdash">&mdash;</span>')
			.replace(/!!!ndash!!!/g, '<span class="markdown-ndash">&ndash;</span>')
			.replace(/!!!hellip!!!/g, '<span class="markdown-ellipsis">&hellip;</span>');
	};
};
