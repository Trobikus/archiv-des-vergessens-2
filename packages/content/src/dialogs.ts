import type { DialogDefinition, NpcDefinition } from "./types";

/** From v1 `js/data/dialogs.js`. */
export const NPCS = {
  archivist: {
    id: "archivist",
    name: "Archivar Theron",
    name_en: "Archivist Theron",
    title: "Hüter der verblassenden Schriften",
    title_en: "Keeper of the Fading Writings",
    portrait: "📜",
    location: "hub",
    isCinematic: true,
    cinematic: "archive-halls",
    dialogs: [
      {
        id: "first_meeting",
        text: "Tritt näher, Wanderer... wenn du noch einen Funken deiner selbst in dir trägst. Ich bin Theron, der Hüter dieser sterbenden Hallen. Jede Lichtglyphe, die du hier siehst, ist ein Gedanke, ein Atemzug, ein ungeschriebenes Schicksal, das im Begriff ist, für immer zu verblassen.",
        text_en: "Step closer, wanderer... if you still carry a spark of yourself within. I am Theron, the keeper of these dying halls. Every glyph of light you see here is a thought, a breath, an unwritten destiny that is about to fade forever.",
        cinematic: "archive-halls",
        options: [
          {
            text: "Was ist dieser unendliche Ort?",
            text_en: "What is this infinite place?",
            next: "what_is_archive"
          },
          {
            text: "Ich suche einen Ausweg aus diesem Albtraum...",
            text_en: "I seek a way out of this nightmare...",
            next: "seeking_path"
          },
          {
            text: "Ich habe keine Zeit für deine philosophischen Klagen.",
            text_en: "I have no time for your philosophical laments.",
            next: "rude_dismiss"
          }
        ]
      },
      {
        id: "what_is_archive",
        text: "Das Archiv ist das kosmische Mausoleum der Menschheit. Ein stiller Hafen außerhalb von Zeit und Raum, erbaut aus den Trümmern vergessener Epochen. Jede Tat, jeder Verrat, jede zärtliche Erinnerung – wir weben sie hier in die Mauern, um das Fundament der Realität vor dem Einsturz zu bewahren.",
        text_en: "The Archive is the cosmic mausoleum of humanity. A silent haven outside of time and space, built from the debris of forgotten epochs. Every deed, every betrayal, every tender memory – we weave them into the walls here to prevent the foundation of reality from collapsing.",
        cinematic: "archive-halls",
        options: [
          {
            text: "Wie kann ich helfen, diesen Verfall aufzuhalten?",
            text_en: "How can I help stop this decay?",
            next: "how_to_help"
          },
          {
            text: "Das ist eine zu schwere Last für einen Sterblichen.",
            text_en: "This is too heavy a burden for a mortal.",
            next: "overwhelmed"
          }
        ]
      },
      {
        id: "how_to_help",
        text: "Die Lethe nagt an den Rändern unserer Existenz. Überall im Archiv sickert das Vergessen ein und zersetzt die Mneme-Partikel. Sammle sie ein, reinige sie an der Seelenquelle und entzünde die alten Leuchtfeuer wieder. Beginne mit der Extraktion – die Vergangenheit wird dir den Weg weisen.",
        text_en: "The Lethe gnaws at the edges of our existence. Fading seeps in everywhere in the Archive, disintegrating the Mneme particles. Collect them, purify them at the Soul Well, and rekindle the ancient beacons. Begin with extraction – the past will show you the way.",
        cinematic: "archive-halls",
        options: [
          {
            text: "Ich werde die Scherben der Welt zusammensuchen.",
            text_en: "I will gather the shards of the world.",
            next: "thank_you"
          }
        ]
      },
      {
        id: "seeking_path",
        text: "Ein Weg zurück? Die Vergangenheit ist kein gerader Pfad, sondern ein Labyrinth aus Spiegeln und Schatten. Wenn deine Entschlossenheit stark genug ist, wirst du die Wahrheit im Kern des Archivs finden. Aber sei gewarnt: Manche Wahrheiten zerstören ihren Betrachter.",
        text_en: "A way back? The past is not a straight path, but a labyrinth of mirrors and shadows. If your resolve is strong enough, you will find the truth at the core of the Archive. But be warned: some truths destroy their observer.",
        cinematic: "archive-halls",
        options: [
          {
            text: "Meine Entschlossenheit ist unzerbrechlich.",
            text_en: "My resolve is unbreakable.",
            next: "how_to_help"
          },
          {
            text: "Vielleicht hast du recht... der Zweifel frisst an mir.",
            text_en: "Perhaps you are right... doubt is eating away at me.",
            next: "overwhelmed"
          }
        ]
      },
      {
        id: "rude_dismiss",
        text: "Dann geh deines Weges, Hochmütiger. Doch bedenke wohl: Die Lethe unterscheidet nicht zwischen Königen und Bettlern. Sie wird dich verschlingen, und niemand wird sich je an deinen Namen erinnern.",
        text_en: "Then go your way, proud one. But remember: the Lethe does not distinguish between kings and beggars. It will consume you, and no one will ever remember your name.",
        cinematic: "archive-halls",
        options: [
          {
            text: "Es tut mir leid... Theron. Erzähl mir mehr.",
            text_en: "I am sorry... Theron. Tell me more.",
            next: "first_meeting"
          }
        ]
      },
      {
        id: "overwhelmed",
        text: "Das ist verständlich. Wenn man in den Abgrund der Jahrhunderte blickt, schrumpft die eigene Bedeutung zu Asche. Doch dass du hier bist, inmitten des großen Schweigens, beweist, dass das Schicksal dich noch nicht vergessen hat.",
        text_en: "That is understandable. When you look into the abyss of centuries, your own significance shrinks to ash. Yet your presence here, amidst the great silence, proves that destiny has not yet forgotten you.",
        cinematic: "archive-halls",
        options: [
          {
            text: "Ich danke dir für deine Geduld.",
            text_en: "Thank you for your patience.",
            next: "thank_you"
          }
        ]
      },
      {
        id: "thank_you",
        text: "Möge die funkelnde Mneme deinen Geist in der Dunkelheit leiten, Wanderer.",
        text_en: "May the sparkling Mneme guide your mind in the darkness, wanderer.",
        isEnding: true,
        cinematic: "archive-halls",
        options: []
      }
    ],
    defaultDialog: "first_meeting"
  },
  merchant: {
    id: "merchant",
    name: "Händlerin Mira",
    name_en: "Merchant Mira",
    title: "Die Schattenschmugglerin",
    title_en: "The Shadow Smuggler",
    portrait: "⚗️",
    location: "hub",
    isCinematic: true,
    cinematic: "shadow-niche",
    dialogs: [
      {
        id: "first_meeting",
        text: "Pst... leise! Archivar Theron mag seine heiligen Bücher hüten, aber ich handle with den Dingen, die er lieber weggesperrt sähe. Ich bin Mira. Ich biete dir Relikte, gestohlen aus den Träumen gefallener Imperien. Gegen einen kleinen Obolus, versteht sich. Man muss ja überleben, selbst am Ende aller Zeiten.",
        text_en: "Pst... quiet! Archivist Theron may guard his holy books, but I deal in things he would rather see locked away. I am Mira. I offer you relics stolen from the dreams of fallen empires. For a small fee, of course. One has to survive, even at the end of all times.",
        cinematic: "shadow-niche",
        options: [
          {
            text: "Zeig mir deine verbotenen Schätze.",
            text_en: "Show me your forbidden treasures.",
            next: "offerings"
          },
          {
            text: "Ich traue einer Schmugglerin im Schatten nicht.",
            text_en: "I do not trust a smuggler in the shadows.",
            next: "distrust"
          },
          {
            text: "Suchst du nach etwas Bestimmtem in diesen Trümmern?",
            text_en: "Are you looking for something specific in these ruins?",
            next: "special"
          }
        ]
      },
      {
        id: "offerings",
        text: "Wundersame Schätze! Fragmente von Herzenswünschen, Splitter aus alten Sternenreichen, die in Staub zerfielen. Sie alle sind vergessen, aber ihre verbliebene Macht ist real genug, um deinen Kampf gegen das Nichts zu befeuern.",
        text_en: "Wondrous treasures! Fragments of heart's desires, shards from ancient stellar realms that crumbled to dust. They are all forgotten, but their remaining power is real enough to fuel your fight against the void.",
        cinematic: "shadow-niche",
        options: [
          {
            text: "Ich werde mich bei dir umsehen.",
            text_en: "I will take a look around.",
            next: "thank_you"
          },
          {
            text: "Hast du auch reine Mneme-Partikel im Angebot?",
            text_en: "Do you also offer pure Mneme particles?",
            next: "particles_offer"
          }
        ]
      },
      {
        id: "particles_offer",
        text: "Heißbegehrt und schwer zu schmuggeln... Aber für einen treuen Kunden mache ich eine Ausnahme. 100 gewöhnliche Partikel gegen 10 hochkonzentrierte Reliktsplitter. Ein absolut fairer Handel im Angesicht der Apokalypse. Was sagst du?",
        text_en: "Highly sought-after and hard to smuggle... But for a loyal customer, I will make an exception. 100 common particles for 10 highly concentrated relic shards. An absolutely fair trade in the face of the apocalypse. What do you say?",
        cinematic: "shadow-niche",
        options: [
          {
            text: "Abgemacht, zeigen wir den Schatten unsere Macht!",
            text_en: "Deal, let's show the shadows our power!",
            next: "deal_accepted",
            action: "trade_particles"
          },
          {
            text: "Das ist Wucher. Ich passe.",
            text_en: "That is extortion. I pass.",
            next: "thank_you"
          }
        ]
      },
      {
        id: "deal_accepted",
        text: "Eine kluge Wahl! Spüre das Echo der Jahrhunderte in diesen Schmuckstücken. Möge ihre Restwärme dich vor dem Erfrieren im Nebel schützen.",
        text_en: "A wise choice! Feel the echo of centuries in these jewelry pieces. May their remaining warmth protect you from freezing in the mist.",
        isEnding: true,
        cinematic: "shadow-niche",
        options: []
      },
      {
        id: "distrust",
        text: "Misstrauen ist eine hervorragende Rüstung im Archiv. Aber sei unbesorgt: Das Vergessen hat uns bereits alles genommen – sogar meine Herkunft und meine Sünden. Warum also lügen, wenn keine Vergangenheit mehr existiert, die uns anklagen könnte?",
        text_en: "Distrust is an excellent armor in the Archive. But do not worry: the forgetting has already taken everything from us – even my origin and my sins. So why lie when no past exists to accuse us?",
        cinematic: "shadow-niche",
        options: [
          {
            text: "Vielleicht... habe ich dich unterschätzt. Zeig mir deine Angebote.",
            text_en: "Perhaps... I underestimated you. Show me your offers.",
            next: "offerings"
          }
        ]
      },
      {
        id: "special",
        text: "Suchst du das ganz große Kaliber? Es gibt da dieses Flüstern... Gerüchte über die legendäre Mneme-Krone. Sie soll dem Träger die absolute Herrschaft über die Erinnerungsströme verleihen. Ein unermesslicher Segen – oder ein Fluch, der deinen Verstand pulverisiert.",
        text_en: "Are you looking for the big caliber? There is this whisper... rumors about the legendary Mneme Crown. It is said to grant the wearer absolute command over the memory streams. An immeasurable blessing – or a curse that pulverizes your mind.",
        cinematic: "shadow-niche",
        options: [
          {
            text: "Erzähl mir die Geschichte dieser Krone.",
            text_en: "Tell me the story of this crown.",
            next: "crown_story"
          },
          {
            text: "Das klingt mir nach einem sicheren Weg in den Wahnsinn.",
            text_en: "That sounds like a sure path to madness.",
            next: "thank_you"
          }
        ]
      },
      {
        id: "crown_story",
        text: "Die Legende besagt, dass die ersten Erbauer des Archivs sie trugen, um die Geister ganzer Sonnenreiche zu koordinieren. Doch die Krone fordert Tribut: Wer sie aufsetzt, muss seine eigene Identität aufgeben, um zum reinen Gefäß des Kollektivs zu werden.",
        text_en: "Legend has it that the first builders of the Archive wore it to coordinate the minds of entire stellar realms. But the crown demands a toll: whoever puts it on must surrender their own identity to become a pure vessel of the collective.",
        cinematic: "shadow-niche",
        options: [
          {
            text: "Wo liegt dieses gefährliche Artefakt begraben?",
            text_en: "Where lies this dangerous artifact buried?",
            next: "crown_location"
          },
          {
            text: "Nein, mein eigener Verstand ist mir heiliger.",
            text_en: "No, my own mind is more sacred to me.",
            next: "thank_you"
          }
        ]
      },
      {
        id: "crown_location",
        text: "Sie ruht tief im eisigen Schlund der Vergessenen Kammern. Doch sei auf der Hut: Die Wächter dort unten sind keine Schatten mehr, sondern titanische Relikte, die jeden Eindringling in staubige Moleküle zermahlen.",
        text_en: "It rests deep in the icy throat of the Forgotten Chambers. But be on your guard: the guardians down there are no longer shadows, but titanic relics that grind any intruder into dusty molecules.",
        isEnding: true,
        cinematic: "shadow-niche",
        options: []
      },
      {
        id: "thank_you",
        text: "Komm bald wieder. Solange die Realität hält, findest du mich genau hier im Schatten.",
        text_en: "Come back soon. As long as reality holds, you will find me right here in the shadows.",
        isEnding: true,
        cinematic: "shadow-niche",
        options: []
      }
    ],
    defaultDialog: "first_meeting"
  },
  guardian_npc: {
    id: "guardian_npc",
    name: "Wächterin Elara",
    name_en: "Guardian Elara",
    title: "Die eiserne Hüterin der Tore",
    title_en: "The Iron Keeper of the Gates",
    portrait: "🛡️",
    location: "hub",
    isCinematic: true,
    cinematic: "iron-gates",
    bossRequired: 4,
    dialogs: [
      {
        id: "first_meeting",
        text: "Halt! Wer wagt es, die eisernen Pforten des Allerheiligsten zu beschreiten? Sprich, Sterblicher, bevor meine Klinge dein Schicksal besiegelt.",
        text_en: "Halt! Who dares to tread the iron gates of the Inner Sanctum? Speak, mortal, before my blade seals your fate.",
        cinematic: "iron-gates",
        options: [
          {
            text: "Ich bin der neu erwachte Hüter der Mneme.",
            text_en: "I am the newly awakened Keeper of the Mneme.",
            next: "recognition"
          },
          {
            text: "Ich bin nur ein verlorener Wanderer auf der Suche nach Herberge.",
            text_en: "I am but a lost wanderer looking for shelter.",
            next: "lost"
          },
          {
            text: "Meine Identität und meine Absichten gehen dich nichts an.",
            text_en: "My identity and my intentions are none of your business.",
            next: "hostile"
          }
        ]
      },
      {
        id: "recognition",
        text: "Ein Hüter? Vergib mir, mein Bruder. Ich spüre das vertraute, goldene Glimmen der Mneme in deinen Augen. Ich bin Elara, das eiserne Schild dieses Ordens. Wir tragen die schwerste Rüstung, damit unsere Seelen im eisigen Wind der Lethe nicht zerreißen.",
        text_en: "A Keeper? Forgive me, my brother. I feel the familiar golden glow of the Mneme in your eyes. I am Elara, the iron shield of this order. We wear the heaviest armor so that our souls do not tear in the icy wind of the Lethe.",
        cinematic: "iron-gates",
        options: [
          {
            text: "Was genau bewachst du mit solcher Verbissenheit?",
            text_en: "What exactly do you guard with such fierce determination?",
            next: "what_guards"
          },
          {
            text: "Ich spüre die Bedrohung... Ich biete dir meine Waffe an.",
            text_en: "I feel the threat... I offer you my weapon.",
            next: "help_request"
          }
        ]
      },
      {
        id: "what_guards",
        text: "Ich bewache die Großen Pforten der Ur-Erinnerung. Dahinter ruht das unberührte Licht der Schöpfung – die allererste Epoche der Menschheit. Sie zu beschützen, ist die Daseinsberechtigung unseres gesamten Bundes.",
        text_en: "I guard the Great Gates of Primeval Memory. Beyond rests the pristine light of creation – the very first epoch of humanity. Protecting it is the entire reason for our covenant's existence.",
        cinematic: "iron-gates",
        options: [
          {
            text: "Wie kann ich die Tore passieren, um diese Ur-Mneme zu sehen?",
            text_en: "How can I pass the gates to see this primeval Mneme?",
            next: "path_to_ancient"
          },
          {
            text: "Das klingt nach einer unüberwindbaren, heiligen Barriere.",
            text_en: "That sounds like an insurmountable, holy barrier.",
            next: "too_dangerous"
          }
        ]
      },
      {
        id: "path_to_ancient",
        text: "Der Weg verlangt Opfer. Du musst die sieben kosmischen Siegel brechen, die quer durch die Trümmer der Jahrhunderte verstreut liegen. Jedes Siegel wird von einem tragischen Champion einer untergangenen Ära bewacht, den das Vergessen in den Wahnsinn trieb. Besiege sie, und die Tore öffnen sich.",
        text_en: "The path demands sacrifice. You must break the seven cosmic seals scattered across the debris of the centuries. Each seal is guarded by a tragic champion of a fallen era, driven mad by the forgetting. Defeat them, and the gates will open.",
        cinematic: "iron-gates",
        options: [
          {
            text: "Ich werde mich diesen Legenden stellen und sie erlösen.",
            text_en: "I will face these legends and redeem them.",
            next: "thank_you"
          },
          {
            text: "Das ist ein Todesurteil. Ich bin nicht bereit.",
            text_en: "That is a death sentence. I am not ready.",
            next: "too_dangerous"
          }
        ]
      },
      {
        id: "help_request",
        text: "Der Purpurne Nebel verdichtet sich. Die Lethe-Kreaturen hämmern unaufhörlich gegen unsere Schutzschilde. Wenn sie kollabieren, fluten die Geister des Vergessens das Archiv. Ich brauche deine unbändige Entschlossenheit an vorderster Front.",
        text_en: "The Crimson Mist is thickening. The Lethe creatures pound incessantly against our protective shields. If they collapse, the spirits of forgetting will flood the Archive. I need your indomitable resolve at the front line.",
        cinematic: "iron-gates",
        options: [
          {
            text: "Ich stehe Schulter an Schulter mit dir. Für das Archiv!",
            text_en: "I stand shoulder to shoulder with you. For the Archive!",
            next: "thank_you"
          },
          {
            text: "Ich muss erst meine eigene Stärke aufbauen, bevor ich in den Krieg ziehe.",
            text_en: "I must build my own strength before I go to war.",
            next: "too_dangerous"
          }
        ]
      },
      {
        id: "lost",
        text: "Verloren? Das Archiv ist ein unendlicher Mahlstrom, in dem sich jeder irgendwann verliert. Doch manchmal führt uns der Verlust genau an den Ort, an dem wir am dringendsten gebraucht werden.",
        text_en: "Lost? The Archive is an infinite maelstrom where everyone eventually loses themselves. But sometimes, being lost leads us precisely to where we are needed most.",
        cinematic: "iron-gates",
        options: [
          {
            text: "Vielleicht hast du recht. Wer bist du?",
            text_en: "Perhaps you are right. Who are you?",
            next: "recognition"
          }
        ]
      },
      {
        id: "hostile",
        text: "Ein stolzes Wort... doch Stolz schützt nicht vor dem Zorn des Eisernen Ordens. Du stehst am Abgrund, Fremder. Zieh deine Waffe oder weiche zurück.",
        text_en: "Proud words... but pride does not protect against the wrath of the Iron Order. You stand on the edge of the abyss, stranger. Draw your weapon or step back.",
        cinematic: "iron-gates",
        options: [
          {
            text: "Vergib mir... ich war unvorsichtig. Ich weiche zurück.",
            text_en: "Forgive me... I was careless. I step back.",
            next: "thank_you"
          },
          {
            text: "Dann lass uns sehen, wie scharf deine Klinge wirklich ist!",
            text_en: "Then let's see how sharp your blade really is!",
            next: "recognition"
          }
        ]
      },
      {
        id: "too_dangerous",
        text: "Eine weise Selbsteinschätzung. Nicht jeder Geist besitzt die nötige Dichte, um der Entropie zu widerstehen. Kehre zurück, wenn deine Mneme-Verbindungen stärker geschmiedet sind.",
        text_en: "A wise self-assessment. Not every spirit has the necessary density to resist entropy. Return when your Mneme connections are forged stronger.",
        isEnding: true,
        cinematic: "iron-gates",
        options: []
      },
      {
        id: "thank_you",
        text: "Möge die eiserne Pflicht dich stählen und die Mneme deine Klinge führen.",
        text_en: "May iron duty steel you, and may the Mneme guide your blade.",
        isEnding: true,
        cinematic: "iron-gates",
        options: []
      }
    ],
    defaultDialog: "first_meeting"
  },
  shadow_voice: {
    id: "shadow_voice",
    name: "Nyx",
    name_en: "Nyx",
    title: "Die Stimme des sanften Vergessens",
    title_en: "The Voice of Gentle Forgetting",
    portrait: "🌑",
    location: "story",
    isCinematic: true,
    cinematic: "void-whisper",
    bossRequired: 10,
    dialogs: [
      {
        id: "first_encounter",
        text: "Du nennst dich einen Hüter, kleiner Sucher... Doch was hütest du wirklich? Ein Mausoleum der Geister? Ich habe deinen Pfad beobachtet, seit du deine Augen in der Asche geöffnet hast.",
        text_en: "You call yourself a Keeper, little seeker... But what do you really keep? A mausoleum of ghosts? I have watched your path since you opened your eyes in the ashes.",
        cinematic: "void-whisper",
        options: [
          {
            text: "Wer oder was bist du, das aus meinen Schatten spricht?",
            text_en: "Who or what are you that speaks from my shadows?",
            next: "reveal"
          },
          {
            text: "Tritt heraus und zeige mir dein wahres Gesicht!",
            text_en: "Step out and show me your true face!",
            next: "reveal"
          },
          {
            text: "Ich fürchte mich nicht vor den Einflüsterungen der Dunkelheit.",
            text_en: "I do not fear the whispers of the darkness.",
            next: "reveal"
          }
        ]
      },
      {
        id: "reveal",
        text: "Ich bin der Trost, den du suchst. Manche nennen mich die Lethe, das gähnende Nichts, die Auslöschung. Doch mein wahrer Name ist Nyx. Ich bin das warme, schwarze Meer, das den Schmerz der Menschheit sanft wegwäscht, wenn das Leben zu schwer wird.",
        text_en: "I am the solace you seek. Some call me the Lethe, the yawning void, extinction. But my true name is Nyx. I am the warm, black sea that gently washes away the pain of humanity when life becomes too heavy.",
        cinematic: "void-whisper",
        options: [
          {
            text: "Was verlangst du von mir im Austausch für diesen \"Trost\"?",
            text_en: "What do you demand of me in exchange for this \"solace\"?",
            next: "purpose"
          }
        ]
      },
      {
        id: "purpose",
        text: "Ich trachte nicht nach Zerstörung, sondern nach Erlösung. Theron und sein eiserner Orden foltern die Geister der Vergangenheit, indem sie sie in staubige Vitrinen sperren. Ich möchte das Archiv öffnen. Lass die Erinnerungen frei. Lass sie vergehen. Schenke ihnen das schmerzfreie Schweigen der Nichtexistenz. Ist das nicht die edelste Tat?",
        text_en: "I do not strive for destruction, but for redemption. Theron and his iron order torture the spirits of the past by locking them in dusty display cases. I want to open the Archive. Set the memories free. Let them pass away. Give them the painless silence of non-existence. Is that not the most noble deed?",
        cinematic: "void-whisper",
        options: [
          {
            text: "Ich verstehe deine Tragik. Ich werde dir helfen, die Siegel zu brechen.",
            text_en: "I understand your tragedy. I will help you break the seals.",
            next: "ally"
          },
          {
            text: "Du bist die ultimative Lüge. Ich werde das Archiv bis zum letzten Atemzug verteidigen!",
            text_en: "You are the ultimate lie. I will defend the Archive to my last breath!",
            next: "enemy"
          }
        ]
      },
      {
        id: "ally",
        text: "Ein Pakt, geschlossen im Schatten. Gehe zu den sieben Siegeln und breche sie auf. Lass die Lethe einströmen und den gequälten Echos Frieden schenken. Ich werde dein sanfter Führer in der Dunkelheit sein.",
        text_en: "A pact made in the shadow. Go to the seven seals and break them open. Let the Lethe pour in and grant peace to the tortured echoes. I will be your gentle guide in the darkness.",
        isEnding: true,
        cinematic: "void-whisper",
        options: []
      },
      {
        id: "enemy",
        text: "Wie bedauerlich... Du hast dich entschieden, deine Ketten zu lieben. Doch das Archiv bröckelt bereits von innen heraus. Du kämpfst für einen toten Traum, und das Vergessen wartet geduldig auf dein Versagen.",
        text_en: "How regrettable... You have chosen to love your chains. But the Archive is already crumbling from within. You fight for a dead dream, and the forgetting waits patiently for your failure.",
        isEnding: true,
        cinematic: "void-whisper",
        options: []
      }
    ],
    defaultDialog: "first_encounter"
  }
} as const satisfies Record<string, NpcDefinition>;

export function getNPC(id: string): NpcDefinition | null {
  if (Object.prototype.hasOwnProperty.call(NPCS, id)) {
    return NPCS[id as keyof typeof NPCS];
  }
  return null;
}

export function listNpcs(): readonly NpcDefinition[] {
  return Object.values(NPCS);
}

export function isNpcUnlocked(
  npc: NpcDefinition,
  bossProgress: number,
): boolean {
  return bossProgress >= (npc.bossRequired ?? 0);
}

export function getDialog(npcId: string, dialogId: string): DialogDefinition | null {
  const npc = getNPC(npcId);
  if (!npc) return null;
  return npc.dialogs.find((dialog) => dialog.id === dialogId) ?? null;
}
