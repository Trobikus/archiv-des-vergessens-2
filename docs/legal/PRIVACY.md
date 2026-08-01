# Datenschutzerklärung / Privacy Policy

**Archiv des Vergessens** · Grimoire Interactive  
**Stand / Effective date:** 1. August 2026  
**Kontakt / Contact:** grimoire.interactive@gmail.com

Diese Erklärung gilt für das Spiel *Archiv des Vergessens*, den Desktop-Client, den Siegel-Portal-Launcher sowie den zugehörigen Online-Dienst (Accounts, Cloud-Sync, Chat, Bestenliste), soweit von Grimoire Interactive betrieben.

This policy applies to the game *Archiv des Vergessens*, the desktop client, the Siegel-Portal launcher, and the related online service (accounts, cloud sync, chat, leaderboard), as operated by Grimoire Interactive.

---

## Deutsch

### 1. Verantwortlicher

Verantwortlich für die Verarbeitung personenbezogener Daten im Sinne der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG) ist:

**Grimoire Interactive**  
E-Mail: **grimoire.interactive@gmail.com**

### 2. Zwecke und Rechtsgrundlagen

| Zweck | Daten (Beispiele) | Rechtsgrundlage |
|---|---|---|
| Registrierung & Anmeldung | Benutzername, E-Mail-Adresse, Passwort-Hash & Salt, Sitzungstoken, Zeitstempel | Art. 6 Abs. 1 lit. b DSGVO (Vertrag / vorvertraglich) |
| Cloud-Spielstand | Spielstand-Daten, Benutzer-ID, Benutzername, Versions-/Zeitangaben | Art. 6 Abs. 1 lit. b DSGVO |
| Globaler Chat & Bestenliste | Anzeigename (Benutzername), Nachrichteninhalt, Spielstatistiken | Art. 6 Abs. 1 lit. b DSGVO |
| Missbrauchs- & Ratenbegrenzung | temporäre Verbindungs-/IP-bezogene Merkmale während der Anfrage | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Stabilität und Missbrauchsschutz) |
| Desktop-Updates / Launcher-Download | technische Abrufe von GitHub-Release-Metadaten und Installationspaketen | Art. 6 Abs. 1 lit. b bzw. f DSGVO (Bereitstellung & Sicherheit von Updates) |
| Darstellung von Schriftarten | technische Abrufe bei Google Fonts (siehe Ziff. 7) | Art. 6 Abs. 1 lit. f DSGVO (einheitliche Darstellung); soweit erforderlich Einwilligung nach TTDSG |

Es findet **kein** Verkauf personenbezogener Daten statt. Es werden **keine** externen Analyse-, Werbe- oder Crash-Reporting-Dienste (z. B. Google Analytics, Sentry) durch den Spielecode eingebunden.

### 3. Welche Daten wir verarbeiten

**Beim Online-Account (Server)**  
- Benutzername, E-Mail-Adresse  
- Passwort ausschließlich als **PBKDF2-Hash** (mit Salt); Klartextpasswörter werden nicht gespeichert  
- Sitzungstoken, Erstellungs- und letzter Login-Zeitpunkt, optionales Avatar-Feld  
- Cloud-Spielstand (Fortschrittsdaten gemäß Save-Envelope)  
- Chatnachrichten (Spielername, Text, Zeitstempel; technisch begrenzte Historie)  
- Bestenlisten-Einträge (Benutzername, Spielkennzahlen, Zeitstempel)

**Lokal auf Ihrem Gerät (Client)**  
- optional gespeicherter Benutzername („merken“)  
- Gast-Kennung  
- lokale Spielstände (IndexedDB) und ggf. ausstehende Cloud-Warteschlange  
- portable Installation über den Launcher unter dem Anwenderdatenverzeichnis (Windows: AppData)

**Passwörter** werden bei jedem Start erneut eingegeben; eine dauerhafte Speicherung des Sitzungstokens im Client über Neustarts hinweg ist nicht vorgesehen.

### 4. Speicherdauer (gesetzliche Mindestanforderungen)

Personenbezogene Daten speichern wir nur so lange, wie es für die jeweiligen Zwecke erforderlich ist, und beachten dabei die in Deutschland geltenden gesetzlichen Vorgaben:

