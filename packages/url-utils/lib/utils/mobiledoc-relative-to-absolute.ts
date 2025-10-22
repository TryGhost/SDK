import relativeToAbsolute = require('./relative-to-absolute');
import mobiledocTransform = require('./mobiledoc-transform');

interface MobiledocRelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocRelativeToAbsolute(serializedMobiledoc: string, siteUrl: string, itemPath: string | null = null, _options: MobiledocRelativeToAbsoluteOptions = {}): string {
    const defaultOptions: MobiledocRelativeToAbsoluteOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToAbsolute, itemPath, options);
}

export = mobiledocRelativeToAbsolute;
