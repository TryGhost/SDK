import absoluteToTransformReady = require('./absolute-to-transform-ready');
import lexicalTransform = require('./lexical-transform');

interface LexicalAbsoluteToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalAbsoluteToTransformReady(serializedLexical: string, siteUrl: string, _options: LexicalAbsoluteToTransformReadyOptions = {}): string {
    const defaultOptions: LexicalAbsoluteToTransformReadyOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: any) {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, null, options);
}

export = lexicalAbsoluteToTransformReady;
