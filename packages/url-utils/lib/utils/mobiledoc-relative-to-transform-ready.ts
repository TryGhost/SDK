import relativeToTransformReady = require('./relative-to-transform-ready');
import mobiledocTransform = require('./mobiledoc-transform');

interface MobiledocRelativeToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocRelativeToTransformReady(serializedMobiledoc: string, siteUrl: string, itemPath: string | null = null, _options: MobiledocRelativeToTransformReadyOptions = {}): string {
    const defaultOptions: MobiledocRelativeToTransformReadyOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToTransformReady, itemPath, options);
}

export = mobiledocRelativeToTransformReady;
