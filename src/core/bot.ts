import { REPORT_BUTTON_CLASS } from './consts';

/**
 * Create a link element to report a user.
 *
 * @param getUserId Supplied function that returns the user id from the dom
 */
export function createReportButton(
  getUserId: (element: HTMLElement) => string | number
): HTMLElement {
  const element = document.createElement('a');
  element.setAttribute('class', REPORT_BUTTON_CLASS);

  element.addEventListener('click', function(event) {
    // prevent clicking on the profile image
    event.preventDefault();

    alert(`${getUserId(this)} reported!`);
  });

  return element;
}
