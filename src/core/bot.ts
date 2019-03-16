import {
  REPORT_BUTTON_CLASS,
  MODAL_CLASS,
  MODAL_WRAPPER_CLASS,
  MODAL_SUBMIT_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_WRAPPER_SUBMITTED_CLASS,
  MODAL_HIDE_REPORTER_KEY_CLASS
} from './consts';
import { ObjectKeyMap, UserData } from './symbols';
import { Parser } from '../parsers';

const STORAGE_REPORTER_KEY = 'botzReporterKey';

/**
 * Create a link element to report a user.
 *
 * @param getUserId Supplied function that returns the user id from the dom
 */
export function createReportButton(parser: Parser): HTMLElement {
  const element = document.createElement('a');
  element.setAttribute('class', REPORT_BUTTON_CLASS);

  element.addEventListener('click', async function(event) {
    // prevent clicking on the profile image
    event.preventDefault();

    const input = await openModal('report', parser.getUserData(this));

    if (input) {
      try {
        window.localStorage[STORAGE_REPORTER_KEY] = input.reporterKey;
        await parser.reportUser(input);
      } catch (error) {
        delete window.localStorage[STORAGE_REPORTER_KEY];
        openModal('invalid-reporter-key');
      }
    }
  });

  return element;
}

/**
 * Dynamic load an html template file.
 *
 * @param name Name of the modal template, '../templates/name-modal.html'
 * @param data Data to replace in the modal and to send to the server
 */
export async function loadTemplate(name: string, data?: Partial<UserData>): Promise<string> {
  let modalTemplate = await import(`../templates/${name}-modal.html`);

  if (!data) {
    return modalTemplate;
  }

  for (const [key, value] of Object.entries(data)) {
    modalTemplate = modalTemplate.replace(new RegExp(`{{ ${key} }}`, 'g'), value);
  }

  return modalTemplate;
}

/**
 * If there's already a reporter key in local storage,
 *  set it in form and hide reporter key input
 */
function initReporterKeyInput(modalWrapperElement: Element) {
  const reporterKeyInput: HTMLInputElement = modalWrapperElement.querySelector(
    '[name="reporterKey"]'
  );
  const reporterKey = window.localStorage[STORAGE_REPORTER_KEY] || null;

  if (reporterKey) {
    reporterKeyInput.value = reporterKey;
    reporterKeyInput.classList.add(MODAL_HIDE_REPORTER_KEY_CLASS);
  }
}

/**
 * Open modal on the screen and send form data to server.
 *
 * @param name Dynamic load of modal html from '../templates/name-modal.html'
 * @param data Data to replace in the modal and to send to the server
 */
export async function openModal(
  name: string,
  data?: Partial<UserData>
): Promise<ObjectKeyMap<string | string[]>> {
  const modalTemplate = await loadTemplate(name, data);

  const openedModal = document.querySelector(`.${MODAL_WRAPPER_CLASS}`);
  if (openedModal) {
    openedModal.remove();
  }

  document.body.insertAdjacentHTML('afterbegin', modalTemplate);

  const modalWrapperElement = document.querySelector(`.${MODAL_WRAPPER_CLASS}`);
  const modalElement = document.querySelector<HTMLElement>(`.${MODAL_CLASS}`);

  return new Promise(resolve => {
    // close modal when clicking on the wrapper
    modalWrapperElement.addEventListener('click', function() {
      this.remove();
      resolve();
    });

    // unless you click on the modal itself
    modalElement.addEventListener('click', event => event.stopPropagation());

    // submit the form data and show thank you modal
    const submitButton = modalElement.querySelector(`.${MODAL_SUBMIT_CLASS}`);
    if (submitButton) {
      submitButton.addEventListener('click', () => {
        modalWrapperElement.classList.add(MODAL_WRAPPER_SUBMITTED_CLASS);

        resolve({ ...data, ...getInputData(modalElement) });
      });
    }

    // close button in the thank you modal
    modalWrapperElement
      .querySelector(`.${MODAL_CLOSE_CLASS}`)
      .addEventListener('click', () => modalWrapperElement.remove());

    initReporterKeyInput(modalWrapperElement);
  });
}

/**
 * Returns all the inputs in the element,
 *  checkboxes returned as array of the checked values.
 *
 * @param element Container of the inputs
 */
export function getInputData(element: HTMLElement): ObjectKeyMap<string | string[]> {
  const inputs: HTMLCollectionOf<HTMLInputElement> = element.getElementsByTagName('input');
  const returnedData: ObjectKeyMap<string | string[]> = {};

  for (const input of inputs) {
    let value: string | string[] = input.value;

    if (input.type === 'checkbox') {
      if (!input.checked) {
        continue;
      }

      value = [...(returnedData[input.name] || ''), value];
    }

    returnedData[input.name] = value;
  }

  return returnedData;
}
