/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import { expect } from 'chai';
import {
	APIUser,
	Application,
	ApplicationCommandOptionType,
	ButtonInteraction,
	Client,
	ChannelType,
	ChatInputCommandInteraction,
	ComponentType,
	Guild,
	GuildBan,
	GuildMember,
	InteractionType,
	Message,
	MessageReaction,
	MessageType,
	Role,
	TextChannel,
	User,
} from 'discord.js';
import { RawUserData } from 'discord.js/typings/rawDataTypes';

import {
	TestApplication,
	TestChatInputCommandInteraction,
	TestClientUser,
	TestEmoji,
	TestGuild,
	TestGuildBan,
	TestMessage,
	TestMessageReaction,
	TestTextChannel,
	TestUser,
} from './classes';
import {
	asLines,
	detail,
	loginMsg,
	startupMsg,
	stringify,
	unindent,
} from '../src'; // Tests package exports are set up properly.

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

it(loginMsg.name, function() {
	const data: RawUserData = {
		id: 'test_user_id',
		username: 'test_bot_username',
		discriminator: '1234',
	};
	const test_user = new TestClientUser(new Client<true>({ intents: [] }), data);

	expect(loginMsg(test_user)).to.equal(
		`Logged in as ${data.username}#${data.discriminator} (${test_user.id})`
	);
});

describe(startupMsg.name, function() {
	const version = 'test_version';
	const config = {
		aaa: 123,
		bbb: true,
		ccc: 'hi'
	};

	it('No config', function() {
		expect(startupMsg(version)).to.equal(`Bot is starting version ${version}`);
	});

	it('Config with normal keys', function() {
		expect(startupMsg(version, config)).to.equal(
			`Bot is starting version ${version} with config ${JSON.stringify(config)}`
		);
	});

	it('Config with redacted keys', function() {
		const sensitiveConfig = {
			mySecret: 'this is a secret',
			...config,
			token: 'this is a token',
			PASSWORD: 'this is a password',
		};

		expect(startupMsg(version, sensitiveConfig)).to.equal(
			`Bot is starting version ${version} with config ${JSON.stringify({
				mySecret: '<REDACTED>',
				...config,
				token: '<REDACTED>',
				PASSWORD: '<REDACTED>',
			})}`
		);
	});
});

