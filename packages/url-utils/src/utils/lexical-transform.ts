const _ = require('lodash');

// options.transformMap = {
//     relativeToAbsolute: {
//         url: (url, siteUrl, itemPath, options) => 'transformedUrl',
//         html: (html, siteUrl, itemPath, options) => 'transformedHtml',
//     }
// }
// options.transformType = 'relativeToAbsolute'

interface LexicalNode {
    getType: () => string;
    urlTransformMap?: Record<string, string>;
}

interface LexicalTransformOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: LexicalNode[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
    transformType?: string;
    siteUrl?: string;
    itemPath?: string;
}

type LexicalTransformFunction = (url: string, siteUrl: string, itemPath: string, options: LexicalTransformOptions) => string;

function lexicalTransform(
    serializedLexical: string,
    siteUrl: string,
    transformFunction: LexicalTransformFunction,
    itemPath: string,
    _options: LexicalTransformOptions = {}
): string {
    const defaultOptions: Required<Pick<LexicalTransformOptions, 'assetsOnly' | 'secure' | 'nodes' | 'transformMap'>> = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const options = Object.assign({}, defaultOptions, _options, {siteUrl, itemPath});

    if (!serializedLexical) {
        return serializedLexical;
    }

    // function only accepts serialized lexical so there's no chance of accidentally
    // modifying pass-by-reference objects
    const lexical = JSON.parse(serializedLexical);

    if (!lexical?.root?.children) {
        return serializedLexical;
    }

    // create a map of node types to urlTransformMap objects
    // e.g. {'image': {src: 'url', caption: 'html'}
    const nodeMap = new Map<string, Record<string, string>>();
    options.nodes.forEach(node => node.urlTransformMap && nodeMap.set(node.getType(), node.urlTransformMap));

    const transformProperty = function (obj: any, propertyPath: string, transform: string | Record<string, string>): void {
        const propertyValue = _.get(obj, propertyPath);

        if (Array.isArray(propertyValue)) {
            propertyValue.forEach((item) => {
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

        if (propertyValue && typeof transform === 'string' && options.transformMap && options.transformType) {
            const transformMap = options.transformMap[options.transformType];
            if (transformMap && transformMap[transform]) {
                _.set(obj, propertyPath, transformMap[transform](propertyValue));
            }
        }
    };

    // recursively walk the Lexical node tree transforming any card data properties and links
    const transformChildren = function (children: any[]): void {
        for (const child of children) {
            const isCard = child.type && nodeMap.has(child.type);
            const isLink = !!child.url;

            if (isCard) {
                const urlTransformMap = nodeMap.get(child.type);
                if (urlTransformMap) {
                    Object.entries(urlTransformMap).forEach(([propertyPath, transform]) => {
                        transformProperty(child, propertyPath, transform);
                    });
                }
            } else if (isLink) {
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
module.exports = lexicalTransform;
