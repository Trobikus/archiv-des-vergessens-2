import { render } from "preact";

import { installDesktopLockdown } from "./services/desktop-lockdown";
import { App } from "./ui/App";
import "./styles.css";

installDesktopLockdown();

const root = document.getElementById("app");
if (!root) {
  throw new Error("Missing #app mount node");
}

render(<App />, root);
