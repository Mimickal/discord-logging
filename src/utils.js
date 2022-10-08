/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/

/**
 * Joins the given array of strings using newlines.
 */
function asLines(...lines) {
	return lines.flat().join('\n');
}

/**
 * Compresses a multi-line template string into a single continuous line.
 * Replaces new-lines and leading whitespace with a single space, so if you need
 * leading whitespace, try {@link asLines}.
 * @param { string } str
 */
function unindent(str) {
	return str
		.replace(/^\s*/, '')
		.replace(/\n\s*/g, ' ')
		.trim();
}

module.exports = {
	asLines,
	unindent,
};
