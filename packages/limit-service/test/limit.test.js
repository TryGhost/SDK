// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');
const should = require('should');
const sinon = require('sinon');

const errors = require('./fixtures/errors');
const {MaxLimit, AllowlistLimit, FlagLimit, MaxPeriodicLimit} = require('../lib/limit');

describe('Limit Service', function () {
    describe('Flag Limit', function () {
        it('throws if is over limit when disabled', async function () {
            const config = {
                disabled: true
            };
            const limit = new FlagLimit({name: 'limitFlaggy', config, errors});

            try {
                await limit.errorIfIsOverLimit();
                should.fail(limit, 'Should have errored');
            } catch (err) {
                should.exist(err);
                should.exist(err.errorType);
                should.equal(err.errorType, 'HostLimitError');
                should.exist(err.errorDetails);
                should.equal(err.errorDetails.name, 'limitFlaggy');
                should.exist(err.message);
                should.equal(err.message, 'Your plan does not support flaggy. Please upgrade to enable flaggy.');
            }
        });

        it('throws if would go over limit', async function () {
            const config = {
                disabled: true
            };
            const limit = new FlagLimit({name: 'limitFlaggy', config, errors});

            try {
                await limit.errorIfWouldGoOverLimit();
                should.fail(limit, 'Should have errored');
            } catch (err) {
                should.exist(err);

                should.exist(err.errorType);
                should.equal(err.errorType, 'HostLimitError');

                should.exist(err.errorDetails);
                should.equal(err.errorDetails.name, 'limitFlaggy');

                should.exist(err.message);
                should.equal(err.message, 'Your plan does not support flaggy. Please upgrade to enable flaggy.');
            }
        });

        it('does not throw if feature is in use when currentCountQuery returns true', async function () {
            const config = {
                disabled: true,
                currentCountQuery: () => true
            };
            const limit = new FlagLimit({name: 'flaggy', config, errors});

            const result = await limit.errorIfIsOverLimit();
            should(result).be.undefined();
        });

        it('throws if feature is not in use when currentCountQuery returns false', async function () {
            const config = {
                disabled: true,
                currentCountQuery: () => false
            };
            const limit = new FlagLimit({name: 'limitFlaggy', config, errors});

            try {
                await limit.errorIfIsOverLimit();
                should.fail(limit, 'Should have errored');
            } catch (err) {
                should.exist(err);
                should.equal(err.errorType, 'HostLimitError');
            }
        });

        it('calls currentCountQuery with transacting option', async function () {
            const currentCountQueryStub = sinon.stub().resolves(true);
            const config = {
                disabled: true,
                currentCountQuery: currentCountQueryStub
            };
            const db = {
                knex: 'connection'
            };
            const limit = new FlagLimit({name: 'flaggy', config, db, errors});
            const transaction = 'transaction';

            await limit.errorIfIsOverLimit({transacting: transaction});
            
            sinon.assert.calledOnce(currentCountQueryStub);
            sinon.assert.calledWithExactly(currentCountQueryStub, transaction);
        });

        it('errorIfWouldGoOverLimit behaves the same as errorIfIsOverLimit', async function () {
            const config = {
                disabled: true,
                currentCountQuery: () => true
            };
            const limit = new FlagLimit({name: 'flaggy', config, errors});

            // Should not throw when feature is in use
            const result = await limit.errorIfWouldGoOverLimit();
            should(result).be.undefined();

            // Should throw when feature is not in use
            const config2 = {
                disabled: true,
                currentCountQuery: () => false
            };
            const limit2 = new FlagLimit({name: 'limitFlaggy', config: config2, errors});

            try {
                await limit2.errorIfWouldGoOverLimit();
                should.fail(limit2, 'Should have errored');
            } catch (err) {
                should.exist(err);
                should.equal(err.errorType, 'HostLimitError');
            }
        });
    });

    describe('Max Limit', function () {
        describe('Constructor', function () {
            it('passes if within the limit and custom currentCount overriding currentCountQuery', async function () {
                const config = {
                    max: 5,
                    error: 'You have gone over the limit',
                    currentCountQuery: function () {
                        throw new Error('Should not be called');
                    }
                };

                try {
                    const limit = new MaxLimit({name: '', config, errors});
                    await limit.errorIfIsOverLimit({currentCount: 4});
                } catch (error) {
                    should.fail('Should have not errored', error);
                }
            });

            it('throws if initialized without a max limit', function () {
                const config = {};

                try {
                    const limit = new MaxLimit({name: 'no limits!', config, errors});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);
                    should.exist(err.errorType);
                    should.equal(err.errorType, 'IncorrectUsageError');
                    err.message.should.match(/max limit without a limit/);
                }
            });

            it('throws if initialized without a current count query', function () {
                const config = {
                    max: 100
                };

                try {
                    const limit = new MaxLimit({name: 'no accountability!', config, errors});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);
                    should.exist(err.errorType);
                    should.equal(err.errorType, 'IncorrectUsageError');
                    err.message.should.match(/max limit without a current count query/);
                }
            });

            it('throws when would go over the limit and custom currentCount overriding currentCountQuery', async function () {
                const _5MB = 5000000;
                const config = {
                    max: _5MB,
                    formatter: count => `${count / 1000000}MB`,
                    error: 'You have exceeded the maximum file size {{ max }}',
                    currentCountQuery: function () {
                        throw new Error('Should not be called');
                    }
                };

                try {
                    const limit = new MaxLimit({
                        name: 'fileSize',
                        config,
                        errors
                    });
                    const _10MB = 10000000;

                    await limit.errorIfIsOverLimit({currentCount: _10MB});
                } catch (error) {
                    error.errorType.should.equal('HostLimitError');
                    error.errorDetails.name.should.equal('fileSize');
                    error.errorDetails.limit.should.equal(5000000);
                    error.errorDetails.total.should.equal(10000000);
                    error.message.should.equal('You have exceeded the maximum file size 5MB');
                }
            });
        });

        describe('Is over limit', function () {
            it('throws if is over the limit', async function () {
                const config = {
                    max: 3,
                    currentCountQuery: () => 42
                };
                const limit = new MaxLimit({name: 'maxy', config, errors});

                try {
                    await limit.errorIfIsOverLimit();
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);

                    should.exist(err.errorType);
                    should.equal(err.errorType, 'HostLimitError');

                    should.exist(err.errorDetails);
                    should.equal(err.errorDetails.name, 'maxy');

                    should.exist(err.message);
                    should.equal(err.message, 'This action would exceed the maxy limit on your current plan.');
                }
            });

            it('passes if does not go over the limit', async function () {
                const config = {
                    max: 1,
                    currentCountQuery: () => 1
                };

                const limit = new MaxLimit({name: 'maxy', config, errors});

                await limit.errorIfIsOverLimit();
            });

            it('ignores default configured max limit when it is passed explicitly', async function () {
                const config = {
                    max: 10,
                    currentCountQuery: () => 10
                };

                const limit = new MaxLimit({name: 'maxy', config, errors});

                // should pass as the limit is exactly on the limit 10 >= 10
                await limit.errorIfIsOverLimit({max: 10});

                try {
                    // should fail because limit is overridden to 10 < 9
                    await limit.errorIfIsOverLimit({max: 9});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);

                    should.exist(err.errorType);
                    should.equal(err.errorType, 'HostLimitError');

                    should.exist(err.errorDetails);
                    should.equal(err.errorDetails.name, 'maxy');

                    should.exist(err.message);
                    should.equal(err.message, 'This action would exceed the maxy limit on your current plan.');
                }
            });
        });

        describe('Would go over limit', function () {
            it('throws if would go over the limit', async function () {
                const config = {
                    max: 1,
                    currentCountQuery: () => 1
                };
                const limit = new MaxLimit({name: 'maxy', config, errors});

                try {
                    await limit.errorIfWouldGoOverLimit();
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);

                    should.exist(err.errorType);
                    should.equal(err.errorType, 'HostLimitError');

                    should.exist(err.errorDetails);
                    should.equal(err.errorDetails.name, 'maxy');

                    should.exist(err.message);
                    should.equal(err.message, 'This action would exceed the maxy limit on your current plan.');
                }
            });

            it('throws if would go over the limit with with custom added count', async function () {
                const config = {
                    max: 23,
                    currentCountQuery: () => 13
                };
                const limit = new MaxLimit({name: 'maxy', config, errors});

                try {
                    await limit.errorIfWouldGoOverLimit({addedCount: 11});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);

                    should.exist(err.errorType);
                    should.equal(err.errorType, 'HostLimitError');

                    should.exist(err.errorDetails);
                    should.equal(err.errorDetails.name, 'maxy');

                    should.exist(err.message);
                    should.equal(err.message, 'This action would exceed the maxy limit on your current plan.');
                }
            });

            it('passes if does not go over the limit', async function () {
                const config = {
                    max: 2,
                    currentCountQuery: () => 1
                };

                const limit = new MaxLimit({name: 'maxy', config, errors});

                await limit.errorIfWouldGoOverLimit();
            });

            it('ignores default configured max limit when it is passed explicitly', async function () {
                const config = {
                    max: 10,
                    currentCountQuery: () => 10
                };

                const limit = new MaxLimit({name: 'maxy', config, errors});

                // should pass as the limit is overridden to 10 + 1 = 11
                await limit.errorIfWouldGoOverLimit({max: 11});

                try {
                    // should fail because limit is overridden to 10 + 1 < 1
                    await limit.errorIfWouldGoOverLimit({max: 1});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);

                    should.exist(err.errorType);
                    should.equal(err.errorType, 'HostLimitError');

                    should.exist(err.errorDetails);
                    should.equal(err.errorDetails.name, 'maxy');

                    should.exist(err.message);
                    should.equal(err.message, 'This action would exceed the maxy limit on your current plan.');
                }
            });
        });

        describe('Transactions', function () {
            it('passes undefined if no db or transacting option passed', async function () {
                const config = {
                    max: 5,
                    error: 'You have gone over the limit',
                    currentCountQuery: sinon.stub()
                };

                config.currentCountQuery.resolves(0);

                try {
                    const limit = new MaxLimit({name: '', config, errors});
                    await limit.errorIfIsOverLimit();
                    await limit.errorIfWouldGoOverLimit();
                } catch (error) {
                    should.fail('Should have not errored', error);
                }

                sinon.assert.calledTwice(config.currentCountQuery);
                sinon.assert.alwaysCalledWithExactly(config.currentCountQuery, undefined);
            });

            it('passes default db if no transacting option passed', async function () {
                const config = {
                    max: 5,
                    error: 'You have gone over the limit',
                    currentCountQuery: sinon.stub()
                };

                const db = {
                    knex: 'This is our connection'
                };
                config.currentCountQuery.resolves(0);

                try {
                    const limit = new MaxLimit({name: '', config, db, errors});
                    await limit.errorIfIsOverLimit();
                    await limit.errorIfWouldGoOverLimit();
                } catch (error) {
                    should.fail('Should have not errored', error);
                }

                sinon.assert.calledTwice(config.currentCountQuery);
                sinon.assert.alwaysCalledWithExactly(config.currentCountQuery, db.knex);
            });

            it('passes transacting option', async function () {
                const config = {
                    max: 5,
                    error: 'You have gone over the limit',
                    currentCountQuery: sinon.stub()
                };

                const db = {
                    knex: 'This is our connection'
                };
                const transaction = 'Our transaction';
                config.currentCountQuery.resolves(0);

                try {
                    const limit = new MaxLimit({name: '', config, db, errors});
                    await limit.errorIfIsOverLimit({transacting: transaction});
                    await limit.errorIfWouldGoOverLimit({transacting: transaction});
                } catch (error) {
                    should.fail('Should have not errored', error);
                }

                sinon.assert.calledTwice(config.currentCountQuery);
                sinon.assert.alwaysCalledWithExactly(config.currentCountQuery, transaction);
            });
        });
    });

    describe('Periodic Max Limit', function () {
        describe('Constructor', function () {
            it('throws if initialized without a maxPeriodic limit', function () {
                const config = {};

                try {
                    const limit = new MaxPeriodicLimit({name: 'no limits!', config, errors});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);
                    should.exist(err.errorType);
                    should.equal(err.errorType, 'IncorrectUsageError');
                    err.message.should.match(/periodic max limit without a limit/gi);
                }
            });

            it('throws if initialized without a current count query', function () {
                const config = {
                    maxPeriodic: 100
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'no accountability!', config, errors});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);
                    should.exist(err.errorType);
                    should.equal(err.errorType, 'IncorrectUsageError');
                    err.message.should.match(/periodic max limit without a current count query/gi);
                }
            });

            it('throws if initialized without interval', function () {
                const config = {
                    maxPeriodic: 100,
                    currentCountQuery: () => {}
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'no accountability!', config, errors});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);
                    should.exist(err.errorType);
                    should.equal(err.errorType, 'IncorrectUsageError');
                    err.message.should.match(/periodic max limit without an interval/gi);
                }
            });

            it('throws if initialized with unsupported interval', function () {
                const config = {
                    maxPeriodic: 100,
                    currentCountQuery: () => {},
                    interval: 'week'
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'no accountability!', config, errors});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);
                    should.exist(err.errorType);
                    should.equal(err.errorType, 'IncorrectUsageError');
                    err.message.should.match(/periodic max limit without unsupported interval. Please specify one of: month/gi);
                }
            });

            it('throws if initialized without start date', function () {
                const config = {
                    maxPeriodic: 100,
                    currentCountQuery: () => {},
                    interval: 'month'
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'no accountability!', config, errors});
                    should.fail(limit, 'Should have errored');
                } catch (err) {
                    should.exist(err);
                    should.exist(err.errorType);
                    should.equal(err.errorType, 'IncorrectUsageError');
                    err.message.should.match(/periodic max limit without a start date/gi);
                }
            });
        });

        describe('Is over limit', function () {
            it('throws if is over the limit', async function () {
                const currentCountyQueryMock = sinon.mock().returns(11);

                const config = {
                    maxPeriodic: 3,
                    error: 'You have exceeded the number of emails you can send within your billing period.',
                    interval: 'month',
                    startDate: '2021-01-01T00:00:00Z',
                    currentCountQuery: currentCountyQueryMock
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'mailguard', config, errors});
                    await limit.errorIfIsOverLimit();
                } catch (error) {
                    error.errorType.should.equal('HostLimitError');
                    error.errorDetails.name.should.equal('mailguard');
                    error.errorDetails.limit.should.equal(3);
                    error.errorDetails.total.should.equal(11);

                    currentCountyQueryMock.callCount.should.equal(1);
                    should(currentCountyQueryMock.args).not.be.undefined();
                    should(currentCountyQueryMock.args[0][0]).be.undefined(); //knex db connection

                    const nowDate = new Date();
                    const startOfTheMonthDate = new Date(Date.UTC(
                        nowDate.getUTCFullYear(),
                        nowDate.getUTCMonth()
                    )).toISOString();

                    currentCountyQueryMock.args[0][1].should.equal(startOfTheMonthDate);
                }
            });
        });

        describe('Would go over limit', function () {
            it('passes if within the limit', async function () {
                const currentCountyQueryMock = sinon.mock().returns(4);

                const config = {
                    maxPeriodic: 5,
                    error: 'You have exceeded the number of emails you can send within your billing period.',
                    interval: 'month',
                    startDate: '2021-01-01T00:00:00Z',
                    currentCountQuery: currentCountyQueryMock
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'mailguard', config, errors});
                    await limit.errorIfWouldGoOverLimit();
                } catch (error) {
                    should.fail('MaxPeriodicLimit errorIfWouldGoOverLimit check should not have errored');
                }
            });

            it('throws if would go over limit', async function () {
                const currentCountyQueryMock = sinon.mock().returns(5);

                const config = {
                    maxPeriodic: 5,
                    error: 'You have exceeded the number of emails you can send within your billing period.',
                    interval: 'month',
                    startDate: '2021-01-01T00:00:00Z',
                    currentCountQuery: currentCountyQueryMock
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'mailguard', config, errors});
                    await limit.errorIfWouldGoOverLimit();
                } catch (error) {
                    error.errorType.should.equal('HostLimitError');
                    error.errorDetails.name.should.equal('mailguard');
                    error.errorDetails.limit.should.equal(5);
                    error.errorDetails.total.should.equal(5);

                    currentCountyQueryMock.callCount.should.equal(1);
                    should(currentCountyQueryMock.args).not.be.undefined();
                    should(currentCountyQueryMock.args[0][0]).be.undefined(); //knex db connection

                    const nowDate = new Date();
                    const startOfTheMonthDate = new Date(Date.UTC(
                        nowDate.getUTCFullYear(),
                        nowDate.getUTCMonth()
                    )).toISOString();

                    currentCountyQueryMock.args[0][1].should.equal(startOfTheMonthDate);
                }
            });

            it('throws if would go over limit with custom added count', async function () {
                const currentCountyQueryMock = sinon.mock().returns(5);

                const config = {
                    maxPeriodic: 13,
                    error: 'You have exceeded the number of emails you can send within your billing period.',
                    interval: 'month',
                    startDate: '2021-01-01T00:00:00Z',
                    currentCountQuery: currentCountyQueryMock
                };

                try {
                    const limit = new MaxPeriodicLimit({name: 'mailguard', config, errors});
                    await limit.errorIfWouldGoOverLimit({addedCount: 9});
                } catch (error) {
                    error.errorType.should.equal('HostLimitError');
                    error.errorDetails.name.should.equal('mailguard');
                    error.errorDetails.limit.should.equal(13);
                    error.errorDetails.total.should.equal(5);

                    currentCountyQueryMock.callCount.should.equal(1);
                    should(currentCountyQueryMock.args).not.be.undefined();
                    should(currentCountyQueryMock.args[0][0]).be.undefined(); //knex db connection

                    const nowDate = new Date();
                    const startOfTheMonthDate = new Date(Date.UTC(
                        nowDate.getUTCFullYear(),
                        nowDate.getUTCMonth()
                    )).toISOString();

                    currentCountyQueryMock.args[0][1].should.equal(startOfTheMonthDate);
                }
            });
        });

        describe('Transactions', function () {
            it('passes undefined if no db or transacting option passed', async function () {
                const config = {
                    maxPeriodic: 5,
                    error: 'You have exceeded the number of emails you can send within your billing period.',
                    interval: 'month',
                    startDate: '2021-01-01T00:00:00Z',
                    currentCountQuery: sinon.stub()
                };

                config.currentCountQuery.resolves(0);

                try {
                    const limit = new MaxPeriodicLimit({name: 'mailguard', config, errors});
                    await limit.errorIfIsOverLimit();
                    await limit.errorIfWouldGoOverLimit();
                } catch (error) {
                    should.fail('Should have not errored', error);
                }

                sinon.assert.calledTwice(config.currentCountQuery);
                sinon.assert.alwaysCalledWith(config.currentCountQuery, undefined);
            });

            it('passes default db if no transacting option passed', async function () {
                const config = {
                    maxPeriodic: 5,
                    error: 'You have exceeded the number of emails you can send within your billing period.',
                    interval: 'month',
                    startDate: '2021-01-01T00:00:00Z',
                    currentCountQuery: sinon.stub()
                };

                const db = {
                    knex: 'This is our connection'
                };
                config.currentCountQuery.resolves(0);

                try {
                    const limit = new MaxPeriodicLimit({name: 'mailguard', config, db, errors});
                    await limit.errorIfIsOverLimit();
                    await limit.errorIfWouldGoOverLimit();
                } catch (error) {
                    should.fail('Should have not errored', error);
                }

                sinon.assert.calledTwice(config.currentCountQuery);
                sinon.assert.alwaysCalledWith(config.currentCountQuery, db.knex);
            });

            it('passes transacting option', async function () {
                const config = {
                    maxPeriodic: 5,
                    error: 'You have exceeded the number of emails you can send within your billing period.',
                    interval: 'month',
                    startDate: '2021-01-01T00:00:00Z',
                    currentCountQuery: sinon.stub()
                };

                const db = {
                    knex: 'This is our connection'
                };
                const transaction = 'Our transaction';
                config.currentCountQuery.resolves(0);

                try {
                    const limit = new MaxPeriodicLimit({name: 'mailguard', config, db, errors});
                    await limit.errorIfIsOverLimit({transacting: transaction});
                    await limit.errorIfWouldGoOverLimit({transacting: transaction});
                } catch (error) {
                    should.fail('Should have not errored', error);
                }

                sinon.assert.calledTwice(config.currentCountQuery);
                sinon.assert.alwaysCalledWith(config.currentCountQuery, transaction);
            });
        });
    });

    describe('Allowlist limit', function () {
        it('rejects when the allowlist config isn\'t specified', async function () {
            try {
                new AllowlistLimit({name: 'test', config: {}, errors});
                throw new Error('Should have failed earlier...');
            } catch (error) {
                error.errorType.should.equal('IncorrectUsageError');
                error.message.should.match(/allowlist limit without an allowlist/);
            }
        });

        it('accept correct values', async function () {
            const limit = new AllowlistLimit({name: 'test', config: {
                allowlist: ['test', 'ok']
            }, errors});

            await limit.errorIfIsOverLimit({value: 'test'});
        });

        it('rejects unknown values', async function () {
            const limit = new AllowlistLimit({name: 'test', config: {
                allowlist: ['test', 'ok']
            }, errors});

            try {
                await limit.errorIfIsOverLimit({value: 'unknown value'});
                throw new Error('Should have failed earlier...');
            } catch (error) {
                error.errorType.should.equal('HostLimitError');
            }
        });
    });
});
