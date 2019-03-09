import { Parser, TwitterParser, FacebookParser } from './parsers';

/**
 * Detect social network and run the relevant parser.
 */
async function bootstrap() {
  let network = window.location.hostname || '';

  network = network.replace('www.', '');

  let parser: Parser;

  switch (network) {
    case 'twitter.com':
      parser = new TwitterParser();
      break;

    case 'facebook.com':
      parser = new FacebookParser();
      break;

    case 'instagram.com':
      throw new Error('Instagram not implemented!');
  }

  if (!parser) {
    throw new Error('Social network not supported.');
  }

  parser.handle();
}

/**
 * Run the extension.
 */
try {
  bootstrap();
} catch (error) {
  console.error(`An error was thrown`, error);
}
