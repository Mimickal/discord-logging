/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/

const expect = require('chai').expect;
const {
	asLines,
	unindent,
} = require('..'); // Tests package exports are set up properly.

describe('utils', function() {
describe(asLines.name, function() {
	const test_str_1 = 'my test string';
	const test_str_2 = 'another test';
	const test_str_3 = ' extra spaces	   and stuff   ';

	it('Single string', function() {
		expect(asLines(test_str_1)).to.equal(test_str_1);
	});

	it('Multiple strings as varargs', function() {
		expect(asLines(test_str_1, test_str_2, test_str_3)).to.equal(
			`${test_str_1}\n${test_str_2}\n${test_str_3}`
		);
	});

	it('String array', function() {
		expect(asLines([test_str_1, test_str_2, test_str_3])).to.equal(
			`${test_str_1}\n${test_str_2}\n${test_str_3}`
		);
	});

	it('String array as varargs', function() {
		expect(asLines([test_str_1], [test_str_2, test_str_3])).to.equal(
			`${test_str_1}\n${test_str_2}\n${test_str_3}`
		);
	});
});

it(unindent.name, function() {
	// Note: mixed whitespace intentional here
	expect(unindent(`
		I have
		      some cool info
		  here
		 	 in this string!
	`)).to.equal('I have some cool info here in this string!');
});
});
