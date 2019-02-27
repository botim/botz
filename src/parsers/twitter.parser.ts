import {
  ready,
  detectChanges,
  createReportButton,
  VISITED_CLASS as VISITED_ELEMENT_CLASS,
  ApiService,
  DETECTED_BOT_CLASS,
  VISITED_CLASS
} from '../core';

import { Parser } from './parser';

const pageChangesSelector = 'body';

const uncheckedTweetsSelector = `.tweet:not(.${VISITED_CLASS})`;
const tweetsSelector = '.tweet';
const tweetUserIdAttribute = 'data-screen-name'; // TODO: should be changed from username to id
const reportButtonContainerSelector = '.content';

export class TwitterParser implements Parser {
  private _apiService: ApiService;
  private _reportButtonElement = createReportButton(this._getUserIdFromTweet);

  constructor() {
    this._apiService = new ApiService();
  }

  /**
   * Wait for page changes and execute tweets parsing.
   */
  public async handle() {
    await ready(pageChangesSelector);

    detectChanges(pageChangesSelector, this._parseTweets.bind(this), {
      subtree: true,
      attributes: true
    });
  }

  /**
   * Called when clicking the report button, to get user id from the tweet element.
   *
   * @param tweet
   */
  private _getUserIdFromTweet(button: HTMLElement) {
    const tweet = button.closest(tweetsSelector);

    return tweet.getAttribute(tweetUserIdAttribute);
  }

  /**
   * Parse all unchecked tweets in the page, to detect if it's a bot.
   */
  private async _parseTweets() {
    const tweets: NodeListOf<HTMLElement> = document.querySelectorAll(uncheckedTweetsSelector);

    for (const tweet of tweets) {
      const userId = tweet.getAttribute(tweetUserIdAttribute);

      if (!userId) {
        continue;
      }

      this._checkTweet(tweet, userId);
    }
  }

  /**
   * Mark tweet as bot after checking against the api.
   *
   * @param tweet
   * @param userId
   */
  private async _checkTweet(tweet: HTMLElement, userId: string | number) {
    tweet.classList.add(VISITED_ELEMENT_CLASS);

    try {
      const isBot = await this._apiService.checkIfBot(userId);

      if (isBot) {
        tweet.classList.add(DETECTED_BOT_CLASS);
      }

      this._addEventListenersToTweet(tweet);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Show/hide the report button when entering the tweet element.
   *
   * @param tweet
   */
  private _addEventListenersToTweet(tweet: HTMLElement) {
    tweet.addEventListener('mouseenter', () => {
      const containerElement = tweet.querySelector(reportButtonContainerSelector);

      containerElement.prepend(this._reportButtonElement);
    });

    tweet.addEventListener('mouseleave', () => {
      const containerElement = tweet.querySelector(reportButtonContainerSelector);

      if (containerElement.contains(this._reportButtonElement)) {
        containerElement.removeChild(this._reportButtonElement);
      }
    });
  }
}
