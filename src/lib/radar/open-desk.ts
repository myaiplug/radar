const KEY = "radar.opened";

export function deskOpened(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function openDesk(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event("radar-open"));
}
