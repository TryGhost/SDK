require('should');
const sinon = require('sinon');
const {getGMTOffset, timezoneDataWithGMTOffset} = require('../');
const timezoneData = require('../').default;

describe('Timezone Data with GMT Offset', function () {
    let clock;

    afterEach(function () {
        if (clock) {
            clock.restore();
        }
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
            result.length.should.equal(67);
            
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
            
            // Both results should be properly sorted
            for (let i = 1; i < winterResult.length; i++) {
                winterResult[i].offsetMinutes.should.be.greaterThanOrEqual(winterResult[i - 1].offsetMinutes);
            }
            
            for (let i = 1; i < summerResult.length; i++) {
                summerResult[i].offsetMinutes.should.be.greaterThanOrEqual(summerResult[i - 1].offsetMinutes);
            }
        });
    });
});
