export type UnknownRecord = Record<string, unknown>;

export interface AssetAwareOptions extends UnknownRecord {
    assetsOnly: boolean;
    staticImageUrlPrefix?: string;
}

export type AssetAwareOptionsInput = Partial<AssetAwareOptions>;

export interface SecureOptions extends AssetAwareOptions {
    secure?: boolean;
}

export type SecureOptionsInput = Partial<SecureOptions>;

export interface TransformReadyReplacementOptions extends UnknownRecord {
    replacementStr: string;
    withoutSubdirectory?: boolean;
}

export type TransformReadyReplacementOptionsInput = Partial<TransformReadyReplacementOptions>;

export interface HtmlTransformOptions extends SecureOptions {
    earlyExitMatchStr?: string;
}

export type HtmlTransformOptionsInput = SecureOptionsInput & {earlyExitMatchStr?: string};

export interface MarkdownTransformOptions extends AssetAwareOptions {
    ignoreProtocol: boolean;
    earlyExitMatchStr?: string;
}

export type MarkdownTransformOptionsInput = AssetAwareOptionsInput & {ignoreProtocol?: boolean; earlyExitMatchStr?: string};

export type MobiledocTransformType = 'relativeToAbsolute' | 'absoluteToRelative' | 'toTransformReady';

export type CardTransformer = (payload: unknown, options: UnknownRecord) => unknown;

export interface MobiledocCardTransformer {
    name: string;
    relativeToAbsolute?: CardTransformer;
    absoluteToRelative?: CardTransformer;
    toTransformReady?: CardTransformer;
}

export interface MobiledocTransformOptions extends SecureOptions {
    cardTransformers: MobiledocCardTransformer[];
    siteUrl: string;
    itemPath: string | null;
    transformType: MobiledocTransformType;
}

export type MobiledocTransformOptionsInput = Partial<Omit<MobiledocTransformOptions, 'cardTransformers' | 'siteUrl' | 'itemPath' | 'transformType'>> & {
    cardTransformers?: MobiledocCardTransformer[];
    siteUrl?: string;
    itemPath?: string | null;
    transformType?: MobiledocTransformType;
};

export type LexicalTransformType = MobiledocTransformType;
export type LexicalTransformFunction = (value: string) => string;
export interface LexicalUrlTransformMap {
    [key: string]: string | LexicalUrlTransformMap;
}

export interface LexicalNodeConfig {
    getType(): string;
    urlTransformMap?: LexicalUrlTransformMap;
}

export type LexicalTransformRegistry = Partial<Record<LexicalTransformType, Record<string, LexicalTransformFunction>>>;

export interface LexicalTransformOptions extends SecureOptions {
    nodes: LexicalNodeConfig[];
    transformMap: LexicalTransformRegistry;
    transformType: LexicalTransformType;
    siteUrl: string;
    itemPath: string | null;
}

export type LexicalTransformOptionsInput = Partial<Omit<LexicalTransformOptions, 'nodes' | 'transformMap' | 'siteUrl' | 'itemPath' | 'transformType'>> & {
    nodes?: LexicalNodeConfig[];
    transformMap?: LexicalTransformRegistry;
    siteUrl?: string;
    itemPath?: string | null;
    transformType?: LexicalTransformType;
};
