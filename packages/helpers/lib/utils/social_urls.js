// Creates the canonical twitter URL without the '@'
export const twitter = username => ('https://twitter.com/' + username.replace(/^@/, ''));

// Handles a starting slash, this shouldn't happen, but just in case
export const facebook = username => ('https://www.facebook.com/' + username.replace(/^\//, ''));
