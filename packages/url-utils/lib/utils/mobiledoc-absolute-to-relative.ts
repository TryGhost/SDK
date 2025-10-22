import absoluteToRelative = require('./absolute-to-relative');
import mobiledocTransform = require('./mobiledoc-transform');

interface MobiledocAbsoluteToRelativeOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocAbsoluteToRelative(serializedMobiledoc: string, siteUrl: string, _options: MobiledocAbsoluteToRelativeOptions = {}): string {
    const defaultOptions: MobiledocAbsoluteToRelativeOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'absoluteToRelative'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: any): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, null, options);
}

export = mobiledocAbsoluteToRelative;
