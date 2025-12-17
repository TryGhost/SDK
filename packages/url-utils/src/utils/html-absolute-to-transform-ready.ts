import type {HtmlTransformOptionsInput, AbsoluteToTransformReadyOptionsInput} from './types';
import htmlTransform from './html-transform';
import absoluteToTransformReady from './absolute-to-transform-ready';
import buildEarlyExitMatchModule from './build-early-exit-match';
const {buildEarlyExitMatch} = buildEarlyExitMatchModule;

const htmlAbsoluteToTransformReady = function (
    html: string = '',
    siteUrl: string,
    _options: AbsoluteToTransformReadyOptionsInput = {}
): string {
    const defaultOptions: AbsoluteToTransformReadyOptionsInput = {assetsOnly: false, ignoreProtocol: true};
    const options: HtmlTransformOptionsInput = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain the siteUrl or configured asset bases
    const earlyExitMatch = buildEarlyExitMatch(siteUrl, options);
    if (earlyExitMatch) {
        options.earlyExitMatchStr = earlyExitMatch;
    }

    // need to ignore itemPath because absoluteToRelative doesn't take that option
    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToTransformReadyOptionsInput): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
};

export default htmlAbsoluteToTransformReady;
