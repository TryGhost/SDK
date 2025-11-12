import absoluteToTransformReady from './absolute-to-transform-ready';
import lexicalTransform from './lexical-transform';

interface LexicalAbsoluteToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalAbsoluteToTransformReady(serializedLexical: string, siteUrl: string, _options: LexicalAbsoluteToTransformReadyOptions = {}): string {
    const defaultOptions: Required<Pick<LexicalAbsoluteToTransformReadyOptions, 'assetsOnly' | 'secure' | 'nodes' | 'transformMap'>> = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, '', options);
}

export default lexicalAbsoluteToTransformReady;
module.exports = lexicalAbsoluteToTransformReady;
