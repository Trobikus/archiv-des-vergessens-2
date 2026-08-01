import type { TutorialStep } from "./types";

/** From v1 `tutorial-service.js` `getSteps()`. */
export const TUTORIAL_STEPS = [
  {
    title: "Das Erwachen",
    text: "Die Welten brannten im eisigen Wind des Vergessens. Reiche, Könige, Kriege... all ihre Taten und Errungenschaften wurden aus den Geistern der Sterblichen getilgt. Nur das mystische <b>Archiv des Vergessens</b> steht noch als letzte Bastion des Seins.",
    target: null,
    action: "next"
  },
  {
    title: "Die Berufung",
    text: "Du wurdest auserwählt. Nicht als Krieger des Stahls, sondern als Hüter der verlorenen Mnemes – der kostbaren Erinnerungspartikel, die durch das Nichts treiben. Deine Bestimmung ist es, diese Partikel zu sammeln, um das Archiv wiederaufzubauen.",
    target: null,
    action: "next"
  },
  {
    title: "Das Bündnis",
    text: "Die Last des Bundes ruht nun auf deinen Schultern. Die Schatten breiten sich aus, doch das Licht der Erinnerung darf niemals erlöschen. Tritt ein, Hüter...",
    target: null,
    action: "next"
  },
  {
    text: "Um Erinnerungspartikel zu extrahieren, betreten wir zuerst das Archiv. Klicke auf den Button 📜 <b>Archiv</b>!",
    target: "#hub-archive",
    action: "click_target"
  },
  {
    text: "Hier gewinnst du Mneme-Partikel aus den Strömen des Vergessens. Klicke mehrmals auf den großen Button <b>✨ Mneme-Partikel extrahieren ✨</b>, bis du mindestens 50 Partikel gesammelt hast!",
    target: "#manual-gather-btn",
    action: "wait_event"
  },
  {
    text: "Ausgezeichnet! Nun kannst du deine Klick-Stärke verbessern. Klicke auf <b>Klick-Stärke verbessern</b> (Kosten: 50 Partikel)!",
    target: "#upgrade-click-btn",
    action: "click_target"
  },
  {
    title: "Die Diener des Bundes",
    text: "Hier kannst du Gefährten anwerben, die automatisch für dich arbeiten:<br/><br/>• <b>Sammler</b> (10 Partikel): Generiert stetig Partikel.<br/>• <b>Weber</b> (25 Partikel): Generiert mehr Partikel, mit der Chance auf Relikte.<br/>• <b>Wächter</b> (40 Partikel): Generiert am meisten Partikel, mit der Chance auf Artefakte.",
    target: "#clan-recruit-panel",
    action: "next"
  },
  {
    text: "Gute Arbeit! Lass uns nun zum Hub zurückkehren, um weitere Bereiche deines Reiches zu erkunden. Klicke auf <b>« Zurück zum Hub</b>.",
    target: "#back-to-hub-btn",
    action: "click_target"
  },
  {
    text: "Zurück auf dem Hub siehst du verschiedene Menüs. Lass uns deinen Helden inspizieren. Klicke auf 👤 <b>Mein Held</b>!",
    target: "#hub-hero",
    action: "click_target"
  },
  {
    text: "Hier siehst du deine Attribute, Ausrüstung und dein Inventar. Mit jedem Level-Up kannst du hier Attributspunkte verteilen. Klicke auf das <b>×</b> oben rechts, um das Menü zu schließen.",
    target: "#hero-close",
    action: "click_target",
    dialogPosition: "bottom_center"
  },
  {
    text: "Als Hüter wirst du dich auch Feinden stellen müssen. Klicke auf 📖 <b>Story & Bosse</b>!",
    target: "#hub-story",
    action: "click_target"
  },
  {
    text: "Hier triffst du auf Bosse, die die Erinnerung blockieren. Besiege sie, um neue Kapitel freizuschalten. Klicke auf das <b>×</b> oben rechts, um das Menü zu schließen.",
    target: "#story-close",
    action: "click_target",
    dialogPosition: "bottom_center"
  },
  {
    title: "Der Neubeginn",
    text: "Hervorragend, du hast die Grundlagen verstanden! Baue deinen Clan auf, rekrutiere Gefährten, schmiede Artefakte und bewahre die Welt vor der ewigen Dunkelheit. Möge die Mneme dich leiten!",
    target: null,
    action: "finish"
  }
] as const satisfies readonly TutorialStep[];
