const assert = require('assert/strict');

const timezoneData = require('../cjs/timezone-data.js');

describe('timezone-data', function () {
    it('exports an array', function () {
        assert.ok(Array.isArray(timezoneData));
    });

    it('contains the expected number of timezones', function () {
        assert.ok(timezoneData.length > 60);
    });

    it('each entry has name and label properties', function () {
        for (const tz of timezoneData) {
            assert.equal(typeof tz.name, 'string');
            assert.equal(typeof tz.label, 'string');
            assert.ok(tz.name.length > 0);
            assert.ok(tz.label.length > 0);
        }
    });

    it('all names are valid IANA-style timezone identifiers', function () {
        for (const tz of timezoneData) {
            assert.match(tz.name, /^[A-Za-z]+\/[A-Za-z_]+/);
        }
    });

    it('all labels contain a GMT offset', function () {
        for (const tz of timezoneData) {
            assert.match(tz.label, /\(GMT[^)]*\)/);
        }
    });

    it('has no duplicate names', function () {
        const names = timezoneData.map(tz => tz.name);
        const unique = [...new Set(names)];
        assert.equal(unique.length, names.length);
    });

    it('starts with Pacific/Pago_Pago (most negative offset)', function () {
        assert.equal(timezoneData[0].name, 'Pacific/Pago_Pago');
    });

    it('ends with Pacific/Kwajalein (most positive offset)', function () {
        assert.equal(timezoneData[timezoneData.length - 1].name, 'Pacific/Kwajalein');
    });

    it('contains common timezones', function () {
        const names = timezoneData.map(tz => tz.name);
        assert.ok(names.includes('Etc/UTC'));
        assert.ok(names.includes('America/New_York'));
        assert.ok(names.includes('Europe/Dublin'));
        assert.ok(names.includes('Asia/Tokyo'));
        assert.ok(names.includes('Australia/Sydney'));
    });
});
