import absoluteToRelative from './absolute-to-relative';
import mobiledocTransform from './mobiledoc-transform';

interface MobiledocAbsoluteToRelativeOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocAbsoluteToRelative(serializedMobiledoc: string, siteUrl: string, _options: MobiledocAbsoluteToRelativeOptions = {}): string {
    const defaultOptions: Required<Pick<MobiledocAbsoluteToRelativeOptions, 'assetsOnly' | 'secure' | 'cardTransformers'>> = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'absoluteToRelative'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, '', options);
}

export default mobiledocAbsoluteToRelative;
module.exports = mobiledocAbsoluteToRelative;
