import type {MobiledocTransformOptionsInput} from './types';
import relativeToTransformReady from './relative-to-transform-ready';
import mobiledocTransform from './mobiledoc-transform';

function mobiledocRelativeToTransformReady(
    serializedMobiledoc: string,
    siteUrl: string,
    itemPath: string | null,
    _options: MobiledocTransformOptionsInput = {}
): string {
    const defaultOptions: MobiledocTransformOptionsInput = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions: MobiledocTransformOptionsInput = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToTransformReady, itemPath, options);
}

export default mobiledocRelativeToTransformReady;
