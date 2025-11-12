import relativeToAbsolute from './relative-to-absolute';
import mobiledocTransform from './mobiledoc-transform';

interface MobiledocRelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocRelativeToAbsolute(serializedMobiledoc: string, siteUrl: string, itemPath: string, _options: MobiledocRelativeToAbsoluteOptions = {}): string {
    const defaultOptions: Required<Pick<MobiledocRelativeToAbsoluteOptions, 'assetsOnly' | 'secure' | 'cardTransformers'>> = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToAbsolute, itemPath, options);
}

export default mobiledocRelativeToAbsolute;
