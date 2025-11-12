import relativeToTransformReady from './relative-to-transform-ready';
import mobiledocTransform from './mobiledoc-transform';

interface MobiledocRelativeToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocRelativeToTransformReady(serializedMobiledoc: string, siteUrl: string, itemPath: string, _options: MobiledocRelativeToTransformReadyOptions = {}): string {
    const defaultOptions: Required<Pick<MobiledocRelativeToTransformReadyOptions, 'assetsOnly' | 'secure' | 'cardTransformers'>> = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToTransformReady, itemPath, options);
}

export default mobiledocRelativeToTransformReady;
