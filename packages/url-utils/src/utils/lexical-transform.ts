import _ from 'lodash';
import type {
    LexicalNodeConfig,
    LexicalTransformOptions,
    LexicalTransformOptionsInput,
    LexicalTransformRegistry,
    LexicalTransformType,
    LexicalUrlTransformMap
} from './types';

interface LexicalNode {
    type?: string;
    url?: string;
    children?: LexicalNode[];
    [key: string]: unknown;
}

interface LexicalDocument {
    root?: {
        children?: LexicalNode[];
    };
}

type LexicalTransformFunction = (value: string, siteUrl: string, itemPath: string | null, options: LexicalTransformOptions) => string;

// options.transformMap = {
//     relativeToAbsolute: {
//         url: (url, siteUrl, itemPath, options) => 'transformedUrl',
//         html: (html, siteUrl, itemPath, options) => 'transformedHtml',
//     }
// }
// options.transformType = 'relativeToAbsolute'

function lexicalTransform(
    serializedLexical: string,
    siteUrl: string,
    transformFunction: LexicalTransformFunction,
    itemPath: string | null,
    _options: LexicalTransformOptionsInput = {}
): string {
    const defaultOptions: LexicalTransformOptions = {
        assetsOnly: false,
        secure: false,
        nodes: [],
        transformMap: {},
        transformType: 'relativeToAbsolute',
        siteUrl,
        itemPath
    };
    const options: LexicalTransformOptions = {
        ...defaultOptions,
        ..._options,
        siteUrl,
        itemPath
    };

    if (!serializedLexical) {
        return serializedLexical;
    }

    // function only accepts serialized lexical so there's no chance of accidentally
    // modifying pass-by-reference objects
    const lexical = JSON.parse(serializedLexical) as LexicalDocument;

    if (!lexical?.root?.children) {
        return serializedLexical;
    }

    // create a map of node types to urlTransformMap objects
    // e.g. {'image': {src: 'url', caption: 'html'}
    const nodeMap = new Map<string, LexicalUrlTransformMap>();
    options.nodes.forEach((node: LexicalNodeConfig) => {
        if (node.urlTransformMap) {
            nodeMap.set(node.getType(), node.urlTransformMap);
        }
    });

    const getTransformRegistry = (transformType: LexicalTransformType): Record<string, (value: string) => string> | undefined => {
        return options.transformMap?.[transformType];
    };

    const transformProperty = function (obj: LexicalNode, propertyPath: string, transform: string | LexicalUrlTransformMap) {
        const propertyValue = _.get(obj, propertyPath);

        if (Array.isArray(propertyValue)) {
            propertyValue.forEach((item) => {
                // arrays of objects need to be defined as a nested object in the urlTransformMap
                // so the `transform` value is that nested object
                if (typeof transform === 'object') {
                    Object.entries(transform).forEach(([itemPropertyPath, itemTransform]) => {
                        transformProperty(item as LexicalNode, itemPropertyPath, itemTransform);
                    });
                }
            });

            return;
        }

        if (propertyValue && typeof transform === 'string') {
            const registry = getTransformRegistry(options.transformType);
            const transformer = registry?.[transform];
            if (transformer && typeof propertyValue === 'string') {
                _.set(obj, propertyPath, transformer(propertyValue));
            }
        }
    };

    // recursively walk the Lexical node tree transforming any card data properties and links
    const transformChildren = function (children: LexicalNode[]) {
        for (const child of children) {
            const isCard = child.type ? nodeMap.has(child.type) : false;
            const isLink = typeof child.url === 'string';

            if (isCard) {
                const map = child.type ? nodeMap.get(child.type) : undefined;
                if (map) {
                    Object.entries(map).forEach(([propertyPath, transform]) => {
                        transformProperty(child, propertyPath, transform);
                    });
                }
            } else if (isLink) {
                child.url = transformFunction(child.url as string, siteUrl, itemPath, options);
            }

            if (child.children) {
                transformChildren(child.children);
            }
        }
    };

    if (lexical.root?.children) {
        transformChildren(lexical.root.children);
    }

    return JSON.stringify(lexical);
}

export default lexicalTransform;
