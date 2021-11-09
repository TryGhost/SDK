"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _gatsbyLink = _interopRequireDefault(require("gatsby-link"));

var _helpers = require("@tryghost/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Tags helper
 *
 * Filters and outputs tags for a post
 *
 * @param {{tags: [*]}} data - the data we are filtering
 * @param {object} options - filter options
 * @param {int} [options.limit] - limits the number of tags to be returned
 * @param {int} [options.from=1] - index of the tag to start iterating from
 * @param {int} [options.to] - index of the last tag to iterate over
 * @param {string} [options.separator=","] - string used between each tag
 * @param {string} [options.prefix] - string to output before each tag
 * @param {string} [options.suffix] - string to output after each tag
 * @param {string} [options.visibility="public"] - change to "all" to include internal tags
 * @param {boolean} [options.autolink=true] - whether to convert tags to links
 * @param {string} [options.permalink="/:slug"] - the pattern used for links
 * @param {object} [options.fallback] - a fallback tag to output if there are none
 * @param {function} [options.fn] - function to call on each tag, default outputs tag.name in a span
 * @param {string} [options.classes] - classNames applied to each tag
 * @param {string} [options.separatorClasses] - classNames applied to the separator span
 * @param {string} [options.prefixClasses] - classNames applied to the prefix span
 * @param {string} [options.suffixClasses] - classNames applied to the suffix span
 * @param {string} [options.linkClasses] - classNames applied to each link
 */
var Tags = function Tags(props) {
  var opts = {
    limit: props.limit,
    from: props.from,
    to: props.to,
    fallback: props.fallback,
    visibility: props.visibility
  };
  var keyIndex = 0;

  var generateKey = function generateKey(pre) {
    keyIndex = keyIndex + 1;
    return "".concat(pre, "_").concat(keyIndex);
  };

  Object.defineProperty(opts, 'separator', {
    get: function get() {
      if (props.separator === '') {
        return null;
      } else if ( /*#__PURE__*/_react["default"].isValidElement(props.separator)) {
        return /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, {
          key: generateKey('separator')
        }, props.separator);
      }

      return /*#__PURE__*/_react["default"].createElement("span", {
        className: props.separatorClasses,
        key: generateKey('separator')
      }, props.separator);
    }
  });

  if (props.prefix) {
    opts.prefix = /*#__PURE__*/_react["default"].isValidElement(props.prefix) ? props.prefix : /*#__PURE__*/_react["default"].createElement("span", {
      className: props.prefixClasses,
      key: "prefix"
    }, props.prefix);
  }

  if (props.suffix) {
    opts.suffix = /*#__PURE__*/_react["default"].isValidElement(props.suffix) ? props.suffix : /*#__PURE__*/_react["default"].createElement("span", {
      className: props.suffixClasses,
      key: "suffix"
    }, props.suffix);
  }

  opts.fn = function process(tag) {
    var tagLink = props.permalink;
    tagLink = tagLink.replace(/:slug/, tag.slug) || "/".concat(tag.slug, "/");
    return props.autolink ? /*#__PURE__*/_react["default"].createElement("span", {
      className: props.classes,
      key: tag.slug
    }, /*#__PURE__*/_react["default"].createElement(_gatsbyLink["default"], {
      to: tagLink,
      className: props.linkClasses
    }, tag.name)) : /*#__PURE__*/_react["default"].createElement("span", {
      className: props.classes,
      key: tag.slug
    }, tag.name);
  };

  return (0, _helpers.tags)(props.post, opts);
};

Tags.defaultProps = {
  separator: ", ",
  from: 1,
  classes: "",
  separatorClasses: "",
  prefixClasses: "",
  suffixClasses: "",
  linkClasses: "",
  permalink: "/:slug/",
  autolink: true
};
Tags.propTypes = {
  post: _propTypes["default"].shape({
    tags: _propTypes["default"].arrayOf(_propTypes["default"].shape({
      name: _propTypes["default"].string,
      slug: _propTypes["default"].string
    })).isRequired
  }).isRequired,
  limit: _propTypes["default"].number,
  from: _propTypes["default"].number,
  to: _propTypes["default"].number,
  fallback: _propTypes["default"].object,
  visibility: _propTypes["default"].oneOf(["public", "all", "internal"]),
  permalink: _propTypes["default"].string,
  autolink: _propTypes["default"].bool,
  classes: _propTypes["default"].string,
  separatorClasses: _propTypes["default"].string,
  prefixClasses: _propTypes["default"].string,
  suffixClasses: _propTypes["default"].string,
  linkClasses: _propTypes["default"].string
};
var _default = Tags;
exports["default"] = _default;