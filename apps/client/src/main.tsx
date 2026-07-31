import { render } from "preact";

import { App } from "./ui/App";
import "./styles.css";

const root = document.getElementById("app");
if (!root) {
  throw new Error("Missing #app mount node");
}

render(<App />, root);