- **Account- und Spieldaten** (Profil, Cloud-Save, Bestenliste): bis zur Löschung des Accounts auf Anfrage oder bis die Verarbeitung für den Dienst nicht mehr erforderlich ist.  
- **Chatdaten:** nur kurzfristig im technisch vorgesehenen Umfang (begrenzte Historie / Bereinigung auf dem Server).  
- **Sicherheits- und Verbindungsmerkmale** (z. B. zur Ratenbegrenzung): nur vorübergehend für den Schutz des Dienstes.  
- **Gesetzliche Aufbewahrungspflichten:** Soweit handels- oder steuerrechtliche Pflichten greifen (insbesondere §§ 147 AO, 257 HGB), gelten die gesetzlichen **Mindestaufbewahrungsfristen** (in der Regel **6** bzw. **10 Jahre**) für die davon erfassten Unterlagen. Spieldaten ohne solche Pflicht werden nicht allein „auf Vorrat“ über die Erforderlichkeit hinaus aufbewahrt.

Nach erfolgreicher Account-Löschung werden die zugehörigen personenbezogenen Daten gelöscht oder anonymisiert, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.

### 5. Empfänger und Drittlandtransfer (USA)

Der Live-Server wird bei **Google in den USA** betrieben. Damit können personenbezogene Daten in die Vereinigten Staaten übermittelt werden.

Eine solche Übermittlung erfolgt nur, soweit dies für den Betrieb des Online-Dienstes erforderlich ist, und unter Einhaltung der Vorgaben der Art. 44 ff. DSGVO (insbesondere geeignete Garantien wie die von Google bereitgestellten Standardvertragsklauseln / entsprechende Auftragsverarbeitungsbedingungen, soweit anwendbar).

Zusätzlich können beim Abruf von Updates bzw. durch den Launcher Metadaten und Dateien von **GitHub** (Microsoft) geladen werden. Beim Laden von Schriftarten können Anfragen an **Google Fonts** gehen (siehe Ziff. 7).

### 6. Minderjährige

Der Dienst richtet sich an Nutzer **ab 12 Jahren**.

Nach Art. 8 DSGVO i. V. m. deutschem Recht ist die Einwilligungsfähigkeit für Dienste der Informationsgesellschaft in Deutschland regelmäßig erst ab **16 Jahren** gegeben. **Unter 16 Jahren** dürfen personenbezogene Daten im Rahmen eines Accounts nur verarbeitet werden, wenn die **Erziehungsberechtigten** zustimmen bzw. die Verarbeitung rechtmäßig veranlassen. Eltern bzw. Sorgeberechtigte sind für die Nutzung durch Kinder unter 16 Jahren verantwortlich.

### 7. Google Fonts

Client und Launcher laden die Schriftarten **Cinzel** und **Inter** über die Google-Fonts-Infrastruktur (`fonts.googleapis.com` / `fonts.gstatic.com`). Dabei kann Ihre IP-Adresse an Google (USA) übermittelt werden. Rechtsgrundlage: berechtigtes Interesse an einheitlicher Typografie (Art. 6 Abs. 1 lit. f DSGVO); soweit das Telekommunikation-Telemedien-Datenschutz-Gesetz (TTDSG) eine Einwilligung für den Zugriff auf Endgeräte / das Setzen nicht erforderlicher Informationen verlangt, holen wir diese ein bzw. stellen auf lokale Schriftarten um, sobald dies technisch ausgeliefert wird.

### 8. Desktop-Updater und Launcher

Der Desktop-Client kann Update-Informationen von  
`https://github.com/Trobikus/archiv-des-vergessens-2/releases/...` abrufen.  
Der Siegel-Portal-Launcher prüft Releases über die GitHub-API und lädt signierte Portable-Pakete herunter. Dabei entstehen die üblichen technischen Server-Logdaten beim jeweiligen Anbieter.

### 9. Ihre Rechte

Sie haben gegenüber dem Verantwortlichen die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 15–21 DSGVO), soweit die gesetzlichen Voraussetzungen vorliegen.

**Account-Löschung / Löschbegehren:** per E-Mail an **grimoire.interactive@gmail.com** (Betreff z. B. „Account löschen“), unter Angabe des Benutzernamens und möglichst der registrierten E-Mail-Adresse.

Beschwerderecht bei einer Datenschutzaufsichtsbehörde, insbesondere am Wohnsitz in Deutschland.

### 10. Sicherheit

Passwörter werden mit PBKDF2 gespeichert. Die Übertragung zum Server sollte in Produktion über verschlüsselte Verbindungen (`wss://` / TLS) erfolgen. Dennoch ist keine absolute Sicherheit im Internet garantierbar.

