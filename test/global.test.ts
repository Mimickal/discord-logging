/*******************************************************************************
 * This file is part of @mimickal/discord-logging, a Discord.js logging library.
 * Copyright (C) 2022 Mimickal (Mia Moretti).
 *
 * @mimickal/discord-logging is free software under the
 * GNU Lesser General Public License v3.0. See LICENSE.md or
 * <https://www.gnu.org/licenses/lgpl-3.0.en.html> for more information.
 ******************************************************************************/
import { expect } from 'chai';
// @ts-ignore Library isn't written in TypeScript
import stdMocks from 'std-mocks';

import { GlobalLogger, createLogger } from '../src';

describe(GlobalLogger.name, function() {
	afterEach(function() {
		// Just to be safe.
		stdMocks.restore();
		stdMocks.flush();
	});

	it('Undefined global logger does a no-op gracefully', function() {
		GlobalLogger.setGlobalLogger(undefined);

		stdMocks.use();
		GlobalLogger.logger.info('Test message');
		stdMocks.restore();

		expect(stdMocks.flush().stdout).to.be.empty;
	});

	it('Global logger accessible globally', function() {
		const test_logger = createLogger();
		GlobalLogger.setGlobalLogger(test_logger);

		expect(GlobalLogger.logger).to.equal(test_logger);
	});
});
