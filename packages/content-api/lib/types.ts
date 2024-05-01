export type ResourceMap = {
    authors: Author;
    newsletters: Newsletter;
    offers: Offer;
    pages: Page;
    posts: Post;
    recommendations: Recommendation;
    settings: Settings;
    tags: Tag;
    tiers: Tier;
};

export type Tag = {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    /** Format: uri */
    feature_image?: string;
    visibility?: string;
    meta_title?: string;
    meta_description?: string;
    /** Format: uri */
    og_image?: string;
    og_title?: string;
    og_description?: string;
    /** Format: uri */
    twitter_image?: string;
    twitter_title?: string;
    twitter_description?: string;
    codeinjection_head?: string;
    codeinjection_foot?: string;
    canonical_url?: string;
    accent_color?: string;
    /** Format: uri */
    url?: string;
};

export type Author = {
    /** @description Bio of the author */
    bio?: string | null;
    /**
     * Count
     * @description Count of posts assigned to the author. Requires the `include=count.posts` as a query parameter.
     */
    count?: {
        posts?: number;
    };
    /** Format: uri */
    cover_image?: string | null;
    facebook?: string | null;
    /**
     * Format: integer
     * @description Incremental ID of the author
     */
    id?: string;
    location?: string | null;
    meta_description?: string | null;
    meta_title?: string | null;
    name?: string;
    /** Format: uri */
    profile_image?: string | null;
    slug?: string;
    twitter?: string | null;
    /**
     * Format: uri
     * @description Web address for the author's page
     */
    url?: string;
    /**
     * Format: uri
     * @description Website URL of the author
     */
    website?: string | null;
};

export type Tier = {
    active?: boolean;
    benefits?: unknown[];
    /** Format: date-time */
    created_at?: string;
    currency?: string;
    description?: string | null;
    id?: string;
    monthly_price?: number;
    name?: string;
    slug?: string;
    trial_days?: number;
    type?: string;
    /** Format: date-time */
    updated_at?: string;
    visibility?: string;
    welcome_page_url?: string | null;
    yearly_price?: number;
};

export type Post = {
    access?: boolean;
    /** @description Requires `include=authors` query parameter */
    authors?: Author[] | [];
    canonical_url?: string | null;
    codeinjection_foot?: string | null;
    codeinjection_head?: string | null;
    comment_id?: string;
    comments?: boolean;
    /** Format: date-time */
    created_at?: string;
    custom_excerpt?: string | null;
    custom_template?: string | null;
    email_subject?: string | null;
    excerpt?: string;
    /** Format: uri */
    feature_image?: string | null;
    feature_image_alt?: string | null;
    /** @description Caption for the cover image associated with the post (supports basic html) */
    feature_image_caption?: string | null;
    featured?: boolean;
    frontmatter?: string | null;
    html?: string;
    id?: string;
    meta_description?: string | null;
    meta_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    og_title?: string | null;
    plaintext?: string;
    /** @description Requires `include=authors` query parameter */
    primary_author?: Author;
    /** @description Requires `include=tags` query parameter */
    primary_tag?: Tag;
    /** Format: date-time */
    published_at?: string;
    reading_time?: number;
    slug?: string;
    /** @description Requires `include=tags` query parameter */
    tags?: Tag[];
    tiers?: Tier[];
    title?: string;
    twitter_description?: string | null;
    twitter_image?: string | null;
    twitter_title?: string | null;
    /** Format: date-time */
    updated_at?: string;
    /** Format: uri */
    url?: string;
    /** Format: uuid */
    uuid?: string;
    /**
     * Visibility
     * @enum {string}
     */
    visibility?: 'public' | 'paid';
};

export type Page = Post & {
    show_title_and_feature_image?: boolean;
};

