/***************************************************************************************************************************************************************
 *
 * parse.js unit tests
 *
 * @file - src/parse.js
 *
 * Tested methods:
 * ParseContent
 * ParseMD
 * ParseYaml
 * ParseHTML
 *
 **************************************************************************************************************************************************************/


import { ParseContent, ParseMD, ParseYaml, ParseHTML } from '../../src/parse';
import { SETTINGS } from '../../src/settings';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ParseContent
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
test('ParseContent() - Non strings stay whatever they are', () => {
	expect( ParseContent( undefined, '' ) ).toBe( undefined );
	expect( ParseContent( [], '' ) ).toEqual( expect.arrayContaining( [] ) );
	expect( ParseContent( {}, '' ) ).toMatchObject( {} );
});


test('ParseContent() - Parse yaml content correctly', () => {
	const content1 = ``;
	const match1 = { frontmatter: {}, body: '' };
	expect( ParseContent( content1, 'index.yml' ) ).toMatchObject( match1 );


	const content2 = `
test: var
var: test
`;
	const match2 = { frontmatter: { test: 'var', var: 'test' }, body: '' };
	expect( ParseContent( content2, 'index.yml' ) ).toMatchObject( match2 );
});


test('ParseContent() - Parse md content correctly', () => {
	const content1 = ``;
	const match1 = { frontmatter: {}, body: '' };
	expect( ParseContent( content1, 'partial.md' ) ).toMatchObject( match1 );

	const content2 = `---\ntest: var\nvar: test\n---\n\n**yes**\n`;

	const match2 = { frontmatter: { test: 'var', var: 'test' }, body: '<p><strong>yes</strong></p>\n' };
	expect( ParseContent( content2, 'partial.md' ) ).toMatchObject( match2 );

	const content3 = `---\r\ntest: var\r\nvar: test\r\n---\r\n\r\n**yes**\r\n`;
	expect( ParseContent( content3, 'partial.md' ) ).toMatchObject( match2 );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ParseMD
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
test('ParseMD() - Non strings stay whatever they are', () => {
	expect( ParseMD( undefined ) ).toBe( undefined );
	expect( ParseMD( [] ) ).toEqual( expect.arrayContaining( [] ) );
	expect( ParseMD( {} ) ).toMatchObject( {} );
});


test('ParseMD() - Markdown is parsed', () => {
	const content1 = ``;
	const match1 = '';
	expect( ParseMD( content1 ) ).toBe( match1 );

	const content2 = `**yes** _test_`;
	const match2 = '<p><strong>yes</strong> <em>test</em></p>\n';
	expect( ParseMD( content2 ) ).toBe( match2 );
});


test('ParseMD() - Markdown takes the custom plugins', () => {
	SETTINGS.defaults.site.markdownPlugins = [
		'tests/__unit__/mocks/markdownPluginHeading.js',
		'tests/__unit__/mocks/markdownPluginMdash.js'
	];
	const content2 = `
### testing

— no list
- list
`;
	const match2 = '<h3>!testing!</h3>\n<p>&mdash; no list</p>\n<ul>\n<li>list</li>\n</ul>\n';
	expect( ParseMD( content2 ) ).toBe( match2 );
});


test('ParseMD() - Markdown takes an npm plugin', () => {
	SETTINGS.defaults.site.markdownPlugins = [
		'markdown-it-deflist' // This is included in devDependencies in package.json only for this test
	];
	const content2 = `
### testing

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b
`;
	const match2 = `<h3 id="testing">testing</h3>
<dl>
<dt>Term 1</dt>
<dd>Definition 1</dd>
<dt>Term 2</dt>
<dd>Definition 2a</dd>
<dd>Definition 2b</dd>
</dl>
`;
	expect( ParseMD( content2 ) ).toBe( match2 );
});


test('ParseMD() - Markdown ignores plugins which do not exist', () => {
	SETTINGS.defaults.site.markdownPlugins = [
		'tests/__unit__/mocks/markdownPluginNonExistent.js',
		'markdown-it-non-existent'
	];
	const content2 = `
### testing

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b
`;
	const match2 = `<h3 id="testing">testing</h3>
<p>Term 1
~ Definition 1</p>
<p>Term 2
~ Definition 2a
~ Definition 2b</p>
`;
	expect( ParseMD( content2 ) ).toBe( match2 );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ParseYaml
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
test('ParseYaml() - Non strings stay whatever they are', () => {
	expect( ParseYaml( undefined ) ).toBe( undefined );
	expect( ParseYaml( [] ) ).toEqual( expect.arrayContaining( [] ) );
	expect( ParseYaml( {} ) ).toMatchObject( {} );
});


test('ParseYaml() - Yaml is parsed', () => {
	const content1 = ``;
	const match1 = {};
	expect( ParseYaml( content1 ) ).toMatchObject( match1 );

	const content2 = `var: value`;
	const match2 = { var: 'value' };
	expect( ParseYaml( content2 ) ).toMatchObject( match2 );
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// ParseHTML
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
test('ParseHTML() - Non strings stay whatever they are', () => {
	expect( ParseHTML( undefined ) ).toBe( undefined );
	expect( ParseHTML( [] ) ).toEqual( expect.arrayContaining( [] ) );
	expect( ParseHTML( {} ) ).toMatchObject( {} );
});


test('ParseHTML() - Clean react html up nicely', () => {
	const content1 = ``;
	const match1 = ``;
	expect( ParseHTML( content1 ) ).toBe( match1 );

	const content2 = `<div class="totally testing here"><cuttlebellesillywrapper>no wrappy please</cuttlebellesillywrapper>` +
		`<cuttlebellesillywrapper></cuttlebellesillywrapper><cuttlebellesillywrapper> anywhere</cuttlebellesillywrapper></div>`;
	const match2 = `<div class="totally testing here">no wrappy please anywhere</div>`;
	expect( ParseHTML( content2 ) ).toBe( match2 );
});
