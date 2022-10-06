/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
const Winston = require('winston');

const LOG_FORMAT = Winston.format.combine(
	Winston.format.timestamp(),
	Winston.format.printf( ({ level, message, timestamp, stack, ...extra }) => {
		// Winston appends the error message to the log message by default, even
		// when stack traces are enabled, so we need to manually unappend it.
		// https://github.com/winstonjs/winston/issues/1660?ts=4#issuecomment-569413211
		if (stack) {
			const err = extra[Symbol.for('splat')][0];
			message = message.replace(` ${err.message}`, '') + `\n${stack}`;
		}
		return `${timestamp} [${level}]: ${message}`;
	}),
);

/**
 * Creates a Winston logger with opinionated defaults.
 *
 * If `filename` is omitted, the logger only prints to the console.
 */
function createLogger({
	filename,
	console_level = 'error',
	debug = (process.env.NODE_ENV !== 'production'),
	file_level = 'info',
	override_exception_handler = true,
} = {}) {
	const logger = Winston.createLogger();

	if (filename) {
		logger.add(new Winston.transports.File({
			filename: filename,
			format: LOG_FORMAT,
			level: debug ? 'debug' : file_level,
		}));
	}

	logger.add(new Winston.transports.Console({
		format: Winston.format.combine(
			Winston.format.colorize(),
			LOG_FORMAT,
		),
		level: debug ? 'debug' : console_level,
	}));

	if (override_exception_handler) {
		// Rolling our own unhandled exception and Promise rejection handlers,
		// because Winston's built-in ones kind of suck.
		function errStr(err) {
			return err instanceof Error ? err.stack : err;
		}
		process.on('uncaughtExceptionMonitor', err => logger.error(errStr(err)));
		process.on('unhandledRejection',
			err => logger.error(`Unhandled Promise rejection: ${errStr(err)}`)
		);
	}

	return logger;
}

module.exports = createLogger;
