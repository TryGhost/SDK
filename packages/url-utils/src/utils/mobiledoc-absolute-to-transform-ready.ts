import absoluteToTransformReady from './absolute-to-transform-ready';
import mobiledocTransform from './mobiledoc-transform';

interface MobiledocAbsoluteToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocAbsoluteToTransformReady(serializedMobiledoc: string, siteUrl: string, _options: MobiledocAbsoluteToTransformReadyOptions = {}): string {
    const defaultOptions: Required<Pick<MobiledocAbsoluteToTransformReadyOptions, 'assetsOnly' | 'secure' | 'cardTransformers'>> = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, '', options);
}

export default mobiledocAbsoluteToTransformReady;
