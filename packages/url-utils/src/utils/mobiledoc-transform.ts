import type {MobiledocTransformOptions, MobiledocTransformOptionsInput, MobiledocCardTransformer, UrlTransformFunction} from './types';

interface MobiledocMarkup {
    0: string;
    1?: string[];
    [key: number]: unknown;
}

interface MobiledocCard {
    0: string;
    1: unknown;
    [key: number]: unknown;
}

interface MobiledocDocument {
    markups?: MobiledocMarkup[];
    cards?: MobiledocCard[];
    [key: string]: unknown;
}

function mobiledocTransform(
    serializedMobiledoc: string,
    siteUrl: string,
    transformFunction: UrlTransformFunction,
    itemPath: string | null,
    _options: MobiledocTransformOptionsInput = {}
): string {
    const defaultOptions: MobiledocTransformOptionsInput = {assetsOnly: false, secure: false, cardTransformers: []};
    const options: MobiledocTransformOptions = Object.assign({}, defaultOptions, _options, {siteUrl, itemPath}) as MobiledocTransformOptions;

    // options.cardTransformers has an object for each card that has a name and multiple
    // transformer functions. By collecting the functions we need into a named object it
    // reduces the need to loop through and find the transformer for each card later on
    const cardTransformers: Record<string, ((payload: unknown, transformOptions: MobiledocTransformOptions) => unknown) | undefined> = {};
    options.cardTransformers.forEach((cardTransformer: MobiledocCardTransformer) => {
        cardTransformers[cardTransformer.name] = cardTransformer[options.transformType];
    });
    delete (options as Partial<MobiledocTransformOptions>).cardTransformers;

    // function only accepts serialized mobiledoc so there's no chance of accidentally
    // modifying pass-by-reference objects
    const mobiledoc: MobiledocDocument = JSON.parse(serializedMobiledoc);

    // any mobiledoc links will have an 'a' markup with an 'href' attribute
    (mobiledoc.markups || []).forEach((markup: MobiledocMarkup) => {
        if (markup[0] === 'a' && markup[1]) {
            // mobiledoc markup attrs are in an array like ['key', 'value', 'key2', 'value2']
            // we only care about the href attr so loop through and find it so we can get the idx of it's value
            let hrefIndex = -1;

            markup[1].forEach((attr: string, index: number) => {
                if (attr === 'href') {
                    hrefIndex = index + 1;
                }
            });

            if (hrefIndex !== -1 && typeof markup[1][hrefIndex] === 'string') {
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
    (mobiledoc.cards || []).forEach((card: MobiledocCard) => {
        const name = card[0];
        const payload = card[1];
        if (cardTransformers[name]) {
            // transformers take a payload and return a transformed payload
            const transformedPayload = cardTransformers[name](payload, options as MobiledocTransformOptions);
            card[1] = transformedPayload;
        }
    });

    return JSON.stringify(mobiledoc);
}

export default mobiledocTransform;
