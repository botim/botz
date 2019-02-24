/**
 * Detect changes in the supplied element.
 *
 * @param element
 * @param listener
 * @param options
 */
export function detectChanges(
  element: Node | string,
  listener: MutationCallback,
  options: MutationObserverInit = { childList: true }
): MutationObserver {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }

  if (!element) {
    return;
  }

  // Run on updates
  const observer = new MutationObserver(listener);
  observer.observe(element, options);

  // Run the first time
  listener.call(observer, []);

  return observer;
}

/**
 * Wait for element to be added to the dom.
 *
 * @param selector
 */
export async function ready(selector: string): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    let elementObserver: MutationObserver;

    const observerCallback = () => {
      const element = document.querySelector<HTMLElement>(selector);

      if (element) {
        if (elementObserver) {
          elementObserver.disconnect();
        }

        resolve(element);
      }
    };

    elementObserver = detectChanges(document.documentElement, observerCallback);
  });
}
