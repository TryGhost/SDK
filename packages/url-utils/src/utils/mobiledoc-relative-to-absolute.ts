import relativeToAbsolute, {type RelativeToAbsoluteOptionsInput} from './relative-to-absolute';
import mobiledocTransform from './mobiledoc-transform';
import type {MobiledocTransformOptionsInput} from './types';

export type MobiledocRelativeToAbsoluteOptions = MobiledocTransformOptionsInput & RelativeToAbsoluteOptionsInput;

function mobiledocRelativeToAbsolute(
    serializedMobiledoc: string,
    siteUrl: string,
    itemPath: string | null,
    _options: MobiledocRelativeToAbsoluteOptions = {}
): string {
    const overrideOptions: MobiledocRelativeToAbsoluteOptions = {
        siteUrl,
        itemPath,
        transformType: 'relativeToAbsolute'
    };
    const options: MobiledocRelativeToAbsoluteOptions = {
        assetsOnly: false,
        secure: false,
        cardTransformers: [],
        ..._options,
        ...overrideOptions
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToAbsolute, itemPath, options);
}

export default mobiledocRelativeToAbsolute;
