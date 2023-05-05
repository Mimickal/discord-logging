/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import { Logger, createLogger } from 'winston';

export default class GlobalLogger {
	static readonly #NO_OP_LOGGER: Logger = createLogger();
	static #_logger: Logger | undefined;

	static get logger(): Logger {
		return GlobalLogger.#_logger ?? GlobalLogger.#NO_OP_LOGGER;
	}

	static setGlobalLogger(logger: Logger | undefined): void {
		GlobalLogger.#_logger = logger;
	}
}
