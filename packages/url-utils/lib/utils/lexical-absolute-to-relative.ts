import absoluteToRelative from './absolute-to-relative';
import lexicalTransform from './lexical-transform';

interface LexicalAbsoluteToRelativeOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalAbsoluteToRelative(serializedLexical: string, siteUrl: string, _options: LexicalAbsoluteToRelativeOptions = {}): string {
    const defaultOptions: LexicalAbsoluteToRelativeOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, transformType: 'absoluteToRelative'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: any) {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, null, options);
}

export default lexicalAbsoluteToRelative;
