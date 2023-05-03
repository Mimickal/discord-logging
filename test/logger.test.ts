/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import { mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

import { expect } from 'chai';
// @ts-ignore Library isn't written in TypeScript
import stdMocks from 'std-mocks';
import watch from 'node-watch';

import { createLogger, Level } from '../src';

describe(createLogger.name, function() {
	const TEST_DIR = join(__dirname, 'temp');
	const TEST_LOG_FILE = join(TEST_DIR, 'test.log');
	const TEST_LINE = 'This is a test log line';

	//2023-05-02T04:52:52.319Z [info]: This is a test log line
	const LOG_PATTERN = new RegExp(
		`\\d+-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z \\[\\w+\\]: ${TEST_LINE}`
	);

	/** Resolves with log file content once logger flushes to file. */
	async function getLogFileLines(): Promise<string[]> {
		return new Promise<string[]>(resolve => {
			const watcher = watch(TEST_DIR, (evt, _filename) => {
				if (evt === 'update') {
					watcher.close();
					resolve(readFileSync(TEST_LOG_FILE)
						.toString()
						.split('\n')
						.filter(Boolean)
					);
				}
			});

			// File is never created if no lines are written
			setTimeout(() => {
				watcher.close();
				resolve([]);
			}, 500);
		});
	}

	before(function() {
		rmSync(TEST_DIR, { force: true, recursive: true });
		mkdirSync(TEST_DIR, { recursive: true });
	});

	afterEach(function() {
		// Clear temp dir
		rmSync(TEST_LOG_FILE, { force: true });

		// Just to be safe.
		stdMocks.restore();
		stdMocks.flush();
	});

	after(function() {
		rmSync(TEST_DIR, { force: true, recursive: true });
	});

	// Logging is hard to test. There are a few things we can't really test:
	// - Log file is not created when filename is omitted (classic devil's proof).
	// - Unhandled exception / rejected promise logger, because any good test
	//   framework wouldn't let that escape the harness.

	it('Log output matches format', async function() {
		const logger = createLogger({
			filename: TEST_LOG_FILE,
			level_console: Level.none,
		});
		logger.info(TEST_LINE);

		const lines = await getLogFileLines();
		expect(lines   ).to.have.length(1);
		expect(lines[0]).to.match(LOG_PATTERN);
	});

	it('Error output matches format', async function() {
		const logger = createLogger({
			filename: TEST_LOG_FILE,
			level_console: Level.none,
		});
		const test_error = new Error('test error');
		logger.error(TEST_LINE, test_error);

		const lines = await getLogFileLines();
		const first_line = lines.shift();
		const error_string = lines.join('\n');

		expect(lines       ).to.have.length.greaterThan(2);
		expect(first_line  ).to.match(LOG_PATTERN);
		expect(error_string).to.equal(test_error.stack);
	});

	it('Console defaults to "error" and file defaults to "info"', async function() {
		const logger = createLogger({
			filename: TEST_LOG_FILE,
			debug: false,
		});

		stdMocks.use();
		logger.error(TEST_LINE);
		logger.warn(TEST_LINE);
		logger.info(TEST_LINE);
		logger.debug(TEST_LINE);
		stdMocks.restore();

		const console_lines = stdMocks.flush().stdout;
		const file_lines = await getLogFileLines();

		expect(console_lines   ).to.have.length(1);
		expect(console_lines[0]).to.contain('error');
		expect(file_lines      ).to.have.length(3);
		[Level.error, Level.warn, Level.info].forEach((level, idx) => {
			expect(file_lines[idx]).to.contain(level);
		});
	});

	it('Level.none disables output', async function() {
		const logger = createLogger({
			filename: TEST_LOG_FILE,
			level_file: Level.none,
			level_console: Level.none,
		});

		stdMocks.use();
		logger.info(TEST_LINE);
		stdMocks.restore();

		const console_lines = stdMocks.flush().stdout;
		const file_lines = await getLogFileLines();

		expect(console_lines).to.have.length(0);
		expect(file_lines   ).to.have.length(0);
	});

	it('"debug: true" makes file and console print debug', async function() {
		const logger = createLogger({
			filename: TEST_LOG_FILE,
			debug: true,
		});

		stdMocks.use();
		logger.error(TEST_LINE);
		logger.warn(TEST_LINE);
		logger.info(TEST_LINE);
		logger.debug(TEST_LINE);
		stdMocks.restore();

		const console_lines = stdMocks.flush().stdout;
		const file_lines = await getLogFileLines();

		expect(console_lines).to.have.length(4);
		expect(file_lines   ).to.have.length(4);
		[Level.error, Level.warn, Level.info, Level.debug].forEach((level, idx) => {
			expect(console_lines[idx]).to.contain(level);
			expect(file_lines[idx]   ).to.contain(level);
		});
	});
});
