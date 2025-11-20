import type {MobiledocTransformOptionsInput, AbsoluteToTransformReadyOptionsInput} from './types';
import absoluteToTransformReady from './absolute-to-transform-ready';
import mobiledocTransform from './mobiledoc-transform';

function mobiledocAbsoluteToTransformReady(
    serializedMobiledoc: string,
    siteUrl: string,
    _options: MobiledocTransformOptionsInput = {}
): string {
    const defaultOptions: MobiledocTransformOptionsInput = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions: MobiledocTransformOptionsInput = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToTransformReadyOptionsInput): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, '', options);
}

export default mobiledocAbsoluteToTransformReady;
