const _ = require('lodash');

// options.transformMap = {
//     relativeToAbsolute: {
//         url: (url, siteUrl, itemPath, options) => 'transformedUrl',
//         html: (html, siteUrl, itemPath, options) => 'transformedHtml',
//     }
// }
// options.transformType = 'relativeToAbsolute'

function lexicalTransform(serializedLexical, siteUrl, transformFunction, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
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
    const nodeMap = new Map();
    options.nodes.forEach(node => node.urlTransformMap && nodeMap.set(node.getType(), node.urlTransformMap));

    const transformProperty = function (obj, propertyPath, transform) {
        const propertyValue = _.get(obj, propertyPath);

        if (Array.isArray(propertyValue)) {
            propertyValue.forEach((item) => {
                // arrays of objects need to be defined as a nested object in the urlTransformMap
                // so the `transform` value is that nested object
                Object.entries(transform).forEach(([itemPropertyPath, itemTransform]) => {
                    transformProperty(item, itemPropertyPath, itemTransform);
                });
            });

            return;
        }

        if (propertyValue) {
            _.set(obj, propertyPath, options.transformMap[options.transformType][transform](propertyValue));
        }
    };

    // recursively walk the Lexical node tree transforming any card data properties and links
    const transformChildren = function (children) {
        for (const child of children) {
            const isCard = child.type && nodeMap.has(child.type);
            const isLink = !!child.url;

            if (isCard) {
                Object.entries(nodeMap.get(child.type)).forEach(([propertyPath, transform]) => {
                    transformProperty(child, propertyPath, transform);
                });
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

module.exports = lexicalTransform;
