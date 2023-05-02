/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
 import {
	ChatInputCommandInteraction,
	CommandInteraction,
	Emoji,
	Guild,
	GuildBan,
	GuildMember,
	Message,
	MessageReaction,
	Role,
	User,

} from 'discord.js';

/**
 * Most IDs are between 17 and 19 characters, but I have seen some patterns
 * matching to 20 for custom emoji IDs, so let's just future-proof this and
 * match up to 22. If this library is still being used by the time we need to
 * update that, well, cool.
 */
export const DISCORD_ID_PATTERN = RegExp('^\\d{17,22}$');

/**
 * Joins the given array of strings using newlines.
 */
export function asLines(...lines: (string | string[])[]): string {
	return lines.flat().join('\n');
}

/**
 * Like {@link stringify}, but provides more detail. Falls back on stringify.
 */
export function detail(thing: unknown): string {
	if (thing instanceof CommandInteraction) {
		const int = thing;
		return `${stringify(int.guild)} ${stringify(int.user)} ${stringify(int)}`;
	}
	else if (thing instanceof MessageReaction) {
		const reaction = thing;
		return `${stringify(reaction)} on ${stringify(reaction.message)}`;
	}
	else {
		// Fall back on standard strings
		return stringify(thing);
	}
}

/**
 * Given a Discord.js object, returns a logger-friendly string describing it in
 * better detail. Arrays of things are stringified as a comma-separated list.
 * Has reasonable fallbacks for JS built-ins like numbers, dates, and objects.
 *
 * This purposely only outputs IDs to limit the amount of user data logged.
 */
export function stringify(thing: unknown): string {
	if (thing instanceof CommandInteraction) {
		const cmd_str = Array.of(
			thing.commandName,
			...(thing instanceof ChatInputCommandInteraction ? [
					thing.options.getSubcommandGroup(false),
					thing.options.getSubcommand(false),
			] : []),
		) .filter(Boolean).join(' ');
		return `Command "${cmd_str}"`;
	}
	else if (thing instanceof Guild) {
		const guild = thing;
		return `Guild ${guild.id}`;
	}
	else if (thing instanceof GuildBan) {
		return `Ban of ${stringify(thing.user)} in ${stringify(thing.guild)}`;
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
		return thing.toString();
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
 */
export function unindent(str: string): string {
	return str
		.replace(/^\s*/, '')
		.replace(/\n\s*/g, ' ')
		.trim();
}

/** Handles both custom Discord.js Emojis and standard unicode emojis. */
function _isEmoji(thing: any): thing is Emoji | string {
	return !_isDiscordId(thing) && (_isEmojiStr(thing) || thing instanceof Emoji);
}

/** Matches Discord IDs. */
function _isDiscordId(thing: any): boolean {
	return thing?.match?.(DISCORD_ID_PATTERN);
}

/** Matches built-in unicode emoji literals. */
function _isEmojiStr(thing: any): boolean {
	return thing?.match?.(/^\p{Emoji}+/u);
}

/**
 * Converts an emoji to a string.
 * Emoji can be one of:
 *   - Custom emoji as an {@link Emoji} object.
 *   - Built-in unicode emoji as a string.
 */
function _stringifyEmoji(emoji: Emoji | string) {
	return emoji instanceof Emoji ? (emoji?.id ?? emoji?.name) : emoji;
}
