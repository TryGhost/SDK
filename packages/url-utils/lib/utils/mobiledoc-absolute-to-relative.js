const absoluteToRelative = require('./absolute-to-relative');

function mobiledocAbsoluteToRelative(serializedMobiledoc, siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const options = Object.assign({}, defaultOptions, _options, {siteUrl});

    // options.cardTransformers has an object for each card that has a name and multiple
    // transformer functions. By collecting the functions we need into a named object it
    // reduces the need to loop through and find the transformer for each card later on
    const cardTransformers = {};
    options.cardTransformers.forEach((cardTransformer) => {
        cardTransformers[cardTransformer.name] = cardTransformer.absoluteToRelative;
    });
    delete options.cardTransformers;

    // function only accepts serialized mobiledoc so there's no chance of accidentally
    // modifying pass-by-reference objects
    const relativeMobiledoc = JSON.parse(serializedMobiledoc);

    // any mobiledoc links will have an 'a' markup with an 'href' attribute
    (relativeMobiledoc.markups || []).forEach((markup) => {
        if (markup[0] === 'a' && markup[1]) {
            // mobiledoc markup attrs are in an array like ['key', 'value', 'key2', 'value2']
            // we only care about the href attr so loop through and find it so we can get the idx of it's value
            let hrefIndex = -1;

            markup[1].forEach((attr, index) => {
                if (attr === 'href') {
                    hrefIndex = index + 1;
                }
            });

            if (hrefIndex !== -1) {
                const relativeUrl = absoluteToRelative(markup[1][hrefIndex], siteUrl, options);
                if (relativeUrl) {
                    markup[1][hrefIndex] = relativeUrl;
                }
            }
        }
    });

    // any other urls will be within card payloads. We can't know what format
    // cards may contain so we sub out to card-specific transform functions that
    // are passed in as options from the consuming application.
    (relativeMobiledoc.cards || []).forEach((card) => {
        const [name, payload] = card;
        if (cardTransformers[name]) {
            // transformers take a payload and return a transformed payload
            const transformedPayload = cardTransformers[name](payload, options);
            card[1] = transformedPayload;
        }
    });

    return JSON.stringify(relativeMobiledoc);
}

module.exports = mobiledocAbsoluteToRelative;
