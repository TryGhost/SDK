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

// Options for CDN base URLs
export interface BaseUrlOptions extends UnknownRecord {
    imageBaseUrl?: string | null;
    filesBaseUrl?: string | null;
    mediaBaseUrl?: string | null;
}

export type BaseUrlOptionsInput = Partial<BaseUrlOptions>;

export interface EarlyExitOptions extends UnknownRecord {
    earlyExitMatchStr?: string;
}

export type EarlyExitOptionsInput = Partial<EarlyExitOptions>;

// Options for absolute-to-transform-ready function
export interface AbsoluteToTransformReadyOptions extends TransformReadyReplacementOptions, BaseUrlOptions, AssetAwareOptions {
    staticFilesUrlPrefix?: string;
    staticMediaUrlPrefix?: string;
}

export type AbsoluteToTransformReadyOptionsInput = Partial<AbsoluteToTransformReadyOptions>;

// Main URL transform function signature
export type UrlTransformFunction = (
    url: string,
    siteUrl: string,
    itemPath: string | null,
    options: UnknownRecord
) => string;

// Transform type for Mobiledoc and Lexical
export type TransformType = 'relativeToAbsolute' | 'absoluteToRelative' | 'toTransformReady';

export interface HtmlTransformOptions extends SecureOptions {
    earlyExitMatchStr?: string;
}

export type HtmlTransformOptionsInput = SecureOptionsInput & {earlyExitMatchStr?: string};

export interface MarkdownTransformOptions extends AssetAwareOptions {
    ignoreProtocol: boolean;
    earlyExitMatchStr?: string;
}

export type MarkdownTransformOptionsInput = AssetAwareOptionsInput & {ignoreProtocol?: boolean; earlyExitMatchStr?: string};

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
    transformType: TransformType;
}

export type MobiledocTransformOptionsInput = Partial<Omit<MobiledocTransformOptions, 'cardTransformers' | 'siteUrl' | 'itemPath' | 'transformType'>> & {
    cardTransformers?: MobiledocCardTransformer[];
    siteUrl?: string;
    itemPath?: string | null;
    transformType?: TransformType;
};
export type LexicalTransformFunction = (value: string) => string;
export interface LexicalUrlTransformMap {
    [key: string]: string | LexicalUrlTransformMap;
}

export interface LexicalNodeConfig {
    getType(): string;
    urlTransformMap?: LexicalUrlTransformMap;
}

export type LexicalTransformRegistry = Partial<Record<TransformType, Record<string, LexicalTransformFunction>>>;

export interface LexicalTransformOptions extends SecureOptions {
    nodes: LexicalNodeConfig[];
    transformMap: LexicalTransformRegistry;
    transformType: TransformType;
    siteUrl: string;
    itemPath: string | null;
}

export type LexicalTransformOptionsInput = Partial<Omit<LexicalTransformOptions, 'nodes' | 'transformMap' | 'siteUrl' | 'itemPath' | 'transformType'>> & {
    nodes?: LexicalNodeConfig[];
    transformMap?: LexicalTransformRegistry;
    siteUrl?: string;
    itemPath?: string | null;
    transformType?: TransformType;
};
