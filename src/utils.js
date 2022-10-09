/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
 const {
	CommandInteraction,
	Emoji,
	Guild,
	GuildMember,
	Message,
	MessageReaction,
	Role,
	User,
} = require('discord.js');

/**
 * Most IDs are between 17 and 19 characters, but I have seen some patterns
 * matching to 20 for custom emoji IDs, so let's just future-proof this and
 * match up to 22. If this bot is still being used by the time we need to update
 * that, well, cool.
 */
const DISCORD_ID_PATTERN = RegExp('^\\d{17,22}$');

/**
 * Joins the given array of strings using newlines.
 */
function asLines(...lines) {
	return lines.flat().join('\n');
}

/**
 * Given a Discord.js object, returns a logger-friendly string describing it in
 * better detail. Arrays of things are stringified as a comma-separated list.
 * Has reasonable fallbacks for JS built-ins like numbers, dates, and objects.
 *
 * This purposely only outputs IDs to limit the amount of user data logged.
 * @return { string }
 */
function stringify(thing) {
	if (thing instanceof CommandInteraction) {
		const interaction = thing;
		const cmd_str = Array.of(
			interaction.commandName,
			interaction.options.getSubcommandGroup(false),
			interaction.options.getSubcommand(false),
		).filter(x => x).join(' ');
		return `Command "${cmd_str}"`;
	}
	else if (thing instanceof Guild) {
		const guild = thing;
		return `Guild ${guild.id}`;
	}
	else if (thing instanceof GuildMember) {
		const member = thing;
		return `User ${member.id}`; // Same as member.user.id
	}
	else if (thing instanceof Message) {
		const message = thing;
		return `Message ${message.url}`;
	}
	else if (thing instanceof MessageReaction) {
		const reaction = thing;
		return `Reaction ${_stringifyEmoji(reaction.emoji)}`;
	}
	else if (thing instanceof Role) {
		const role = thing;
		return `Role ${role.id}`;
	}
	else if (thing instanceof User) {
		const user = thing;
		return `User ${user.id}`;
	}
	else if (_isEmoji(thing)) {
		const emoji = thing;
		return `Emoji ${_stringifyEmoji(emoji)}`;
	}
	else if (Array.isArray(thing)) {
		return thing.map(t => stringify(t)).join(', ');
	}
	else if (typeof thing === 'string' || thing instanceof String) {
		return thing;
	}
	if (thing === undefined) {
		return '[undefined]';
	}
	else if (thing === null) {
		return '[null]';
	}
	else { // numbers, dates, objects, etc...
		return JSON.stringify(thing);
	}
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

/** Handles both custom Discord.js Emojis and standard unicode emojis. */
function _isEmoji(thing) {
	return !_isDiscordId(thing) && (_isEmojiStr(thing) || thing instanceof Emoji);
}

/** Matches Discord IDs. */
function _isDiscordId(str) {
	return str?.match?.(DISCORD_ID_PATTERN);
}

/** Matches built-in unicode emoji literals. */
function _isEmojiStr(str) {
	return str?.match?.(/^\p{Emoji}+/u);
}

/**
 * Converts an emoji to a string.
 * Emoji can be one of:
 *   - Custom emoji as an {@link Emoji} object.
 *   - Built-in unicode emoji as a string.
 */
function _stringifyEmoji(emoji) {
	return emoji?.id ?? emoji?.name ?? emoji;
}

module.exports = {
	DISCORD_ID_PATTERN,
	asLines,
	stringify,
	unindent,
};
