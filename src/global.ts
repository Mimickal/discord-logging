/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import { Logger } from 'winston';

export default class GlobalLogger {
	static #_logger: Logger | undefined;

	static get logger(): Logger {
		if (!GlobalLogger.#_logger) {
			throw new Error('No global logger set!');
		}
		return GlobalLogger.#_logger;
	}

	static setGlobalLogger(logger: Logger | undefined): void {
		GlobalLogger.#_logger = logger;
	}
}
