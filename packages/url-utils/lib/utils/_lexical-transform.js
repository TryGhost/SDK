function lexicalTransform(serializedLexical, siteUrl, transformFunction, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false};
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

    // any lexical links will be a child object with a `url` attribute,
    // recursively walk the tree transforming any `.url`s
    const transformChildren = function (children) {
        for (const child of children) {
            if (child.url) {
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
