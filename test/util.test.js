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
	ApplicationCommandOptionType,
	Client,
	ChatInputCommandInteraction,
	Emoji,
	Guild,
	GuildMember,
	Message,
	MessageReaction,
	Role,
	User,
} = require('discord.js');

const {
	asLines,
	detail,
	stringify,
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

describe(stringify.name, function() {
	const channel_id = 'test_channel_id';
	const emoji_id = 'test_emoji_id';
	// Needs to be a realish ID so Snowflake can extract a timestamp from it.
	const message_id = '1028556214147223623';
	const guild_id = 'test_guild_id';
	const user_id = 'test_user_id';

	const test_client = new Client({ intents: [] });
	const test_emoji = new Emoji(test_client, { id: emoji_id });
	const test_guild = new Guild(test_client, { id: guild_id });
	const test_message = new Message(test_client, {
		id: message_id,
		channel_id,
		guild_id,
	});
	const test_react = new MessageReaction(
		test_client, { emoji: test_emoji }, test_message
	);
	const test_user = new User(test_client, { id: user_id });
	const test_command = new ChatInputCommandInteraction(test_client, {
		user: test_user,
		guild_id,
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

	it(ChatInputCommandInteraction.name, function() {
		expect(stringify(test_command))
			.to.equal('Command "testname subgroup subname"');
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

	it(GuildMember.name, function() {
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

	describe(detail.name, function() {
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
		});
	});
});
});
