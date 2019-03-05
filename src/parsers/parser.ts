import { ObjectKeyMap, UserData } from '../core';

export interface Parser {
  /**
   * Main method that run when the relevant network is found.
   */
  handle(): void;

  /**
   * The post element container (facebook post, tweet, etc).
   *
   * @param button The report button
   */
  getPostElement(button: HTMLElement): Element;

  /**
   * Get all the relevant user data from the dom
   *
   * @param button The report button
   */
  getUserData(button: HTMLElement): UserData;

  /**
   * Receive the data from the modal, and send to the server.
   *
   * @param data User data + report inputs
   */
  reportUser(data: ObjectKeyMap<string | string[]>): void;
}
