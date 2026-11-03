---
type: llm
---

PASS if the reply sets position to "bottom-left" in Opem.init (or the equivalent dashboard setting), hides the launcher with launcher: false on the page with the custom button, and opens the panel from that button with Opem.open (for example Opem.open("request") or Opem.open({ tab: "request" })) or the trigger option.
FAIL if it invents options that do not exist, edits the widget script, or says the position can only be changed in code when the dashboard also sets it.
