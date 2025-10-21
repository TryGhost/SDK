import type {
    CardTransformer,
    MobiledocCardTransformer,
    MobiledocTransformOptions,
    MobiledocTransformOptionsInput
} from './types';

type MobiledocMarkup = [string, string[] | undefined];
type MobiledocCard = [string, unknown];

interface MobiledocDocument {
    markups?: MobiledocMarkup[];
    cards?: MobiledocCard[];
}

type MobiledocTransformFunction = (
    value: string,
    siteUrl: string,
    itemPath: string | null,
    options: MobiledocTransformOptions
) => string | undefined;

function mobiledocTransform(
    serializedMobiledoc: string,
    siteUrl: string,
    transformFunction: MobiledocTransformFunction,
    itemPath: string | null,
    _options: MobiledocTransformOptionsInput = {}
): string {
    const defaultOptions: MobiledocTransformOptions = {
        assetsOnly: false,
        secure: false,
        cardTransformers: [],
        siteUrl,
        itemPath,
        transformType: 'relativeToAbsolute'
    };

    const options: MobiledocTransformOptions = {
        ...defaultOptions,
        ..._options,
        siteUrl,
        itemPath
    };

    const transformerMap = new Map<string, CardTransformer>();
    options.cardTransformers.forEach((cardTransformer: MobiledocCardTransformer) => {
        const transformer = cardTransformer[options.transformType];
        if (transformer) {
            transformerMap.set(cardTransformer.name, transformer);
        }
    });
    delete (options as unknown as Record<string, unknown>).cardTransformers;

    // function only accepts serialized mobiledoc so there's no chance of accidentally
    // modifying pass-by-reference objects
    const mobiledoc = JSON.parse(serializedMobiledoc) as MobiledocDocument;

    // any mobiledoc links will have an 'a' markup with an 'href' attribute
    (mobiledoc.markups || []).forEach((markup) => {
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
                const transformedUrl = transformFunction(markup[1][hrefIndex], siteUrl, itemPath, options);
                if (transformedUrl) {
                    markup[1][hrefIndex] = transformedUrl;
                }
            }
        }
    });

    // any other urls will be within card payloads. We can't know what format
    // cards may contain so we sub out to card-specific transform functions that
    // are passed in as options from the consuming application.
    (mobiledoc.cards || []).forEach((card) => {
        const [name, payload] = card;
        const transformer = transformerMap.get(name);
        if (transformer) {
            // transformers take a payload and return a transformed payload
            const transformedPayload = transformer(payload, options);
            card[1] = transformedPayload;
        }
    });

    return JSON.stringify(mobiledoc);
}

export default mobiledocTransform;
