/** React resets forms during commit, when its delegated events are disabled.
 * A native listener keeps failed-action drafts, including native selects.
 * Successful submissions replace the form; React 19 runs this ref cleanup. */
export function preserveFormDraft(form: HTMLFormElement | null) {
  if (!form) return;
  const retain = (event: Event) => event.preventDefault();
  form.addEventListener("reset", retain);
  return () => form.removeEventListener("reset", retain);
}
