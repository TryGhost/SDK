import type {LexicalTransformOptions, LexicalTransformOptionsInput, LexicalUrlTransformMap, UrlTransformFunction} from './types';
const _ = require('lodash');

// options.transformMap = {
//     relativeToAbsolute: {
//         url: (url, siteUrl, itemPath, options) => 'transformedUrl',
//         html: (html, siteUrl, itemPath, options) => 'transformedHtml',
//     }
// }
// options.transformType = 'relativeToAbsolute'

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

function lexicalTransform(
    serializedLexical: string,
    siteUrl: string,
    transformFunction: UrlTransformFunction,
    itemPath: string | null,
    _options: LexicalTransformOptionsInput = {}
): string {
    const defaultOptions: LexicalTransformOptionsInput = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const options: LexicalTransformOptions = Object.assign({}, defaultOptions, _options, {siteUrl, itemPath}) as LexicalTransformOptions;

    if (!serializedLexical) {
        return serializedLexical;
    }

    // function only accepts serialized lexical so there's no chance of accidentally
    // modifying pass-by-reference objects
    const lexical: LexicalDocument = JSON.parse(serializedLexical);

    if (!lexical?.root?.children) {
        return serializedLexical;
    }

    // create a map of node types to urlTransformMap objects
    // e.g. {'image': {src: 'url', caption: 'html'}
    const nodeMap = new Map<string, LexicalUrlTransformMap>();
    options.nodes.forEach(node => node.urlTransformMap && nodeMap.set(node.getType(), node.urlTransformMap));

    const transformProperty = function (obj: LexicalNode, propertyPath: string, transform: string | LexicalUrlTransformMap): void {
        const propertyValue = _.get(obj, propertyPath);

        if (Array.isArray(propertyValue)) {
            propertyValue.forEach((item: LexicalNode) => {
                // arrays of objects need to be defined as a nested object in the urlTransformMap
                // so the `transform` value is that nested object
                if (typeof transform === 'object') {
                    Object.entries(transform).forEach(([itemPropertyPath, itemTransform]) => {
                        transformProperty(item, itemPropertyPath, itemTransform);
                    });
                }
            });

            return;
        }

        if (propertyValue && typeof transform === 'string') {
            const transformType = options.transformType;
            const transformRegistry = options.transformMap[transformType];
            if (transformRegistry && transformRegistry[transform]) {
                _.set(obj, propertyPath, transformRegistry[transform](propertyValue as string));
            }
        }
    };

    // recursively walk the Lexical node tree transforming any card data properties and links
    const transformChildren = function (children: LexicalNode[]): void {
        for (const child of children) {
            const isCard = child.type && nodeMap.has(child.type);
            const isLink = !!child.url;

            if (isCard && child.type) {
                const urlTransformMap = nodeMap.get(child.type);
                if (urlTransformMap) {
                    Object.entries(urlTransformMap).forEach(([propertyPath, transform]) => {
                        transformProperty(child, propertyPath, transform);
                    });
                }
            } else if (isLink && child.url) {
                child.url = transformFunction(child.url, siteUrl, itemPath, options);
            }

            if (child.children) {
                transformChildren(child.children);
            }
        }
    };

    transformChildren(lexical.root.children);

    return JSON.stringify(lexical);
}

export default lexicalTransform;
