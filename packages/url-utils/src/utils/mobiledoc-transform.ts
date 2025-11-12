interface MobiledocTransformOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: CardTransformer[];
    transformType?: string;
    siteUrl?: string;
    itemPath?: string;
}

interface CardTransformer {
    name: string;
    [key: string]: any;
}

type MobiledocTransformFunction = (url: string, siteUrl: string, itemPath: string, options: MobiledocTransformOptions) => string;

function mobiledocTransform(
    serializedMobiledoc: string,
    siteUrl: string,
    transformFunction: MobiledocTransformFunction,
    itemPath: string,
    _options: MobiledocTransformOptions = {}
): string {
    const defaultOptions: Required<Pick<MobiledocTransformOptions, 'assetsOnly' | 'secure' | 'cardTransformers'>> = {assetsOnly: false, secure: false, cardTransformers: []};
    const options = Object.assign({}, defaultOptions, _options, {siteUrl, itemPath});

    // options.cardTransformers has an object for each card that has a name and multiple
    // transformer functions. By collecting the functions we need into a named object it
    // reduces the need to loop through and find the transformer for each card later on
    const cardTransformers: Record<string, (payload: any, options: MobiledocTransformOptions) => any> = {};
    options.cardTransformers.forEach((cardTransformer) => {
        if (options.transformType) {
            cardTransformers[cardTransformer.name] = cardTransformer[options.transformType];
        }
    });
    // Remove cardTransformers from options as it's been processed
    const {cardTransformers: _, ...optionsWithoutCardTransformers} = options;
    const finalOptions = optionsWithoutCardTransformers as MobiledocTransformOptions;

    // function only accepts serialized mobiledoc so there's no chance of accidentally
    // modifying pass-by-reference objects
    const mobiledoc: any = JSON.parse(serializedMobiledoc);

    // any mobiledoc links will have an 'a' markup with an 'href' attribute
    (mobiledoc.markups || []).forEach((markup: any) => {
        if (markup[0] === 'a' && markup[1]) {
            // mobiledoc markup attrs are in an array like ['key', 'value', 'key2', 'value2']
            // we only care about the href attr so loop through and find it so we can get the idx of it's value
            let hrefIndex = -1;

            markup[1].forEach((attr: any, index: number) => {
                if (attr === 'href') {
                    hrefIndex = index + 1;
                }
            });

            if (hrefIndex !== -1) {
                const transformedUrl = transformFunction(markup[1][hrefIndex], siteUrl, itemPath, finalOptions);
                if (transformedUrl) {
                    markup[1][hrefIndex] = transformedUrl;
                }
            }
        }
    });

    // any other urls will be within card payloads. We can't know what format
    // cards may contain so we sub out to card-specific transform functions that
    // are passed in as options from the consuming application.
    (mobiledoc.cards || []).forEach((card: any) => {
        const [name, payload] = card;
        if (cardTransformers[name]) {
            // transformers take a payload and return a transformed payload
            const transformedPayload = cardTransformers[name](payload, finalOptions);
            card[1] = transformedPayload;
        }
    });

    return JSON.stringify(mobiledoc);
}

export default mobiledocTransform;
module.exports = mobiledocTransform;