describe(stringify.name, function() {
	const app_id = 'test_app_id';
	const app_name = 'My Cool Test App';
	const button_id = 'test_button_id';
	const channel_id = 'test_channel_id';
	const emoji_id = 'test_emoji_id';
	// Needs to be a realish ID so Snowflake can extract a timestamp from it.
	const message_id = '1028556214147223623';
	const guild_id = 'test_guild_id';
	const user_id = 'test_user_id';

	const test_client = new Client({ intents: [] });
	const test_app = new TestApplication(test_client, { id: app_id, name: app_name });
	const test_emoji = new TestEmoji(test_client, { id: emoji_id, name: 'emoji' });
	const test_guild = new TestGuild(test_client, { id: guild_id, unavailable: false });
	const test_channel = new TestTextChannel(test_guild, {
		id: channel_id,
		name: 'test_channel',
		type: ChannelType.GuildText,
	});
	const test_user = new TestUser(test_client, { id: user_id, username: 'test_username' });
	const test_message = new TestMessage(test_client, {
		id: message_id,
		channel_id,
		author: {
			...test_user,
			flags: undefined,
		},
		attachments: [],
		content: '',
		edited_timestamp: null,
		embeds: [],
		mentions: [],
		mention_everyone: false,
		mention_roles: [],
		pinned: false,
		timestamp: '',
		tts: false,
		type: MessageType.Default,
		// @ts-expect-error hack to change channel ID in stringify
		guild_id,
	});
	const test_api_user: APIUser = {
		avatar: null,
		discriminator: 'test_disc',
		id: user_id,
		username: 'test_username',
	};
	const test_react = new TestMessageReaction(
		test_client, {
			// Can't pass test_emoji in directly for some reason
			emoji: { id: test_emoji.id, name: test_emoji.name },
			count: 0,
			me: false,
		}, test_message
	);
	// @ts-expect-error One large hack to make this pass as a button interaction.
	// I have no idea how to do this while satisfying TypeScript.
	const test_button = new ButtonInteraction(test_client, {
		user: test_user,
		message: { id: message_id, channel_id },
		data: {
			component_type: ComponentType.Button,
			custom_id: button_id,
		},
		type: InteractionType.MessageComponent,
	});
	const test_ban = new TestGuildBan(test_client, {
		guild_id,
		user: test_api_user,
	}, test_guild);
	const test_command = new TestChatInputCommandInteraction(test_client, {
		user: test_api_user,
		guild_id,
		// @ts-expect-error hack to get these names in the string output.
		data: {
			name: 'testname',
			options: [{
				type: ApplicationCommandOptionType.SubcommandGroup,
				name: 'subgroup',
				options: [{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'subname',
				}],
			}],
		},
	});

	test_client.guilds.cache.set(guild_id, test_guild);

	it(Application.name, function() {
		expect(stringify(test_app)).to.equal(`Application ${app_id}`);
	});

	it(ButtonInteraction.name, function() {
		expect(stringify(test_button)).to.equal(`Button "${button_id}"`);
	});

	it(ChatInputCommandInteraction.name, function() {
		expect(stringify(test_command))
			.to.equal('Command "testname subgroup subname"');
	});

	it(TextChannel.name, function() {
		expect(stringify(test_channel))
			.to.equal(`Channel ${channel_id}`);
	});

	it('Emoji (built-in)', function() {
		expect(stringify('🦊')).to.equal('Emoji 🦊');
	});

	it('Emoji (object)', function() {
		expect(stringify(test_emoji)).to.equal(`Emoji ${emoji_id}`);
	});

	it(Guild.name, function() {
		expect(stringify(test_guild)).to.equal(`Guild ${guild_id}`);
	});

	it(GuildBan.name, function() {
		expect(stringify(test_ban)).to.equal(`Ban of User ${user_id} in Guild ${guild_id}`);
	});

	it(GuildMember.name, function() {
		// @ts-ignore
		const member = new GuildMember(
			test_client, { user: test_user }, test_guild
		);
		expect(stringify(member)).to.equal(`User ${user_id}`);
	});

	it(Message.name, function() {
		expect(stringify(test_message)).to.equal(
			`Message https://discord.com/channels/${guild_id}/${channel_id}/${message_id}`
		);
	});

	it(MessageReaction.name, function() {
		expect(stringify(test_react)).to.equal(`Reaction ${emoji_id}`);
	});

	it(Role.name, function() {
		const id = 'test_role_id';
		// @ts-ignore
		const role = new Role(test_client, { id }, test_guild);
		expect(stringify(role)).to.equal(`Role ${id}`);
	});

	it(User.name, function() {
		expect(stringify(test_user)).to.equal(`User ${user_id}`);
	});

	it('undefined', function() {
		expect(stringify(undefined)).to.equal('[undefined]');
	});

	it('null', function() {
		expect(stringify(null)).to.equal('[null]');
	});

	it('number', function() {
		expect(stringify(1234)).to.equal('1234');
	});

	it('string (that looks like an ID)', function() {
		const id = '1028556214147223623';
		expect(stringify(id)).to.equal(id);
	});

	it('Array of things', function() {
		expect(stringify([test_emoji, test_user, 'hello'])).to.equal(
			`Emoji ${emoji_id}, User ${user_id}, hello`
		);
	});

	it('Arbitrary data', function() {
		const nonsense = {
			something: 'test',
			other: 'thing',
		};
		expect(stringify(nonsense)).to.equal(JSON.stringify(nonsense));
	});

	it(BigInt.name, function() {
		const num_str = '123456789123456789123456789';
		expect(stringify(BigInt(num_str))).to.equal(num_str);
	});

	it('Gracefully handles things that cannot be serialized', function() {
		const weird_thing = {
			something: 'test',
			bad_field: BigInt('123456789'),
		};
		expect(stringify(weird_thing)).to.equal('[MissingNo.]');
	});

	describe(detail.name, function() {
		it(Application.name, function() {
			expect(detail(test_app)).to.equal(
				`Application "${app_name}" (${app_id})`
			);
		});

		it(ChatInputCommandInteraction.name, function() {
			expect(detail(test_command)).to.equal(
				`Guild ${guild_id} User ${user_id} Command "testname subgroup subname"`
			);
		});

		it(MessageReaction.name, function() {
			expect(detail(test_react)).to.equal(
				`Reaction ${emoji_id} on Message https://discord.com/channels/${guild_id}/${channel_id}/${message_id}`
			);
		});

		it(`Falls back on ${stringify.name}`, function() {
			expect(detail(test_user)).to.equal(stringify(test_user));

			expect(detail(null)).to.equal('[null]');
		});
	});
});
});
