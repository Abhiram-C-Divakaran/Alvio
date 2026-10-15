let controller = new AbortController();
export function sessionSignal() { return controller.signal; }
export function cancelSessionRequests() {
  controller.abort();
  controller = new AbortController();
  window.dispatchEvent(new Event('alvio-session-ended'));
}
