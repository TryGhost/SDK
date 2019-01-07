import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import { tags as tagsHelper } from '@tryghost/helpers'

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
const Tags = (props) => {
    let opts = {
        limit: props.limit,
        from: props.from,
        to: props.to,
        fallback: props.fallback,
        visibility: props.visibility,
    }

    if (props.separator) {
        opts.separator = React.isValidElement(props.separator) ? props.separator :
            <><span className={props.separatorClasses}>{props.separator}</span></>
    }

    if (props.prefix) {
        opts.prefix = React.isValidElement(props.prefix) ? props.prefix :
            <><span className={props.prefixClasses}>{props.prefix}</span></>
    }

    if (props.suffix) {
        opts.suffix = React.isValidElement(props.suffix) ? props.suffix :
            <><span className={props.suffixClasses}>{props.suffix}</span></>
    }

    opts.fn = function process(tag) {
        let tagLink = props.permalink
        tagLink = tagLink.replace(/:slug/, tag.slug) || `/${tag.slug}/`

        return props.autolink ?
            <>
                <span className={props.classes} key={tag.slug}>
                    <Link to={tagLink} className={props.linkClasses}>{tag.name}</Link>
                </span>
            </> :
            <><span className={props.classes} key={tag.slug}>{tag.name}</span></>
    }

    return (
        tagsHelper(props.post, opts)
    )
}

Tags.defaultProps = {
    separator: `, `,
    from: 1,
    classes: ``,
    separatorClasses: ``,
    prefixClasses: ``,
    suffixClasses: ``,
    linkClasses: ``,
    permalink: `/:slug/`,
    autolink: true,
}

Tags.propTypes = {
    post: PropTypes.shape({
        tags: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                slug: PropTypes.string,
            })
        ).isRequired,
    }).isRequired,
    limit: PropTypes.number,
    from: PropTypes.number,
    to: PropTypes.number,
    fallback: PropTypes.object,
    visibility: PropTypes.oneOf([`public`, `all`, `internal`]),
    permalink: PropTypes.string,
    autolink: PropTypes.bool,
    classes: PropTypes.string,
    separatorClasses: PropTypes.string,
    prefixClasses: PropTypes.string,
    suffixClasses: PropTypes.string,
    linkClasses: PropTypes.string,
}

export default Tags
