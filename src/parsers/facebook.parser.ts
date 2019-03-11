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
  UserData,
  Platform
} from '../core';

import { Parser } from './parser';

const pageChangesSelector = 'body';

const feedPostsSelector = '.userContentWrapper > div:nth-child(1)';
const feedSharedPostSelector = `${feedPostsSelector} .mtm._5pcm`;
const commentsSelector = '[aria-label^="Comment"]';
const photoModalSelector = '.uiScrollableAreaContent .fbPhotoSnowliftAuthorInfo';
const videoModalSelector = '[role="dialog"] .commentable_item > div > div > div > ._1rgv';

const allPostsSelectors: string[] = [
  feedPostsSelector,
  feedSharedPostSelector,
  commentsSelector,
  photoModalSelector,
  videoModalSelector
];
const checkedAllPostsSelectors = allPostsSelectors.join(', ');
const uncheckedAllPostsSelectors = allPostsSelectors
  .map((selector: string) => `${selector}:not(.${VISITED_CLASS})`)
  .join(', ');

const profileLinkAttribute = 'data-hovercard';
const profileLinkSelector = `a[${profileLinkAttribute}]`;
const extractUserIdPattern = /id=(\d+)/;

const commentLinkSelector =
  '[data-testid="UFI2CommentActionLinks/root"] a[href^="http"], .uiLinkSubtle, a[rel="async"]';
const commentLinkAttribute = 'href';
const commentLinkPattern = /^[^\/]*((?<!permalink\/|p\.|posts\/|videos\/).)*(?<postId>\d+)((?<!comment_id=).)*(?<commentId>\d+)*((?<!reply_comment_id=).)*(?<replyCommentId>\d+)*.*$/;
const postCommentFormSelector = '[name="ft_ent_identifier"]';
const postCommentFormAttribute = 'value';

const reportButtonContainerSelector = 'div:nth-child(2) > div';

export class FacebookParser implements Parser {
  private _apiService: ApiService;
  private _reportButtonElement: HTMLElement;

  constructor() {
    // TODO: platform for local storage
    this._apiService = new ApiService(Platform.FACEBOOK);

    // passing the instance, because the button calls the parser methods
    this._reportButtonElement = createReportButton(this);
  }

  /**
   * Wait for page changes and execute posts parsing.
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
    return button.closest(checkedAllPostsSelectors);
  }

  /**
   * Get all the relevant user data from the dom
   *
   * @param button The report button
   */
  public getUserData(button: HTMLElement): Partial<UserData> {
    const post = this.getPostElement(button);

    return {
      userId: this._getUserIdFromPost(post),
      username: this._getUserNameFromPost(post),
      ...this._getPostAndCommentIdsFromPost(post)
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
   * Parse all unchecked posts and comments in the page, to detect if it's a bot.
   */
  private async _parsePosts() {
    const posts: NodeListOf<HTMLElement> = document.querySelectorAll(
      uncheckedAllPostsSelectors
    );

    const mappedPosts: ObjectKeyMap<HTMLElement> = {};

    for (const post of posts) {
      const userId = this._getUserIdFromPost(post);

      if (!userId) {
        continue;
      }

      mappedPosts[userId] = post;
    }

    const statuses = await this._apiService.checkIfBot(Object.keys(mappedPosts));

    for (const userId of Object.keys(statuses)) {
      this._checkPost(mappedPosts[userId], statuses[userId]);
    }
  }

  /**
   * Mark post/comment as bot after checking against the api.
   *
   * @param post
   * @param userId
   */
  private async _checkPost(post: HTMLElement, userId: string) {
    post.classList.add(VISITED_CLASS);

    try {
      if (status === Status.BOT) {
        post.classList.add(DETECTED_BOT_CLASS);
      }

      if (status === Status.REPORTED) {
        post.classList.add(REPORTED_BUTTON_CLASS);
      }

      this._addEventListenersToPost(post);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Show/hide the report button when entering the post element.
   *
   * @param post
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

  /**
   * Extract user id from the profile link.
   *
   * @param post Container element of the post
   */
  private _getUserIdFromPost(post: Element): string {
    const user = post.querySelector(profileLinkSelector);

    if (!user) {
      return;
    }

    const userInfo = user.getAttribute(profileLinkAttribute);

    const [, userId] = userInfo.match(extractUserIdPattern);

    return userId;
  }

  /**
   * Extract user name from the profile image.
   *
   * @param post Container element of the post
   */
  private _getUserNameFromPost(post: Element): string {
    let username: string;

    const userProfileLink = post.querySelector(profileLinkSelector);

    // the username is usually on the profile link
    const userProfileImage = userProfileLink.querySelector('img');
    if (userProfileImage) {
      username =
        userProfileImage.getAttribute('alt') || userProfileImage.getAttribute('aria-label');
    }

    // but sometimes, it's on the profile user name
    const { textContent } = userProfileLink;
    if (!username && textContent) {
      username = textContent;
    }

    return username;
  }

  /**
   * Extract post id and comment id from the container.
   *
   * @param post Container element of the post
   */
  private _getPostAndCommentIdsFromPost(post: Element): Partial<UserData> {
    const comment = post.querySelector(commentLinkSelector);

    // first, try to get from comment link
    if (comment) {
      const {
        groups: { postId, commentId, replyCommentId }
      } = comment.getAttribute(commentLinkAttribute).match(commentLinkPattern);

      return {
        postId,
        commentId,
        replyCommentId
      };
    }

    // second, try to get from comment form (for posts)
    let postCommentFormContainer = post.closest('.commentable_item');

    if (!postCommentFormContainer) {
      postCommentFormContainer = post.nextElementSibling;
    }

    if (postCommentFormContainer) {
      const postCommentForm = postCommentFormContainer.querySelector(postCommentFormSelector);

      if (postCommentForm) {
        return { postId: postCommentForm.getAttribute(postCommentFormAttribute) };
      }
    }

    return { postId: '', commentId: '' };
  }
}
