import {
  VISITED_CLASS,
  DETECTED_BOT_CLASS,
  REPORTED_BUTTON_CLASS,
  ready,
  detectChanges,
  createReportButton,
  ApiService,
  Status,
  ObjectKeyMap,
  UserData
} from '../core';

import { Parser } from './parser';

const pageChangesSelector = 'body';

const uncheckedTweetsSelector = `.tweet:not(.${VISITED_CLASS})`;
const tweetsSelector = '.tweet';
const tweetIdAttribute = 'data-tweet-id';
// TODO: change to `data-user-id` when the server is ready
const tweetUserIdAttribute = 'data-screen-name';
const tweetUsernameAttribute = 'data-screen-name';
const reportButtonContainerSelector = '.account-group';

export class TwitterParser implements Parser {
  private _apiService: ApiService;
  private _reportButtonElement: HTMLElement;

  constructor() {
    this._apiService = new ApiService();

    // passing the instance, because the button calls the parser methods
    this._reportButtonElement = createReportButton(this);
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
   * The post element container (facebook post, tweet, etc).
   *
   * @param button The report button
   */
  public getPostElement(button: HTMLElement): Element {
    return button.closest(tweetsSelector);
  }

  /**
   * Get all the relevant user data from the dom
   *
   * @param button The report button
   */
  public getUserData(button: HTMLElement): UserData {
    const tweet = this.getPostElement(button);

    return {
      postId: tweet.getAttribute(tweetIdAttribute),
      userId: tweet.getAttribute(tweetUserIdAttribute),
      username: tweet.getAttribute(tweetUsernameAttribute)
    };
  }

  /**
   * Receive the data from the modal, and send to the server.
   *
   * @param data
   */
  public async reportUser(data: ObjectKeyMap<string | string[]>) {
    await new ApiService().report(data);
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
    tweet.classList.add(VISITED_CLASS);

    try {
      const status = await this._apiService.checkIfBot(userId, 'TWITTER');

      if (status === Status.BOT) {
        tweet.classList.add(DETECTED_BOT_CLASS);
      }

      if (status === Status.REPORTED) {
        tweet.classList.add(REPORTED_BUTTON_CLASS);
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
