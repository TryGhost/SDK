import type {MobiledocTransformOptionsInput} from './types';
import type {AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import absoluteToRelative from './absolute-to-relative';
import mobiledocTransform from './mobiledoc-transform';

function mobiledocAbsoluteToRelative(
    serializedMobiledoc: string,
    siteUrl: string,
    _options: MobiledocTransformOptionsInput = {}
): string {
    const defaultOptions: MobiledocTransformOptionsInput = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions: MobiledocTransformOptionsInput = {siteUrl, transformType: 'absoluteToRelative'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToRelativeOptionsInput): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, '', options);
}

export default mobiledocAbsoluteToRelative;
