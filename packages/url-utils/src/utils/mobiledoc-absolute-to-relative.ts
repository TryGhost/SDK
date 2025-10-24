import absoluteToRelative, {type AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import mobiledocTransform from './mobiledoc-transform';
import type {MobiledocTransformOptionsInput} from './types';

export type MobiledocAbsoluteToRelativeOptions = MobiledocTransformOptionsInput & AbsoluteToRelativeOptionsInput;

function mobiledocAbsoluteToRelative(
    serializedMobiledoc: string,
    siteUrl: string,
    _options: MobiledocAbsoluteToRelativeOptions = {}
): string {
    const overrideOptions: MobiledocAbsoluteToRelativeOptions = {
        siteUrl,
        transformType: 'absoluteToRelative'
    };
    const options: MobiledocAbsoluteToRelativeOptions = {
        assetsOnly: false,
        secure: false,
        cardTransformers: [],
        ..._options,
        ...overrideOptions
    };

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToRelativeOptionsInput): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, '', options);
}

export default mobiledocAbsoluteToRelative;