### 11. Änderungen

Wir können diese Erklärung anpassen, wenn sich Dienst oder Rechtslage ändern. Maßgeblich ist die auf dem Repository bzw. mit dem Release veröffentlichte Fassung.

---

## English

### 1. Controller

The controller responsible for processing personal data under the GDPR is:

**Grimoire Interactive**  
Email: **grimoire.interactive@gmail.com**

Governing data-protection framework: GDPR and applicable German law (BDSG). Primary place of establishment / legal reference: **Germany**.

### 2. Purposes and legal bases

| Purpose | Data (examples) | Legal basis |
|---|---|---|
| Registration & login | Username, email, password hash & salt, session token, timestamps | Art. 6(1)(b) GDPR |
| Cloud save | Save payload, user id, username, version/timestamps | Art. 6(1)(b) GDPR |
| Global chat & leaderboard | Display name (username), message content, game stats | Art. 6(1)(b) GDPR |
| Abuse / rate limiting | Temporary connection / IP-related signals during requests | Art. 6(1)(f) GDPR |
| Desktop updates / launcher downloads | Technical requests to GitHub release metadata and packages | Art. 6(1)(b)/(f) GDPR |
| Font rendering | Technical requests to Google Fonts (see section 7) | Art. 6(1)(f) GDPR; consent under German TTDSG where required |

We do **not** sell personal data. The game code does **not** integrate external analytics, advertising, or crash-reporting SDKs (e.g. Google Analytics, Sentry).

### 3. Data we process

**Online account (server)**  
Username; email; password as **PBKDF2 hash** only (with salt); session token; created/last-login timestamps; optional avatar field; cloud save; chat messages (limited history); leaderboard entries.

**Locally on your device**  
Optional remembered username; guest id; local saves (IndexedDB) and pending cloud queue; portable install directory via the launcher (Windows AppData).

Passwords are entered at each launch; durable client-side session restore across restarts is not intended.

### 4. Retention (German statutory minima)

We keep personal data only as long as needed for the stated purposes, subject to German law:

- **Account and game data:** until deletion upon request or until no longer required for the service.  
- **Chat:** short-term only, within the technical history limits.  
- **Security / connection signals:** transient, for protecting the service.  
- **Statutory retention:** where commercial or tax retention duties apply (in particular German AO / HGB), the statutory **minimum retention periods** (typically **6** or **10 years**) apply to records covered by those duties. Gameplay data not subject to such duties is not retained “in reserve” beyond necessity.

After account deletion, related personal data is deleted or anonymised unless a statutory duty requires longer retention.

### 5. Recipients and transfers to the USA

The live server is hosted by **Google in the United States**. Personal data may therefore be transferred to the USA, only as needed to operate the online service, and subject to GDPR Chapter V (including appropriate safeguards such as Standard Contractual Clauses / Google’s applicable data-processing terms).

Update checks and launcher downloads may contact **GitHub** (Microsoft). Font loading may contact **Google Fonts** (section 7).

### 6. Minors

The service is intended for users **aged 12 and above**.

Under Art. 8 GDPR as applied in Germany, the digital age of consent is generally **16**. For users **under 16**, account-related processing of personal data requires authorisation by a **holder of parental responsibility**. Parents/guardians are responsible for use by children under 16.

### 7. Google Fonts

The client and launcher load **Cinzel** and **Inter** via Google Fonts. Your IP address may be transmitted to Google (USA). Legal basis: legitimate interests in consistent typography (Art. 6(1)(f) GDPR); where the German TTDSG requires consent for non-essential device access, we will obtain it or ship local fonts when delivered technically.

### 8. Desktop updater and launcher

The desktop client may fetch update metadata from the project’s GitHub Releases. The Siegel-Portal launcher queries the GitHub API and downloads signed portable packages. Ordinary technical server logs may be created by those providers.

### 9. Your rights

You may request access, rectification, erasure, restriction, portability, and objection to processing based on legitimate interests (Arts. 15–21 GDPR), where legal conditions are met.

**Account deletion:** email **grimoire.interactive@gmail.com** (e.g. subject “Delete account”), stating your username and registered email if possible.

You may lodge a complaint with a supervisory authority, in particular in Germany where you reside.

### 10. Security

Passwords are stored using PBKDF2. Production traffic should use encrypted connections (`wss://` / TLS). Absolute security on the internet cannot be guaranteed.

### 11. Changes

We may update this policy when the service or legal requirements change. The version published in the repository or with a release prevails.
