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

const uncheckedPostsSelector = `[id^=hyperfeed_story_id]:not(.${VISITED_CLASS})`;
const postsSelector = '[id^=hyperfeed_story_id]';
const postIdAttribute = 'data-dedupekey'; // [data-dedupekey]
// TODO: change to `data-user-id` when the server is ready
const fbUserElementSelector = '.fwb a:not(._wpv)';
const fbUserIdAttribute = 'href';
const fbUserIdValueExtractRegex = /\/\/www.facebook.com\/(.+?)\?/;
const reportButtonContainerSelector = 'div';

export class FacebookParser implements Parser {
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
    detectChanges(pageChangesSelector, this._parsePosts.bind(this), {
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
    return button.closest(postsSelector);
  }

  /**
   * Get all the relevant user data from the dom
   *
   * @param button The report button
   */
  public getUserData(button: HTMLElement): UserData {
    const post: Element = this.getPostElement(button);
    return this.getUserDataFromPost(post);
  }


  /**
   * Get all the relevant user data from the dom
   *
   * @param post A post element
   */
  public getUserDataFromPost(post: Element): UserData {
    const userElement: HTMLElement = post.querySelector(fbUserElementSelector);
    if (!userElement) {
      return null;
    }
    const userId = userElement.getAttribute(fbUserIdAttribute).match(fbUserIdValueExtractRegex)[1];

    return {
      postId: post.getAttribute(postIdAttribute),
      userId: userId,
      username: userElement.innerText
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
  private async _parsePosts() {
    const posts: NodeListOf<HTMLElement> = document.querySelectorAll(uncheckedPostsSelector);

    for (const post of posts) {
      const user = this.getUserDataFromPost(post);

      if (!user) {
        continue;
      }

      this._checkPost(post, user.userId);
    }
  }

  /**
   * Mark tweet as bot after checking against the api.
   *
   * @param tweet
   * @param userId
   */
  private async _checkPost(post: HTMLElement, user: string | number) {
    post.classList.add(VISITED_CLASS);

    try {
      const status = await this._apiService.checkIfBot(user);

      if (status === Status.BOT) {
        post.classList.add(DETECTED_BOT_CLASS);
      }

      if (status === Status.REPORTED) {
        post.classList.add(REPORTED_BUTTON_CLASS);
      }
      this._addEventListenersToPost(post);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Show/hide the report button when entering the tweet element.
   *
   * @param tweet
   */
  private _addEventListenersToPost(post: HTMLElement) {
    post.addEventListener('mouseenter', () => {
      const containerElement = post.querySelector(reportButtonContainerSelector);

      containerElement.prepend(this._reportButtonElement);
    });

    post.addEventListener('mouseleave', () => {

      const containerElement = post.querySelector(reportButtonContainerSelector);

      if (containerElement.contains(this._reportButtonElement)) {
        containerElement.removeChild(this._reportButtonElement);
      }
    });
  }
}
