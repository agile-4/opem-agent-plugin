---
type: llm
---

PASS if the reply says the page's origin (scheme, host and port) is not in the project's allowed origins and tells the user to add it on the Configuration page's Origins tab, and mentions that each origin such as http://localhost:3000 or a preview host counts separately.
FAIL if it blames the key, the Content-Security-Policy or the plan as the first cause, or suggests editing the widget script.
