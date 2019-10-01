const relativeToAbsolute = require('./relative-to-absolute');

function mobiledocRelativeToAbsolute(serializedMobiledoc, siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const options = Object.assign({}, defaultOptions, _options, {siteUrl, itemPath});

    // options.cardTransformers has an object for each card that has a name and multiple
    // transformer functions. By collecting the functions we need into a named object it
    // reduces the need to loop through and find the transformer for each card later on
    const cardTransformers = {};
    options.cardTransformers.forEach((cardTransformer) => {
        cardTransformers[cardTransformer.name] = cardTransformer.relativeToAbsolute;
    });
    delete options.cardTransformers;

    // function only accepts serialized mobiledoc so there's no chance of accidentally
    // modifying pass-by-reference objects
    const absoluteMobiledoc = JSON.parse(serializedMobiledoc);

    // any mobiledoc links will have an 'a' markup with a 'href' attribute
    (absoluteMobiledoc.markups || []).forEach((markup) => {
        if (markup[0] === 'a' && markup[1][0] === 'href') {
            const relativeUrl = relativeToAbsolute(markup[1][1], siteUrl, itemPath, options);
            if (relativeUrl) {
                markup[1][1] = relativeUrl;
            }
        }
    });

    // any other urls will be within card payloads. We can't know what format
    // cards may contain so we sub out to card-specific transform functions that
    // are passed in as options from the consuming application.
    (absoluteMobiledoc.cards || []).forEach((card) => {
        const [name, payload] = card;
        if (cardTransformers[name]) {
            // transformers take a payload and return a transformed payload
            const transformedPayload = cardTransformers[name](payload, options);
            card[1] = transformedPayload;
        }
    });

    return JSON.stringify(absoluteMobiledoc);
}

module.exports = mobiledocRelativeToAbsolute;
