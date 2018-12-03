import React from 'react'
import PropTypes from 'prop-types'
import tagsHelper from '@tryghost/helpers/tags'

/*
* Tags helper
* Returns tags for a post
* Options:
*   - post [required, the post object]
*   - limit [optional, default undefined, limits the number of tags to be returned]
*   - separator [optional, default ", ", sets the separator to concat the tags]
*   - prefix [optional, default "", sets a prefix to appear before the tags]
*   - suffix [optional, default "", sets a suffix to appear after the tags]
*   - classes [optional, default """, classNames used for the html tags]
*   - separatorClasses [optional, default "", classNames used for the html separator tags]
*   - prefixClasses [optional, default "", classNames used for the html prefix tags]
*   - suffixClasses [optional, default "", classNames used for the html suffix tags]
*/
const Tags = (props) => {
    let post = props.post
    let opts = {
        limit: props.limit,
        from: props.from,
        to: props.to,
        fallback: props.fallback,
        visibility: props.visibility
    };

    if (props.separator) {
        opts.separator = React.isValidElement(props.separator) ? props.separator :
            <span className={props.separatorClasses}>{props.separator}</span>
    }

    if (props.prefix) {
        opts.prefix = React.isValidElement(props.prefix) ? props.prefix :
            <span className={props.prefixClasses}>{props.prefix}</span>
    }

    if (props.suffix) {
        opts.suffix = React.isValidElement(props.suffix) ? props.suffix :
            <span className={props.suffixClasses}>{props.suffix}</span>
    }


    opts.fn = function process(tag) {
        return <span className={props.classes} key={tag.slug}>{tag.name}</span>
    }

    return (
        tagsHelper(post, opts)
    )
}

Tags.defaultProps = {
    separator: `, `,
    from: 1,
    classes: ``,
    separatorClasses: ``,
    prefixClasses: ``,
    suffixClasses: ``
}

// @TODO: improve validation and figure out if we can pass in react elements as
// separator, prefix and suffix
Tags.propTypes = {
    post: PropTypes.object.isRequired,
    limit: PropTypes.number,
    from: PropTypes.number,
    to: PropTypes.number,
    fallback: PropTypes.object,
    visibility: PropTypes.string,
    classes: PropTypes.string,
    separatorClasses: PropTypes.string,
    prefixClasses: PropTypes.string,
    suffixClasses: PropTypes.string,
}

export default Tags
