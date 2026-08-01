import type { StoryBranchNode } from "./types";

/** From v1 `js/data/story_branches.js`. */
export const STORY_BRANCHES = {
  prologue: {
    id: "prologue",
    title: "Das Erwachen der Asche",
    text: "Die Dunkelheit hat das Letzte Archiv verschlungen. Du erwachst auf einem endlosen Feld aus weißem Staub. Über dir erstreckt sich kein Himmel, sondern ein bodenloser schwarzer Schlund, in dem riesige, brennende Pergamente wie Kometen verglühen.\n\nEin kaltes, drängendes Flüstern zieht durch die leeren Hallen und rüttelt an deinem Verstand. In deiner Hand liegt ein Fragment aus gefrorenem Licht – du weißt nicht, woher es kommt.",
    options: [
      {
        id: "prologue_listen",
        text: "Lausche dem Flüstern genauer...",
        next: "prologue_voice"
      },
      {
        id: "prologue_stand",
        text: "Raffe dich auf und blicke um dich",
        next: "prologue_landscape"
      }
    ],
    flags: {
      prologue_started: true
    }
  },
  prologue_voice: {
    id: "prologue_voice",
    title: "Die erste Stimme",
    text: "Das Flüstern formt Worte – sanft, fast mütterlich:\n\n„Du erinnerst dich an nichts. Das ist ein Geschenk. Warum kämpfst du dagegen?“\n\nGleichzeitig materialisiert sich in der Ferne eine goldene Glyphe, die warm pulsiert – ein Siegel, das nicht von dieser Asche stammt. Zwei Richtungen. Zwei Versprechen.",
    options: [
      {
        id: "prologue_voice_fight",
        text: "Zieh deine Klinge aus gefrorenem Licht und stelle dich dem Schatten!",
        next: "prologue_malakor_appear",
        flags: {
          aethel_affinity: 5
        }
      },
      {
        id: "prologue_voice_flee",
        text: "Weiche zurück, flüchte in das Labyrinth der schwebenden Buchregale...",
        next: "prologue_labyrinth",
        flags: {
          lethe_affinity: 5
        }
      }
    ],
    flags: {
      first_voice_heard: true
    }
  },
  prologue_landscape: {
    id: "prologue_landscape",
    title: "Das Feld der Asche",
    text: "Soweit das Auge reicht: weiße Asche, die bei jedem Schritt leise knirscht. In der Ferne ragt der Turm der Ewigkeit empor – seine Spitze verschwindet im schwarzen Schlund. Zwischen dir und dem Turm liegt ein Garten aus zerbrochenem Glas und verwelkten Erinnerungen.\n\nEtwas bewegt sich dort. Eine Silhouette aus Obsidian und Sternenlicht.",
    options: [
      {
        id: "prologue_land_approach",
        text: "Gehe dem Turm entgegen und stelle dich dem, was wartet",
        next: "prologue_malakor_appear",
        flags: {
          aethel_affinity: 5
        }
      },
      {
        id: "prologue_land_side",
        text: "Suche einen anderen Weg – in die schwebenden Regale am Rand",
        next: "prologue_labyrinth",
        flags: {
          lethe_affinity: 5
        }
      }
    ],
    flags: {
      prologue_explored: true
    }
  },
  prologue_malakor_appear: {
    id: "prologue_malakor_appear",
    title: "Malakor, der Erste",
    text: "Die Silhouette materialisiert sich vollständig. Eine hochgewachsene, ritterliche Gestalt aus purem Obsidian. In ihrer Brusthöhle rotiert ein goldenes Uhrwerk – blockiert von schwarzen Schlieren der Lethe. Das Schwert in ihrer Hand besteht aus kondensiertem Sternenlicht und flackert.\n\nSeine Stimme klingt wie das Echo von tausend brechenden Schwertern:\n\n„Ein neuer Funke. Willkommen im Asche-Garten. Ich war der Erste, der die Mneme trug. Ich habe eine ganze goldene Ära in mir begraben – und bin daran erstickt. Was willst du, Fremder? Kampf… oder Verständnis?“",
    options: [
      {
        id: "prologue_m_fight",
        text: "Zieh die Klinge. Der Asche-Garten wird zum Duell",
        next: "chapter1_hero"
      },
      {
        id: "prologue_m_parley",
        text: "Senke die Waffe und versuche, die leidende Seele anzusprechen",
        next: "chapter1_hero_parley",
        flags: {
          diplomat_attempt: true
        }
      }
    ],
    flags: {
      prologue_completed: true,
      malakor_met: true
    }
  },
  prologue_labyrinth: {
    id: "prologue_labyrinth",
    title: "Das Labyrinth der Folianten",
    text: "Du stürzt zwischen schwebende Buchregale. Die Asche folgt dir wie ein lebendes Wesen. Verwitterte Folianten flüstern Fragmente – Rezepte, Namen, Schreie, Lieder. Du verstehst nur Bruchstücke.\n\nIrgendwo in der Dunkelheit knistert eine Laterne. Eine Gestalt in einem zerrissenen Mantel winkt dich heran.",
    options: [
      {
        id: "prologue_lab_mira",
        text: "Nähere dich der Laterne und der Gestalt",
        next: "chapter1_coward"
      },
      {
        id: "prologue_lab_deeper",
        text: "Ignoriere sie und tauche tiefer in die verbotenen Schriften",
        next: "chapter1_coward_deeper"
      }
    ],
    flags: {
      prologue_completed: true,
      coward_path: true
    }
  },
  chapter1_hero: {
    id: "chapter1_hero",
    title: "Der Asche-Garten – Duell",
    text: "Du schreitest mutig voran. Glitzernde Asche rieselt wie Schnee auf deine Schultern. Klassische Chöre vermischen sich mit dem Ticken eines riesigen Metronoms. Bei jedem deiner Schritte verändert sich die Schwerkraft der Arena für einen Herzschlag.\n\nMalakor hebt das Sternenlicht-Schwert. Der Kampf um die erste Erinnerung beginnt.",
    options: [
      {
        id: "ch1_hero_attack",
        text: "Gehe zum Frontalangriff über und zerschmettere den Schatten!",
        next: "chapter1_hero_victory"
      }
    ],
    flags: {
      hero_path: true
    },
    bossRequired: 1
  },
  chapter1_hero_parley: {
    id: "chapter1_hero_parley",
    title: "Worte gegen Obsidian",
    text: "Du senkst die Klinge. Malakors Uhrwerk stockt für einen Moment.\n\n„Du… sprichst. Die meisten ziehen nur die Waffe. Hör zu: Tief unter dem Turm liegt die versiegelte Kammer der Ersten. Dort ruht die unberührte Aethel-Mneme. Die Koordinaten… sind in meinem Zerfall geschrieben. Wenn du mich besiegst oder verschonst – sie gehören dir.“\n\nEr hebt das Schwert erneut, aber zögernd.",
    options: [
      {
        id: "ch1_parley_spare",
        text: "Verschone ihn und nimm die Koordinaten an",
        next: "chapter1_hero_spared",
        flags: {
          aethel_affinity: 10
        }
      },
      {
        id: "ch1_parley_fight",
        text: "Trotzdem kämpfen – seine Last muss enden",
        next: "chapter1_hero"
      }
    ],
    flags: {
      hero_path: true,
      diplomat_attempt: true
    }
  },
  chapter1_hero_spared: {
    id: "chapter1_hero_spared",
    title: "Gnade im Asche-Garten",
    text: "Malakor senkt die Klinge. Ein trauriges Seufzen entweicht dem Obsidian. Die schwarzen Schlieren weichen für einen Herzschlag goldener Licht. Dann zerfällt er – nicht in Gewalt, sondern in ruhige Glassplitter, die sanft zu Boden sinken.\n\nIn deinem Geist erscheinen die Koordinaten der versiegelten Kammer. Ein Geheimnis, das die Wächter nicht kennen sollen – oder doch?",
    options: [
      {
        id: "ch1_spared_continue",
        text: "Setze den Weg zum Auge des Archivs fort",
        next: "chapter2_approach"
      }
    ],
    flags: {
      hero_path: true,
      malakor_spared: true,
      secret_known: true,
      boss_defeated_1: true
    }
  },
  chapter1_hero_victory: {
    id: "chapter1_hero_victory",
    title: "Obsidiansplitter",
    text: "Malakors Form birst in tausend funkelnde Glasscherben. Ein Schwall reiner, goldener Mneme-Energie flutet deine Adern. Dein Triumph hallt durch die metaphysischen Gänge.\n\nAm Rand des Asche-Gartens steht eine Gestalt in eiserner Rüstung – Wächterin Elara. Sie beobachtet dich, sagt nichts, und verschwindet in Richtung des Turms. Der Eiserne Orden hat deine Taten registriert.",
    options: [
      {
        id: "ch1_vic_continue",
        text: "Folge dem Weg zum Auge des Archivs",
        next: "chapter2_approach"
      }
    ],
    flags: {
      hero_path: true,
      boss_defeated_1: true,
      elara_watched: true
    }
  },
  chapter1_coward: {
    id: "chapter1_coward",
    title: "Unterschlupf bei Mira",
    text: "Die Gestalt in dem zerrissenen Mantel ist Mira – Schattenschmugglerin, Händlerin mit dem, was der Orden lieber vergessen würde.\n\n„Pst. Du bist neu und du bist ängstlich. Beides ist hier kein Makel. Komm. Ich habe einen Winkel, in dem die Asche nicht so laut knirscht. Und Relikte, die der Archivar nicht sehen soll.“\n\nSie führt dich in eine Nische zwischen zwei umgestürzten Regalen. Eine schwache Laterne brennt.",
    options: [
      {
        id: "ch1_c_return",
        text: "Überwinde deine Angst, kehre um und stelle dich der Dunkelheit",
        next: "chapter1_coward_return",
        flags: {
          aethel_affinity: 5
        }
      },
      {
        id: "ch1_c_stay",
        text: "Bleibe und lerne von Mira und den verbotenen Schriften",
        next: "chapter1_coward_study",
        flags: {
          lethe_affinity: 5
        }
      }
    ],
    flags: {
      coward_path: true,
      mira_met: true
    }
  },
  chapter1_coward_deeper: {
    id: "chapter1_coward_deeper",
    title: "Verbotene Alchemie",
    text: "Du ignorierst die Laterne und tauchst tiefer. Die Folianten werden älter, die Schrift fremder. Formeln beschreiben, wie Mneme und Lethe zwei Seiten derselben Medaille sind. Wer das Alte nicht sterben lässt, erstickt das Neue.\n\nStunden – oder Tage – vergehen. Du verstehst mehr, als dir lieb ist.",
    options: [
      {
        id: "ch1_cd_study",
        text: "Vertiefe dich weiter in die Schattenlehre",
        next: "chapter1_coward_study",
        flags: {
          lethe_affinity: 8
        }
      },
      {
        id: "ch1_cd_emerge",
        text: "Tritt aus dem Schatten und stelle dich dem Schicksal",
        next: "chapter1_coward_return",
        flags: {
          aethel_affinity: 5
        }
      }
    ],
    flags: {
      coward_path: true,
      hidden_path: true,
      knowledge_started: true
    }
  },
  chapter1_coward_return: {
    id: "chapter1_coward_return",
    title: "Die Rückkehr",
    text: "Du kehrst um. Der bittere Geschmack der Furcht weicht einer harten Entschlossenheit. Als du den Asche-Garten erreichst, ist Malakor bereits ein Echo – besiegt oder verschwunden. Elara steht am Rand und mustert dich kühl.\n\n„Du bist zurück. Gut. Der Orden vergisst Feigheit nicht – aber er respektiert, wer umkehrt.“",
    options: [
      {
        id: "ch1_cr_continue",
        text: "Setze den Weg zum Auge des Archivs fort",
        next: "chapter2_approach"
      }
    ],
    flags: {
      coward_path: true,
      redemption_path: true
    }
  },
  chapter1_coward_study: {
    id: "chapter1_coward_study",
    title: "Der lautlose Schattenwandler",
    text: "Die Zeit im Archiv verliert jede Bedeutung. Du entzifferst Formeln der Lethe-Asche. Mira bringt dir gelegentlich Wasser und Schweigen. Irgendwann flüstert eine andere Stimme aus deinem eigenen Schatten – Nyx, noch ohne Namen, aber mit dem Versprechen von Frieden im Nichts.\n\nDu bist bereit, entweder das Wissen zu meistern oder endlich hervorzutreten.",
    options: [
      {
        id: "ch1_cs_master",
        text: "Meistere die Kräfte der Lethe-Asche",
        next: "chapter2_approach_shadow",
        flags: {
          lethe_affinity: 10
        }
      },
      {
        id: "ch1_cs_emerge",
        text: "Tritt aus dem Schatten und konfrontiere das Schicksal",
        next: "chapter2_approach"
      }
    ],
    flags: {
      coward_path: true,
      hidden_path: true,
      knowledge_gained: true
    }
  },
  chapter2_approach: {
    id: "chapter2_approach",
    title: "Der Weg zum Auge",
    text: "Der Turm der Ewigkeit wächst. Brücken aus Licht materialisieren sich nur, wenn du an ein bestimmtes Gefühl denkst – Angst, Hoffnung, Wut. Am Ende der letzten Brücke öffnet sich das Auge des Archivs: eine monumentale Plattform über dem Aethel-Core.\n\nDort warten bereits Gestalten.",
    options: [
      {
        id: "ch2_app_enter",
        text: "Betrete die Plattform",
        next: "chapter2_confrontation"
      }
    ],
    flags: {
      chapter2_reached: true
    }
  },
  chapter2_approach_shadow: {
    id: "chapter2_approach_shadow",
    title: "Schattenpfad zum Auge",
    text: "Du erreichst das Auge des Archivs auf Wegen, die die Wächter nicht bewachen. Purpurne Nebelschwaden folgen dir. Der Aethel-Core pulsiert schwächer, als hättest du ihm bereits etwas genommen.\n\nNyx flüstert: „Sie werden dich bitten, dich zu entscheiden. Hör auf dein eigenes Verlangen nach Stille.“",
    options: [
      {
        id: "ch2_apps_enter",
        text: "Betrete die Plattform aus dem Schatten",
        next: "chapter2_confrontation"
      }
    ],
    flags: {
      chapter2_reached: true,
      lethe_affinity: 10
    }
  },
  chapter2_confrontation: {
    id: "chapter2_confrontation",
    title: "Das Auge des Archivs – Konfrontation",
    text: "Archivar Theron steht vor dem schwach pulsierenden Aethel-Core. Seine Hand zittert, als er eine verblassende Glyphe nachzeichnet.\n\nAm Rand der Plattform manifestiert sich Nyx – eine tragische Silhouette aus flüssigem Schatten, die an eine trauernde Mutter erinnert.\n\nWächterin Elara bewacht die inneren Tore. Mira beobachtet aus dem Hintergrund.\n\nTheron: „Die Lethe verdichtet sich. Wir brauchen jeden Hüter.“\nNyx: „Oder ihr lasst endlich los. Das Archiv ist ein goldenes Mausoleum.“\n\nBeide blicken dich an.",
    options: [
      {
        id: "ch2_c_theron",
        text: "Höre Theron und dem Bund zu",
        next: "chapter2_theron_offer"
      },
      {
        id: "ch2_c_nyx",
        text: "Lausche Nyx und dem Versprechen des Friedens",
        next: "chapter2_nyx_temptation"
      },
      {
        id: "ch2_c_mira",
        text: "Wende dich an Mira – den dritten Weg",
        next: "chapter2_mira_deal",
        condition: {
          op: "or",
          conditions: [
            {
              flag: "mira_met"
            },
            {
              flag: "lone_wolf_path",
              value: false
            }
          ]
        }
      },
      {
        id: "ch2_c_alone",
        text: "Lehne alle ab und gehe deinen eigenen Weg",
        next: "chapter2_lone_choice"
      }
    ],
    flags: {
      confrontation_seen: true
    }
  },
  chapter2_theron_offer: {
    id: "chapter2_theron_offer",
    title: "Das Angebot des Archivars",
    text: "Theron wendet sich dir zu. Die Glyphen hinter ihm flackern.\n\n„Siehst du das? Jedes Mal, wenn eine dieser Lichter erlischt, vergisst ein Kind auf einer fernen Welt das Gesicht seiner Mutter. Wir halten die Trümmer der Existenz mit blutenden Händen zusammen. Schwöre dem Bund die Treue. Trage das Wappen. Hilf uns, die Siegel zu verstärken – oder wir verlieren alles.“\n\nElara nickt knapp. Ihre Rüstung trägt die Runen längst vergessener Helden.",
    options: [
      {
        id: "ch2_th_join",
        text: "Schwöre den Hütern die Treue und schütze die Schriften",
        next: "chapter3_guardian",
        flags: {
          aethel_affinity: 12
        }
      },
      {
        id: "ch2_th_refuse",
        text: "Lehne die Fesseln ihrer Dogmen ab",
        next: "chapter2_lone_choice"
      },
      {
        id: "ch2_th_secret",
        text: "Teile das Geheimnis der versiegelten Kammer mit den Wächtern",
        next: "chapter2_share_secret",
        requireFlags: [
          "secret_known"
        ]
      }
    ],
    flags: {
      theron_heard: true
    }
  },
  chapter2_nyx_temptation: {
    id: "chapter2_nyx_temptation",
    title: "Das Flüstern der Lethe",
    text: "Nyx tritt näher. Ihre Stimme ist ein sanftes Rauschen.\n\n„Theron hat seinen eigenen Namen vor Jahrhunderten vergessen, nur um das Rezept einer Medizin zu bewahren, die niemand mehr herstellen kann. Ist das Leben? Das Archiv ist eine ewige Folterkammer der Nostalgie. Lass uns die Siegel brechen. Wenn alles vergessen ist, gibt es keinen Schmerz mehr. Nur die unendliche, sanfte Stille. Ist das nicht der wahre Frieden?“",
    options: [
      {
        id: "ch2_ny_accept",
        text: "Nimm den Pakt an und hilf, die Siegel zu öffnen",
        next: "chapter3_scholar",
        flags: {
          lethe_affinity: 15
        }
      },
      {
        id: "ch2_ny_reject",
        text: "Weise sie zurück – du wirst das Archiv verteidigen",
        next: "chapter2_theron_offer",
        flags: {
          aethel_affinity: 8
        }
      },
      {
        id: "ch2_ny_alone",
        text: "Weder Pakt noch Bund – dein eigener Weg",
        next: "chapter2_lone_choice"
      }
    ],
    flags: {
      nyx_heard: true
    }
  },
  chapter2_mira_deal: {
    id: "chapter2_mira_deal",
    title: "Der dritte Weg",
    text: "Mira grinst schief und zieht dich beiseite.\n\n„Die beiden predigen Ewigkeit oder Nichts. Ich predige Wandel. Mneme darf nicht in Vitrinen verrotten – sie muss verbrannt, transformiert, als Treibstoff für etwas Neues genutzt werden. Altes muss sterben, damit Neues wachsen kann. Komm mit mir. Es gibt einen Untergrund-Markt und Leute, die experimentieren. Riskant. Aber lebendig.“",
    options: [
      {
        id: "ch2_mi_join",
        text: "Folge Mira und den freien Wanderern",
        next: "chapter3_lone_wolf",
        flags: {
          lethe_affinity: 5,
          aethel_affinity: 5
        }
      },
      {
        id: "ch2_mi_back",
        text: "Kehre zur Konfrontation zurück",
        next: "chapter2_confrontation"
      }
    ],
    flags: {
      mira_deal: true
    }
  },
  chapter2_share_secret: {
    id: "chapter2_share_secret",
    title: "Das geteilte Geheimnis",
    text: "Du erzählst Theron und Elara von den Koordinaten der versiegelten Kammer. Therons Augen weiten sich. Elara greift unwillkürlich zum Schwertknauf.\n\n„Die Kammer der Ersten… Wir dachten, sie sei Mythos. Wenn du uns dorthin führst, könntest du der wichtigste Hüter seit Generationen werden – oder der gefährlichste.“\n\nSie bieten dir den direkten Weg an: als Guardian mit Zugang zum Allerheiligsten.",
    options: [
      {
        id: "ch2_ss_guardian",
        text: "Führe sie und tritt dem Bund bei",
        next: "chapter3_guardian",
        flags: {
          aethel_affinity: 10
        }
      },
      {
        id: "ch2_ss_alone",
        text: "Behalte die Kontrolle – gehe allein zur Kammer",
        next: "chapter3_secrets"
      }
    ],
    flags: {
      secret_shared: true
    }
  },
  chapter2_lone_choice: {
    id: "chapter2_lone_choice",
    title: "Der ungebundene Weg",
    text: "Du wendest dich von Theron, Nyx und Mira ab. Keine Schwüre. Keine Pakte. Die Flamme der freien Mneme brennt in dir – und sie gehört niemandem außer dir.\n\nDie Wächter betrachten dich fortan mit Misstrauen. Nyx lächelt nur. Mira zuckt mit den Schultern: „Dann viel Glück, Alleingänger.“",
    options: [
      {
        id: "ch2_lc_continue",
        text: "Setze deinen eigenen Weg fort",
        next: "chapter3_lone_wolf"
      }
    ],
    flags: {
      lone_wolf_path: true
    }
  },
  chapter3_guardian: {
    id: "chapter3_guardian",
    title: "Der Mneme-Kreuzritter",
    text: "Du legst das goldene Wappen des Bundes an. Die Aufnahmezeremonie ist still – nur das Ticken des Aethel-Cores und das Knirschen von Asche.\n\nTheron führt dich durch die Hallen der Vitrinen. Darin schweben Geister: Krieger, Mütter, Kinder, Könige – festgehalten in ewiger Stasis. Manche stöhnen lautlos.\n\n„Um die Welt vor dem Einsturz zu bewahren, sperren wir jede lebendige Erinnerung ein“, sagt Theron. „Wir sind Gefängniswärter des Geistes. Das ist die Wahrheit, die wir tragen.“\n\nDie Last aller menschlichen Erinnerungen drückt auf deine Schultern. Der wahre Feind – die Lethe – sammelt sich hinter den äußeren Siegeln.",
    options: [
      {
        id: "ch3_g_fight",
        text: "Stelle dich der heraufziehenden Flut und vernichte das Vergessen",
        next: "chapter3_guardian_war"
      },
      {
        id: "ch3_g_seal",
        text: "Versiegle das gesamte Archiv für immer und konserviere den Status quo",
        next: "chapter4_seal"
      },
      {
        id: "ch3_g_doubt",
        text: "Zweifle – vielleicht ist der Bund selbst Teil des Problems",
        next: "chapter3_guardian_doubt"
      }
    ],
    flags: {
      guardian_path: true,
      boss_defeated_2: true
    },
    bossRequired: 4
  },
  chapter3_guardian_war: {
    id: "chapter3_guardian_war",
    title: "Krieg an den Siegeln",
    text: "Elara führt dich an die äußeren Siegel. Purpurn-schwarzer Nebel hämmert gegen die Schutzschilde. Lethe-Kreaturen – verzerrte Echos verlorener Epochen – greifen in Wellen an.\n\n„Wenn die Schilde kollabieren, flutet das Vergessen das Archiv“, sagt Elara. „Wir brauchen jeden Funken Mneme, den du gesammelt hast. Und wir brauchen deinen Willen.“\n\nDer nächste große Kampf steht bevor – und danach die Frage, ob Sieg genug ist.",
    options: [
      {
        id: "ch3_gw_epic",
        text: "Bereite dich auf die finale Konfrontation vor",
        next: "chapter4_epic"
      }
    ],
    flags: {
      guardian_path: true,
      war_declared: true
    }
  },
  chapter3_guardian_doubt: {
    id: "chapter3_guardian_doubt",
    title: "Risse im Orden",
    text: "Du sprichst den Zweifel aus. Theron wird still. Elara legt die Hand auf den Schwertknauf – nicht bedrohlich, sondern müde.\n\n„Zweifel ist erlaubt“, sagt Theron. „Verrat nicht. Wenn du glaubst, es gibt einen besseren Weg als Stasis oder Krieg – dann finde ihn. Aber beeile dich. Die Lethe wartet nicht auf Philosophie.“\n\nDu stehst zwischen Loyalität und der Ahnung, dass beide Extreme – ewige Bewahrung und absolutes Vergessen – unvollständig sind.",
    options: [
      {
        id: "ch3_gd_rebel",
        text: "Suche den Weg der freien Wanderer und des Wandels",
        next: "chapter3_lone_wolf"
      },
      {
        id: "ch3_gd_secrets",
        text: "Suche die Kammer der Ersten auf eigene Faust",
        next: "chapter3_secrets",
        condition: {
          op: "or",
          anyFlags: [
            "secret_known",
            "knowledge_gained",
            "secrets_path"
          ]
        }
      },
      {
        id: "ch3_gd_return",
        text: "Kehre dennoch zum Krieg gegen die Lethe zurück",
        next: "chapter3_guardian_war"
      }
    ],
    flags: {
      guardian_path: true,
      doubt_spoken: true
    }
  },
  chapter3_lone_wolf: {
    id: "chapter3_lone_wolf",
    title: "Der einsame Wegbereiter",
    text: "Mira führt dich in den Untergrund – einen Markt zwischen den Fundamenten des Turms. Freie Mnemoniker handeln mit instabiler Mneme, experimentieren, riskieren Anomalien.\n\n„Der Orden nennt uns Ketzer. Nyx nennt uns naiv. Wir nennen uns lebendig“, sagt Mira. „Altes muss sterben, damit Neues wachsen kann. Die Frage ist nur: Wer entscheidet, was stirbt?“\n\nDie Wächter betrachten dich als Bedrohung. Deine Reise führt an die Grenzen der bekannten Existenz – und an die Frage, ob Freiheit ohne Verantwortung Chaos ist.",
    options: [
      {
        id: "ch3_lw_fight",
        text: "Konfrontiere den Orden und erkämpfe die Freiheit des Geistes",
        next: "chapter4_rebel"
      },
      {
        id: "ch3_lw_leave",
        text: "Verlasse das Archiv und wandere in die ungeschriebene Leere",
        next: "ending_exile"
      },
      {
        id: "ch3_lw_balance",
        text: "Suche einen Mittelweg – weder Tyrannei noch Chaos",
        next: "chapter3_secrets",
        condition: {
          op: "or",
          anyFlags: [
            "secret_known",
            "knowledge_gained"
          ]
        }
      }
    ],
    flags: {
      lone_wolf_path: true
    }
  },
  chapter3_secrets: {
    id: "chapter3_secrets",
    title: "Das Allerheiligste der Ersten",
    text: "Die verborgene Pforte schwingt auf – sei es durch Malakors Koordinaten, durch eigene Suche oder durch einen gestohlenen Schlüssel.\n\nVor dir erstreckt sich eine endlose, strahlende Kammer, erfüllt von flüssigem Gold: die Aethel-Mneme, die allererste, reine Erinnerung an die Schöpfung. Ein unbeschreiblicher Friede geht von ihr aus. Gleichzeitig spürst du, dass diese Macht jeden, der sie berührt, für immer verändert.\n\nDu stehst am Rand des Beckens.",
    options: [
      {
        id: "ch3_s_power",
        text: "Nimm diese göttliche Macht in dich auf und werde zum Architekten der Realität",
        next: "chapter4_god",
        flags: {
          aethel_affinity: 15
        }
      },
      {
        id: "ch3_s_destroy",
        text: "Zerstöre das goldene Becken, um den Kreislauf der Stasis zu brechen",
        next: "ending_void",
        flags: {
          lethe_affinity: 20
        }
      },
      {
        id: "ch3_s_leave",
        text: "Lasse die Macht unberührt und kehre mit dem Wissen zurück",
        next: "chapter3_scholar"
      }
    ],
    flags: {
      secrets_path: true
    }
  },
  chapter3_scholar: {
    id: "chapter3_scholar",
    title: "Der dunkle Gelehrte",
    text: "Durch Studien, Nyx’ Flüstern oder die Kammer der Ersten hast du die paradoxe Natur der Realität verstanden: Mneme und Lethe sind zwei Seiten derselben Medaille. Es kann keine neue Schöpfung geben, ohne dass das Alte vergeht. Doch der Orden weigert sich, diese Wahrheit zu akzeptieren – und Nyx will nur das eine Extrem.\n\nDu trägst Wissen, das beide Seiten fürchten.",
    options: [
      {
        id: "ch3_sc_teach",
        text: "Kehre zum Orden zurück und versuche, die Wächter zu bekehren",
        next: "chapter4_guardian_teach",
        flags: {
          aethel_affinity: 8
        }
      },
      {
        id: "ch3_sc_use",
        text: "Nutze die Alchemie, um die Realität nach deinen Vorstellungen neu zu schmieden",
        next: "chapter4_god"
      },
      {
        id: "ch3_sc_nyx",
        text: "Erfülle Nyx’ Pakt und öffne die Siegel dem Vergessen",
        next: "chapter4_void_path",
        flags: {
          lethe_affinity: 15
        }
      }
    ],
    flags: {
      scholar_path: true,
      knowledge_gained: true
    }
  },
  chapter4_epic: {
    id: "chapter4_epic",
    title: "Die finale Götterdämmerung",
    text: "Der Abgrund öffnet sich. Vor dir ragt die Verkörperung des Vergessens empor – ein riesiger, formloser Titan aus reinem Lethe-Mahlstrom. In seinem Inneren schreien alle verlorenen Epochen nach Erlösung.\n\nDie Arena ist surreal: Trümmer aller Zeiten – griechische Säulen, cybernetische Server-Racks, antike Schiffe – wirbeln im Kreis. Der Vergessene Gott ist kein bloßes Monster. Es ist das allererste Bewusstsein der Menschheit, das verzweifelt versucht, sich vor dem Vergessen zu schützen.\n\n„Vergiss mich nicht“, flüstert es. „Oder lass mich endlich ruhen.“",
    options: [
      {
        id: "ch4_e_win",
        text: "Besiege das Vergessen und rette das Archiv",
        next: "ending_victory"
      },
      {
        id: "ch4_e_sacrifice",
        text: "Opfere deinen eigenen Verstand, um den Abgrund in dir zu versiegeln",
        next: "ending_sacrifice"
      }
    ],
    flags: {
      epic_path: true
    },
    bossRequired: 10
  },
  chapter4_seal: {
    id: "chapter4_seal",
    title: "Die Ewige Konservierung",
    text: "Du hast dich entschieden, das Archiv abzuriegeln. Unter lautem Getöse schließen sich die gigantischen Steintore des Turms der Ewigkeit. Die Lethe bleibt draußen, die Erinnerungen drinnen.\n\nEs ist eine Welt ohne Morgen – eine unendliche, museale Schleife. Theron nickt. Elara senkt den Blick. Draußen, jenseits der Mauern, wird die Realität weiter zerfallen. Drinnen bleibt alles, was je war – für immer unberührt und tot.",
    options: [
      {
        id: "ch4_s_eternal",
        text: "Nimm Platz auf dem Thron der Stasis und wache bis ans Ende aller Zeiten",
        next: "ending_eternal"
      }
    ],
    flags: {
      seal_path: true
    }
  },
  chapter4_rebel: {
    id: "chapter4_rebel",
    title: "Die Stunde des Rebellen",
    text: "Deine Klinge kreuzt sich mit den Schwertern des Eisernen Ordens. Du führst den Aufstand der freien Geister an. Der Turm wankt. Das Fundament der alten Welt bebt.\n\nTheron steht vor dir – nicht als Tyrann, sondern als müder Mann, der Jahrhunderte lang versucht hat, die Welt zusammenzuhalten. Elara zögert. Mira und die Wanderer hinter dir warten auf dein Wort.",
    options: [
      {
        id: "ch4_r_victory",
        text: "Stürze den Orden und befreie alle Erinnerungen in die Wildnis",
        next: "ending_rebel"
      },
      {
        id: "ch4_r_tyrant",
        text: "Reiße die Krone an dich und regiere selbst mit eiserner Hand",
        next: "ending_tyrant"
      },
      {
        id: "ch4_r_mercy",
        text: "Verschone den Orden und erzwinge einen neuen Bund des Wandels",
        next: "ending_free"
      }
    ],
    flags: {
      rebel_path: true
    }
  },
  chapter4_god: {
    id: "chapter4_god",
    title: "Die Erhebung zur Gottheit",
    text: "Die ursprüngliche, goldene Energie der Schöpfung fließt durch deine Adern. Du spürst jeden Gedanken, jeden Herzschlag und jeden Schmerz aller Epochen, die jemals existierten.\n\nDu bist der absolute Herrscher über Zeit, Erinnerung und Vergessen. Die Frage ist nicht mehr, ob du die Macht hast – sondern, was du damit tust.",
    options: [
      {
        id: "ch4_g_rule",
        text: "Etabliere eine unfehlbare, göttliche Herrschaft",
        next: "ending_ruler"
      },
      {
        id: "ch4_g_free",
        text: "Sprenge deine Form und zerstreue die Mneme als neuen Sternenstaub",
        next: "ending_free"
      }
    ],
    flags: {
      god_path: true
    }
  },
  chapter4_guardian_teach: {
    id: "chapter4_guardian_teach",
    title: "Die Bekehrung",
    text: "Du kehrst zum Orden zurück und legst dein Wissen offen: Mneme und Lethe brauchen einander. Stasis allein tötet. Vergessen allein löscht. Nur ein Gleichgewicht – kontrolliertes Sterben und bewusstes Bewahren – kann die Realität retten.\n\nTheron hört zu. Manche Wächter rebellieren. Andere weinen vor Erleichterung. Die Lethe wartet nicht – aber vielleicht ändert sich, wie ihr gegen sie kämpft.",
    options: [
      {
        id: "ch4_gt_epic",
        text: "Führe den Orden in einen neuen Krieg – mit neuem Verständnis",
        next: "chapter4_epic"
      },
      {
        id: "ch4_gt_seal",
        text: "Trotzdem versiegeln – das Risiko ist zu groß",
        next: "chapter4_seal"
      }
    ],
    flags: {
      scholar_path: true,
      order_taught: true
    }
  },
  chapter4_void_path: {
    id: "chapter4_void_path",
    title: "Die geöffneten Siegel",
    text: "Du brichst die Siegel. Die Lethe strömt ein – nicht als Monster, sondern als warmer, schwarzer Nebel. Geister in den Vitrinen seufzen und lösen sich auf. Theron schreit. Elara kämpft, bis ihre Rüstung zu Asche wird.\n\nNyx steht neben dir. „Danke. Jetzt können sie endlich ruhen.“\n\nDas Archiv zerfällt. Die Frage ist nur, ob du mit in das Nichts gehst – oder ob etwas von dir bleibt.",
    options: [
      {
        id: "ch4_v_void",
        text: "Sinke mit allem in das warme Nichts",
        next: "ending_void"
      },
      {
        id: "ch4_v_last",
        text: "Halte einen letzten Funken Mneme fest und werde zum Samen einer neuen Welt",
        next: "ending_free"
      }
    ],
    flags: {
      void_path: true
    }
  },
  ending_victory: {
    id: "ending_victory",
    title: "🏆 Goldener Sieg der unvergänglichen Mneme",
    text: "Der Titan der Lethe zerbricht in Myriaden goldener Lichtfunken. Das Archiv leuchtet in nie gekannter Pracht. Die Erinnerungen der Menschheit fließen harmonisch zusammen und formen eine neue, unzerstörbare Realität.\n\nDu wirst als der Ewige Heiler in die Geschichte eingehen – so lange, bis auch diese Geschichte eines Tages erzählt und bewahrt werden muss.",
    isEnding: true,
    options: []
  },
  ending_sacrifice: {
    id: "ending_sacrifice",
    title: "🕯️ Das Selbstopfer: Ein unbesungenes Denkmal",
    text: "Du saugst das wütende Vergessen in deine eigene Seele. Langsam verblassen deine Erinnerungen – das Gesicht deiner Mutter, deine Siege, dein eigener Name. Alles schmilzt dahin.\n\nAls leblose, leuchtende Steinstatue verbleibst du im Zentrum der Hallen. Das Archiv lebt. Du bist fort. Niemand wird deinen Namen kennen – und genau das war der Preis.",
    isEnding: true,
    options: []
  },
  ending_eternal: {
    id: "ending_eternal",
    title: "⏳ Der ewige Wächter der Stasis",
    text: "Allein sitzt du auf dem eisigen Thron aus Buchrücken. Die Zeit verliert jede Bedeutung. Du bewegst dich nicht mehr, fühlst nichts mehr.\n\nDu bist kein Mensch mehr – du bist die lebendige Erinnerung einer toten Welt. Draußen zerfällt alles. Drinnen bleibt alles. Für immer.",
    isEnding: true,
    options: []
  },
  ending_rebel: {
    id: "ending_rebel",
    title: "⚔️ Der Befreier der ungebundenen Geister",
    text: "Der eiserne Orden ist gestürzt. Die Tore des Archivs werden gesprengt. Wie eine gigantische Aurora ergießen sich die gefangenen Träume und Erinnerungen über den Kosmos.\n\nDie starre Struktur der Realität zerfällt – doch die Menschen erwachen und dürfen endlich wieder neu träumen. Chaos und Hoffnung tanzen gemeinsam.",
    isEnding: true,
    options: []
  },
  ending_tyrant: {
    id: "ending_tyrant",
    title: "👑 Der eiserne Tyrann der Bibliotheken",
    text: "Du hast den Thron des Archivars mit Gewalt bestiegen. Um die Stabilität der Welt zu sichern, errichtest du eine Tyrannei des Geistes. Unliebsame Erinnerungen werden gelöscht.\n\nDas Archiv hält stand – um den Preis der absoluten geistigen Freiheit. Du bist der neue Theron. Nur härter.",
    isEnding: true,
    options: []
  },
  ending_ruler: {
    id: "ending_ruler",
    title: "👑 Der Mneme-Gott: Ein Kosmos aus Gedanken",
    text: "Als neuer Gott throns du über der Existenz. Mit einer Geste formst du Kontinente aus Träumen und löschst Galaxien aus Verbitterung.\n\nDie Welt gehorcht jedem deiner Gedanken. Du bist unsterblich, unbesiegbar – und einsamer als jeder Sterbliche vor dir.",
    isEnding: true,
    options: []
  },
  ending_free: {
    id: "ending_free",
    title: "🕊️ Die Große Befreiung: Kosmische Saat",
    text: "Du gibst Macht, Form oder den letzten Funken auf und lässt deine Essenz explodieren. Billionen funkelnder Partikel regnen auf die öde Leere.\n\nSie säen Leben, Hoffnung und Geschichten auf fernen Planeten. Das Archiv ist nicht mehr – aber ein unendlicher, neuer Kosmos beginnt zu atmen.",
    isEnding: true,
    options: []
  },
  ending_exile: {
    id: "ending_exile",
    title: "🌅 Das Exil des namenlosen Wanderers",
    text: "Du wirfst deine Ausrüstung ab und schreitest durch die letzte Pforte hinaus in den Nebel der ungeschriebenen Zukunft.\n\nOhne Vergangenheit, ohne Bestimmung, frei von der Last der Erhaltung. Die Geschichte deines Lebens beginnt auf einem leeren Blatt Papier.",
    isEnding: true,
    options: []
  },
  ending_void: {
    id: "ending_void",
    title: "🌀 Die absolute Stille des warmen Nichts",
    text: "Das goldene Becken zerbricht – oder die Siegel öffnen sich vollständig. Die Lethe flutet jede Ecke. Die Mauern stürzen lautlos ein. Die Regale zerfallen zu Sand.\n\nDie Realität vergisst sich selbst. Du schließt die Augen und sinkst glücklich in das ewige, warme, schmerzfreie Nichts zurück.",
    isEnding: true,
    options: []
  }
} as const satisfies Record<string, StoryBranchNode>;

export function getStoryNode(id: string): StoryBranchNode | null {
  if (Object.prototype.hasOwnProperty.call(STORY_BRANCHES, id)) {
    return STORY_BRANCHES[id as keyof typeof STORY_BRANCHES];
  }
  return null;
}

export function isEndingNode(id: string): boolean {
  const node = getStoryNode(id);
  return node ? node.isEnding === true : false;
}
