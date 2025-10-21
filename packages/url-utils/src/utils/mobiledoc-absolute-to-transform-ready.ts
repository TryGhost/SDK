import absoluteToTransformReady, {type AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';
import mobiledocTransform from './mobiledoc-transform';
import type {MobiledocTransformOptionsInput} from './types';

export type MobiledocAbsoluteToTransformReadyOptions = MobiledocTransformOptionsInput & AbsoluteToTransformReadyOptionsInput;

function mobiledocAbsoluteToTransformReady(
    serializedMobiledoc: string,
    siteUrl: string,
    _options: MobiledocAbsoluteToTransformReadyOptions = {}
): string {
    const overrideOptions: MobiledocAbsoluteToTransformReadyOptions = {
        siteUrl,
        transformType: 'toTransformReady'
    };
    const options: MobiledocAbsoluteToTransformReadyOptions = {
        assetsOnly: false,
        secure: false,
        cardTransformers: [],
        ..._options,
        ...overrideOptions
    };

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToTransformReadyOptionsInput): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, '', options);
}

export default mobiledocAbsoluteToTransformReady;
