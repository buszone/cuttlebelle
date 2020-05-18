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
	md.renderer.rules.heading_open = ( tokens, idx, options ) => {
		tokens[idx].attrs = null;
		tokens[idx + 1].content = `!${tokens[idx + 1].content}!`;
		const childrenLength = tokens[idx + 1].children.length;
		tokens[idx + 1].children[0].content = `!${tokens[idx + 1].children[0].content}`;
		tokens[idx + 1].children[childrenLength - 1].content += '!';

		return md.renderer.renderToken( tokens, idx, options );
	};
};
