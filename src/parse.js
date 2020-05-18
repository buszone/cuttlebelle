/***************************************************************************************************************************************************************
 *
 * Parsing different languages
 *
 * ParseContent - Parsing the content of a file into an object
 * ParseMD      - Parsing markdown into HTML
 * ParseYaml    - Parsing yaml into an object
 * ParseHTML    - Clean react output of any silly wrapping divs
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import fs from 'fs';
import MarkdownIt from 'markdown-it';
import YAML from 'js-yaml';
import React from 'react';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Local
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { Log, Style, Slug } from './helper';
import { SETTINGS } from './settings';
import { Path } from './path';


/**
 * Parsing the content of a file into an object
 *
 * @param  {string} content - The content of a partial with or without front matter
 * @param  {string} file    - The path of the file to determine what extension this is, optional, default: 'partial.md'
 * @param  {string} props   - An object of all props being passed to the markdown renderer, optional
 *
 * @return {object}         - An object with parsed out front matter and it’s parsed yaml and the body. format: { frontmatter: {}, body: '' }
 */
export const ParseContent = ( content, file = 'partial.md', props = {} ) => {
	Log.verbose(`Parsing content for ${ Style.yellow( file ) }`);

	if( typeof content === 'string' ) {
		const _isIndex = Path.extname( file ) === '.yml';
		const parsedBody = {};
		let frontmatter = '';
		let markdown = '';

		if( _isIndex ) {                         // if this is a yml file
			parsedBody.frontmatter = ParseYaml( content, file );
			parsedBody.body = '';
		}
		else if( /^---(?:\r\n|\r|\n)/.test( content ) ) { // if this is another file that has frontmatter
			const bodyParts = content.split(/---(?:\r\n|\r|\n)/);

			parsedBody.frontmatter = bodyParts[1] ? ParseYaml( bodyParts[1], file ) : {};
			parsedBody.body = ParseMD( bodyParts.slice( 2 ).join('---\n'), file, props );
		}
		else {                                   // in all other cases (markdown without frontmatter)
			parsedBody.frontmatter = {};
			parsedBody.body = ParseMD( content, file, props );
		}

		return parsedBody;
	}
	else {
		return content;
	}
}


/**
 * Parsing markdown into HTML using https://github.com/chjj/marked
 *
 * @param  {string} markdown - The markdown string
 * @param  {string} file     - The file where this markdown comes from for error handling
 * @param  {string} props    - An object of all props for the custom renderer
 *
 * @return {string}          - HTML rendered from the given markdown
 */
export const ParseMD = ( markdown, file, props ) => {
	if( typeof markdown === 'string' ) {
		const md = new MarkdownIt( { linkify: true } );
		md.linkify.set( { fuzzyLink: false } );

		md.use( md => {
			md.renderer.rules.heading_open = ( tokens, idx, options ) => {
				tokens[idx].attrPush( [ 'id', Slug(tokens[idx + 1].content) ] );
				return md.renderer.renderToken( tokens, idx, options );
			};
		} );

		let plugins = SETTINGS.get().site.markdownPlugins;

		if( plugins ) {
			if( typeof plugins === 'string' ) {
				plugins = [ plugins ];
			}

			if( Array.isArray( plugins ) && plugins.length > 0 ) {
				plugins.forEach( plugin => {
					// First check if it is a local plugin
					let pluginPath = Path.normalize( `${ process.cwd() }/${ plugin }` );

					if( !fs.existsSync( pluginPath ) ) {
						// Null the path as it was not found
						pluginPath = null;

						// It could be an NPM module plugin name instead
						let pluginResolved = null;
						try {
							pluginResolved = require.resolve( plugin );
						}
						catch( error ) {
							// Do nothing
						}
						if ( pluginResolved ) {
							pluginPath = plugin;
						}
					}

					if( pluginPath ) {
						try {
							const pluginFunction = require( pluginPath );
							md.use( pluginFunction, props );
						}
						catch( error ) {
							Log.error(`Using the custom plugin for markdown caused an error at ${ Style.yellow( pluginPath ) }`);
							Log.error( error );

							if( process.env.NODE_ENV === 'production' ) { // let’s die in a fiery death if something goes wrong in production
								process.exit( 1 );
							}
						}
					}
				} );
			}
		}

		try {
			return md.render( markdown );
		}
		catch( error ) {
			Log.error(`Rendering markdown caused an error in ${ Style.yellow( file ) }`);
			Log.error( error );

			if( process.env.NODE_ENV === 'production' ) { // let’s die in a fiery death if something goes wrong in production
				process.exit( 1 );
			}
		}
	}
	else {
		return markdown;
	}
}


/**
 * Parsing yaml into an object using https://github.com/jeremyfa/yaml.js
 *
 * @param  {string} yaml - A yaml string
 * @param  {string} file - The file where this yaml comes from for error handling
 *
 * @return {object}      - The parsed yaml
 */
export const ParseYaml = ( yaml, file ) => {
	if( typeof yaml === 'string' ) {
		try {
			return YAML.safeLoad( yaml, warning => Log.error( warning ) ) || {};
		}
		catch( error ) {
			Log.error(`Rendering yaml caused an error in ${ Style.yellow( file ) }`);
			Log.error( error );

			if( process.env.NODE_ENV === 'production' ) { // let’s die in a fiery death if something goes wrong in production
				process.exit( 1 );
			}
		}
	}
	else {
		return yaml;
	}
}


/**
 * Clean react output of any silly wrapping divs
 *
 * @param  {string} html - The HTML generated with react
 *
 * @return {string}      - The cleaned HTML
 */
export const ParseHTML = ( html ) => {
	if( typeof html === 'string' ) {
		return html
			.replace(/<cuttlebellesillywrapper>/g, '')
			.replace(/<\/cuttlebellesillywrapper>/g, '');
	}
	else {
		return html;
	}
}
