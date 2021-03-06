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
	md.core.ruler.before('normalize', 'mdashEncode', (state) => {
		state.src = state.src.replace(/\—/g, '!!!mdash!!!');
	});

	const originalTextRenderer = md.renderer.rules.text;
	md.renderer.rules.text = (tokens, idx) => {
		let text = originalTextRenderer(tokens, idx);
		return text.replace(/!!!mdash!!!/g, '&mdash;');
	};
};
