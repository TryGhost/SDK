# Referrer Parser

A simple library for parsing referrer URLs to identify their source and medium.

## Installation

```bash
npm install @tryghost/referrer-parser
# or
yarn add @tryghost/referrer-parser
```

## Usage

### Basic Usage

```javascript
const { parse } = require('@tryghost/referrer-parser');

// Parse a referrer URL
const result = parse('https://www.google.com/search?q=ghost+cms');
console.log(result);
// {
//   referrerSource: 'Google',
//   referrerMedium: 'search',
//   referrerUrl: 'www.google.com'
// }
```

### With Site Configuration

```javascript
const { parse } = require('@tryghost/referrer-parser');

// Parse with site configuration to detect internal traffic
const result = parse(
  'https://example.com/blog?utm_source=newsletter&utm_medium=email',
  { 
    siteUrl: 'https://example.com',
    adminUrl: 'https://example.com/ghost'
  }
);
```

### Using the ReferrerParser Class

For more advanced usage, you can use the `ReferrerParser` class directly:

```javascript
const { ReferrerParser } = require('@tryghost/referrer-parser');

// Create a parser instance
const parser = new ReferrerParser({
  siteUrl: 'https://example.com',
  adminUrl: 'https://example.com/ghost'
});

// Parse multiple URLs with the same configuration
const result1 = parser.parse('https://www.google.com/search?q=ghost+cms');
const result2 = parser.parse('https://twitter.com/ghostcms');
```

## Features

- Identifies sources and mediums from known referrers
- Handles special cases for Ghost Explore and Ghost Newsletters
- Detects UTM parameters
- Works with or without site/admin URL configuration
- TypeScript support

## TypeScript Support

This package is fully written in TypeScript and provides its own type definitions.

```typescript
import { parse, ReferrerParser, ReferrerData, ParserOptions } from '@tryghost/referrer-parser';

// Parse a referrer URL with type safety
const result: ReferrerData = parse('https://www.google.com/search?q=ghost+cms');
console.log(result.referrerSource);  // 'Google'
console.log(result.referrerMedium);  // 'search'
console.log(result.referrerUrl);     // 'www.google.com'

// Configure the parser with typed options
const options: ParserOptions = {
  siteUrl: 'https://example.com',
  adminUrl: 'https://example.com/ghost'
};

// Create a parser instance with TypeScript
const parser = new ReferrerParser(options);
const customResult = parser.parse('https://example.com/blog?utm_source=newsletter');
```

## License

MIT 

## Testing

Run the tests with:

```bash
yarn test
```

This will run the test suite using Mocha and report on test coverage. 