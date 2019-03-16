import {
  VISITED_CLASS,
  DETECTED_BOT_CLASS,
  ready,
  detectChanges,
  createReportButton,
  ApiService,
  Status,
  ObjectKeyMap,
  UserData,
  Platform
} from '../core';

import { Parser } from './parser';

const pageChangesSelector = 'body';

const tweetsSelector = '.tweet';
const quotedTweetsSelector = '.QuoteTweet-innerContainer';
const uncheckedTweetsSelector = `${tweetsSelector}:not(.${VISITED_CLASS}), ${quotedTweetsSelector}:not(.${VISITED_CLASS})`;
const tweetIdAttribute = 'data-tweet-id';
const tweetUserIdAttribute = 'data-user-id';
const tweetUsernameAttribute = 'data-screen-name';
const reportButtonContainerSelector = '.account-group';

export class TwitterParser implements Parser {
  private _apiService: ApiService;
  private _reportButtonElement: HTMLElement;

  constructor() {
    this._apiService = new ApiService(Platform.TWITTER);

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
    await this._apiService.report({ ...data });
  }

  /**
   * Parse all unchecked tweets in the page, to detect if it's a bot.
   */
  private async _parseTweets() {
    const tweets: NodeListOf<HTMLElement> = document.querySelectorAll(uncheckedTweetsSelector);
    const mappedTweets: ObjectKeyMap<HTMLElement> = {};

    if (!tweets.length) {
      return;
    }

    for (const tweet of tweets) {
      const userId = tweet.getAttribute(tweetUserIdAttribute);

      if (!userId) {
        continue;
      }

      mappedTweets[userId] = tweet;
    }

    if (!Object.keys(mappedTweets).length) {
      return;
    }

    const statuses = await this._apiService.checkIfBot({ ...mappedTweets });

    for (const userId of Object.keys(statuses)) {
      this._checkTweet(mappedTweets[userId], statuses[userId]);
    }
  }

  /**
   * Mark tweet as bot after checking against the api.
   *
   * @param tweet
   * @param status
   */
  private async _checkTweet(tweet: HTMLElement, status: Status) {
    tweet.classList.add(VISITED_CLASS);

    try {
      if (status === Status.BOT) {
        tweet.classList.add(DETECTED_BOT_CLASS);
      }

      this._addEventListenersToTweet(tweet);
    } catch (error) {
      console.error(error);
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
