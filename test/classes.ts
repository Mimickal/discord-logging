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
	Client,
	ClientUser,
	Emoji,
	Guild,
	GuildBan,
	Message,
	MessageReaction,
	TextChannel,
	User,
} from 'discord.js';
import {
	RawEmojiData,
	RawGuildBanData,
	RawGuildChannelData,
	RawGuildData,
	RawInteractionData,
	RawMessageData,
	RawMessageReactionData,
	RawUserData,
} from 'discord.js/typings/rawDataTypes';

// Almost all of these class constructors are private or protected.
// These are thin wrappers that expose those constructors in a type-safe way.

export class TestChatInputCommandInteraction extends ChatInputCommandInteraction {
	constructor(client: Client<true>, data: RawInteractionData) {
		super(client, data)
	}
}

export class TestClientUser extends ClientUser {
	constructor(client: Client<true>, data: RawUserData) {
		super(client, data);
	}
}

export class TestEmoji extends Emoji {
	constructor(client: Client<true>, emoji: RawEmojiData) {
		super(client, emoji);
	}
}

// @ts-expect-error private constructor
export class TestGuild extends Guild {
	constructor(client: Client<true>, data: RawGuildData) {
		super(client, data);
	}
}

// @ts-expect-error private constructor
export class TestGuildBan extends GuildBan {
	constructor(client: Client<true>, data: RawGuildBanData, guild: Guild) {
		super(client, data, guild);
	}
}

// @ts-expect-error private constructor
export class TestMessage extends Message {
	constructor(client: Client<true>, data: RawMessageData) {
		super(client, data);
	}
}

// @ts-expect-error private constructor
export class TestMessageReaction extends MessageReaction {
	constructor(client: Client<true>, data: RawMessageReactionData, message: Message) {
		super(client, data, message);
	}
}

export class TestTextChannel extends TextChannel {
	constructor(guild: Guild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}

export class TestUser extends User {
	constructor(client: Client<true>, data: RawUserData) {
		super(client, data);
	}
}
