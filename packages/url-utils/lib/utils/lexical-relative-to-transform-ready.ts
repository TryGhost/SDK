import relativeToTransformReady from './relative-to-transform-ready';
import lexicalTransform from './lexical-transform';

interface LexicalRelativeToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalRelativeToTransformReady(serializedLexical: string, siteUrl: string, itemPath: string | null, _options: LexicalRelativeToTransformReadyOptions = {}): string {
    const defaultOptions: LexicalRelativeToTransformReadyOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return lexicalTransform(serializedLexical, siteUrl, relativeToTransformReady, itemPath, options);
}

export default lexicalRelativeToTransformReady;
