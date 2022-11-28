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

    const nodeMap = new Map();
    options.nodes.forEach(node => node.urlTransformMap && nodeMap.set(node.getType(), node.urlTransformMap));

    const transformChildren = function (children) {
        for (const child of children) {
            // cards (nodes) have a `type` attribute in their node data
            if (child.type && nodeMap.has(child.type)) {
                Object.entries(nodeMap.get(child.type)).forEach(([property, transform]) => {
                    if (child[property]) {
                        child[property] = options.transformMap[options.transformType][transform](child[property]);
                    }
                });
            } else if (child.url) {
                // any lexical links will be a child object with a `url` attribute,
                // recursively walk the tree transforming any `.url`s
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
