import mobiledocTransform from './mobiledoc-transform';
import relativeToTransformReady, {type RelativeToTransformReadyOptionsInput} from './relative-to-transform-ready';
import type {MobiledocTransformOptionsInput} from './types';

export type MobiledocRelativeToTransformReadyOptions = MobiledocTransformOptionsInput & RelativeToTransformReadyOptionsInput;

function mobiledocRelativeToTransformReady(
    serializedMobiledoc: string,
    siteUrl: string,
    itemPath: string | null,
    _options: MobiledocRelativeToTransformReadyOptions = {}
): string {
    const overrideOptions: MobiledocRelativeToTransformReadyOptions = {
        siteUrl,
        transformType: 'toTransformReady'
    };
    const options: MobiledocRelativeToTransformReadyOptions = {
        assetsOnly: false,
        secure: false,
        cardTransformers: [],
        ..._options,
        ...overrideOptions
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToTransformReady, itemPath, options);
}

export default mobiledocRelativeToTransformReady;