export type Newsletter = {
    /** Format: date-time */
    created_at?: string;
    description?: string | null;
    id?: string;
    name?: string;
    sender_email?: string | null;
    slug?: string;
    sort_order?: number;
    subscribe_on_signup?: boolean;
    /** Format: date-time */
    updated_at?: string;
    /** Format: uuid */
    uuid?: string;
    visibility?: string;
};

export type Settings = {
    accent_color?: string;
    allow_self_signup?: boolean;
    codeinjection_foot?: string | null;
    codeinjection_head?: string | null;
    comments_enabled?: string;
    /** Format: uri */
    cover_image?: string;
    description?: string;
    facebook?: string;
    firstpromoter_account?: string | null;
    icon?: string | null;
    lang?: string;
    locale?: string;
    logo?: string | null;
    members_enabled?: boolean;
    members_invite_only?: boolean;
    members_support_address?: string;
    meta_description?: string | null;
    meta_title?: string | null;
    navigation?: {
        label?: string;
        url?: string;
    }[];
    og_description?: string | null;
    og_image?: string | null;
    og_title?: string | null;
    outbound_link_tagging?: boolean;
    paid_members_enabled?: boolean;
    portal_button?: boolean;
    portal_button_icon?: string | null;
    portal_button_signup_text?: string;
    portal_button_style?: string;
    portal_name?: boolean;
    portal_plans?: string[];
    portal_signup_checkbox_required?: boolean;
    portal_signup_terms_html?: string | null;
    recommendations_enabled?: boolean;
    secondary_navigation?: {
        label?: string;
        url?: string;
    }[];
    timezone?: string;
    title?: string;
    twitter?: string;
    twitter_description?: string | null;
    twitter_image?: string | null;
    twitter_title?: string | null;
    /** Format: uri */
    url?: string;
    version?: string;
};

export type Offer = {
    amount?: number;
    cadence?: string;
    currency?: string | null;
    currency_restriction?: boolean;
    display_description?: string;
    display_title?: string;
    duration?: string;
    duration_in_months?: string | null;
    id?: string;
    name?: string;
    status?: string;
    /** Tier */
    tier?: {
        id?: string;
        name?: string;
    };
    type?: string;
};

export type Recommendation = {
    created_at?: string;
    excerpt?: string | null;
    favicon?: string | null;
    featured_image?: string | null;
    id?: string;
    one_click_subscribe?: boolean;
    reason?: string;
    title?: string;
    /** Format: date-time */
    updated_at?: string;
    /** Format: uri */
    url?: string;
};

export type Meta = {
    pagination?: {
        limit?: string;
        next?: string | null;
        page?: string;
        pages?: string;
        prev?: string | null;
        total?: string;
    };
};

export type Params = {
    /** @description id */
    id: string;
    /** @description Filter the result set to only include resources that match the provided criteria */
    filter?: string;
    /** @description Tells the API to return additional data related to the resource you have requested. Doesn't work well with `fields` */
    include?: string;
    /** @description Select fields to return. Doesn't work well with `include` */
    fields?: string;
    /** @description Return `HTML` or `plaintext` */
    formats?: string;
    /** @description Limit the number of resources in the response */
    limit?: string | number;
    /** @description Change the order of results returned */
    order?: string;
    /** @description Paginate through collections of resources. By default, the first 15 records are returned. */
    page?: string;
};

export type ParamsWithKey = (Params & { key: string }) | undefined;

export type BrowseParams = Pick<
    Params,
    'limit' | 'page' | 'fields' | 'filter' | 'order' | 'include'
>;

export type ReadParams = Pick<Params, 'fields' | 'include'>;

export type IdOrSlug =
    | { id: string; slug?: never }
    | { id?: never; slug: string };

export type UserInputs = {
    url: string;
    key: string;
    acceptVersionHeader?: string;
    userAgent?: string | boolean;
    ghostPath?: string;
    makeRequest?: ({
        url,
        method,
        options,
        headers
    }: RequestInit & {
        url: string;
        options?: Partial<Params>;
    }) => Promise<Response>;
};
