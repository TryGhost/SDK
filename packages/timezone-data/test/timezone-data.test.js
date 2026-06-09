require('./utils');
const {getGMTOffset, timezoneDataWithGMTOffset} = require('../');
const timezoneData = require('../').default;

describe('timezone-data', function () {
    let clock;

    afterEach(function () {
        if (clock) {
            clock.restore();
            clock = null;
        }
    });

    describe('default export (static data)', function () {
        it('exports an array', function () {
            timezoneData.should.be.an.Array();
        });

        it('contains the expected number of timezones', function () {
            timezoneData.length.should.be.above(60);
        });

        it('each entry has name and label properties', function () {
            timezoneData.forEach((tz) => {
                tz.name.should.be.a.String();
                tz.label.should.be.a.String();
                tz.name.should.not.be.empty();
                tz.label.should.not.be.empty();
            });
        });

        it('all names are valid IANA-style timezone identifiers', function () {
            timezoneData.forEach((tz) => {
                tz.name.should.match(/^[A-Za-z]+(?:\/[A-Za-z_]+)+$/);
            });
        });

        it('labels do not contain a hardcoded GMT offset', function () {
            // Offsets are derived at runtime via timezoneDataWithGMTOffset(), so the
            // static labels must not carry a (GMT ...) prefix of their own.
            timezoneData.forEach((tz) => {
                tz.label.should.not.match(/\(GMT[^)]*\)/);
            });
        });

        it('has no duplicate names', function () {
            const names = timezoneData.map(tz => tz.name);
            const unique = [...new Set(names)];
            unique.length.should.equal(names.length);
        });

        // Intentional snapshot: the static array is ordered by GMT offset and these
        // boundary entries should only change if the dataset is deliberately edited.
        it('starts with Pacific/Pago_Pago (most negative offset)', function () {
            timezoneData[0].name.should.equal('Pacific/Pago_Pago');
        });

        it('ends with Pacific/Kwajalein (most positive offset)', function () {
            timezoneData[timezoneData.length - 1].name.should.equal('Pacific/Kwajalein');
        });

        it('contains common timezones', function () {
            const names = timezoneData.map(tz => tz.name);
            names.should.containEql('Etc/UTC');
            names.should.containEql('America/New_York');
            names.should.containEql('Europe/Dublin');
            names.should.containEql('Asia/Tokyo');
            names.should.containEql('Australia/Sydney');
        });
    });

    describe('getGMTOffset', function () {
        it('should return an object with offsetString and offsetMinutes properties', function () {
            const result = getGMTOffset('Etc/UTC');
            result.should.be.an.Object();
            result.should.have.properties(['offsetString', 'offsetMinutes']);
        });

        it('should return the correct offset for Etc/UTC', function () {
            const result = getGMTOffset('Etc/UTC');
            result.should.be.an.Object();
            result.offsetMinutes.should.equal(0);
            result.offsetString.should.equal('GMT');
        });

        it('should handle timezone with negative offset', function () {
            const result = getGMTOffset('America/Phoenix');
            result.should.be.an.Object();
            result.offsetMinutes.should.equal(-420);
            result.offsetString.should.equal('GMT -7:00');
        });

        it('should handle timezone with half-hour offset like Asia/Kolkata', function () {
            const result = getGMTOffset('Asia/Kolkata');
            result.should.be.an.Object();
            result.offsetMinutes.should.equal(330);
            result.offsetString.should.equal('GMT +5:30');
        });

        it('should handle invalid timezone gracefully', function () {
            const result = getGMTOffset('Invalid/Timezone');
            result.should.be.an.Object();
            result.should.have.properties(['offsetString', 'offsetMinutes']);
            (result.offsetString === null).should.be.true();
            result.offsetMinutes.should.equal(0);
        });

        it('should handle a missing timeZoneName part gracefully', function () {
            // Defensive path: formatToParts returns no timeZoneName part
            const stub = sinon.stub(Intl.DateTimeFormat.prototype, 'formatToParts').returns([
                {type: 'literal', value: ''}
            ]);

            try {
                const result = getGMTOffset('Etc/UTC');
                (result.offsetString === null).should.be.true();
                result.offsetMinutes.should.equal(0);
            } finally {
                stub.restore();
            }
        });

        it('should fall back to the raw timeZoneName when it is not a parseable offset', function () {
            // Defensive path: formatToParts returns a timeZoneName that doesn't
            // match the expected "GMT±HH:MM" shape (some Intl/ICU builds emit a
            // bare "GMT" for a zero offset). We surface it verbatim with a zero offset.
            const stub = sinon.stub(Intl.DateTimeFormat.prototype, 'formatToParts').returns([
                {type: 'timeZoneName', value: 'GMT'}
            ]);

            try {
                const result = getGMTOffset('Etc/UTC');
                result.offsetString.should.equal('GMT');
                result.offsetMinutes.should.equal(0);
            } finally {
                stub.restore();
            }
        });

        it('should provide consistent results for non-DST timezone', function () {
            clock = sinon.useFakeTimers(new Date('2024-07-01T12:00:00Z'));
            const summerResult = getGMTOffset('America/Phoenix');
            clock.restore();

            clock = sinon.useFakeTimers(new Date('2024-12-01T12:00:00Z'));
            const winterResult = getGMTOffset('America/Phoenix');

            // Arizona doesn't observe DST
            winterResult.offsetMinutes.should.equal(summerResult.offsetMinutes);
        });

        it('should detect DST changes for timezone that observes DST', function () {
            clock = sinon.useFakeTimers(new Date('2024-12-01T12:00:00Z')); // Winter
            const winterResult = getGMTOffset('America/New_York');
            clock.restore();

            clock = sinon.useFakeTimers(new Date('2024-07-01T12:00:00Z')); // Summer
            const summerResult = getGMTOffset('America/New_York');

            // Summer is 1 hour ahead of winter
            (summerResult.offsetMinutes - winterResult.offsetMinutes).should.equal(60);
            summerResult.offsetString.should.equal('GMT -4:00');
            summerResult.offsetMinutes.should.equal(-240);
            winterResult.offsetString.should.equal('GMT -5:00');
            winterResult.offsetMinutes.should.equal(-300);
        });
    });

    describe('timezoneDataWithGMTOffset', function () {
        it('should return an array of timezone data with GMT offsets', function () {
            const result = timezoneDataWithGMTOffset();

            result.should.be.an.Array();
            result.length.should.equal(timezoneData.length);

            result.forEach((item) => {
                item.should.have.properties(['name', 'label', 'offsetMinutes']);
            });
        });

        it('should include GMT offset in labels', function () {
            const result = timezoneDataWithGMTOffset();

            const utcTimezone = result.find(tz => tz.name === 'Etc/UTC');
            utcTimezone.should.be.ok();
            utcTimezone.label.should.match(/^\(GMT\) UTC$/);

            const nyTimezone = result.find(tz => tz.name === 'America/New_York');
            nyTimezone.should.be.ok();
            nyTimezone.label.should.match(/^\(GMT -[45]:00\) Eastern Time \(US & Canada\)$/);
        });

        it('should preserve original timezone name', function () {
            const result = timezoneDataWithGMTOffset();

            const namesinResult = result.map(obj => obj.name).sort();
            const namesInTzData = timezoneData.map(obj => obj.name).sort();

            namesinResult.should.deepEqual(namesInTzData);
        });

        it('should maintain consistent sorting across DST changes', function () {
            clock = sinon.useFakeTimers(new Date('2024-12-01T12:00:00Z'));
            const winterResult = timezoneDataWithGMTOffset();

            clock.restore();
            clock = sinon.useFakeTimers(new Date('2024-07-01T12:00:00Z'));
            const summerResult = timezoneDataWithGMTOffset();

            // Both results should be properly sorted by offset
            for (let i = 1; i < winterResult.length; i++) {
                winterResult[i].offsetMinutes.should.be.greaterThanOrEqual(winterResult[i - 1].offsetMinutes);
            }

            for (let i = 1; i < summerResult.length; i++) {
                summerResult[i].offsetMinutes.should.be.greaterThanOrEqual(summerResult[i - 1].offsetMinutes);
            }
        });
    });
});
