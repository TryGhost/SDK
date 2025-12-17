import type {MobiledocTransformOptionsInput} from './types';
import relativeToAbsolute from './relative-to-absolute';
import mobiledocTransform from './mobiledoc-transform';

function mobiledocRelativeToAbsolute(
    serializedMobiledoc: string,
    siteUrl: string,
    itemPath: string | null,
    _options: MobiledocTransformOptionsInput = {}
): string {
    const defaultOptions: MobiledocTransformOptionsInput = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions: MobiledocTransformOptionsInput = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToAbsolute, itemPath, options);
}

export default mobiledocRelativeToAbsolute;
