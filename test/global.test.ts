/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import { expect } from 'chai';

import { GlobalLogger, createLogger } from '../src';

describe(GlobalLogger.name, function() {
	it('Error thrown when accessing undefined global logger', function() {
		expect(() => GlobalLogger.logger).to.throw('No global logger set!');
	});

	it('Global logger accessible globally', function() {
		const test_logger = createLogger();
		GlobalLogger.setGlobalLogger(test_logger);

		expect(GlobalLogger.logger).to.equal(test_logger);
	});
});
