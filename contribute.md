TASK: Initialize git, commit, and push this project to my GitHub repository.

====================================================================
STEPS
====================================================================
1. Initialize a git repository in the project root if one doesn't
   already exist (`git init`).

2. Create a proper `.gitignore` for an Expo/React Native + TypeScript
   project before committing anything. It must exclude at minimum:
   node_modules/, .expo/, .expo-shared/, dist/, web-build/, *.log,
   .env, .env.local, android/app/build/, ios/Pods/, .DS_Store,
   *.keystore, *.jks

3. Make sure no secrets are committed — double-check there is no
   ThingSpeak API key, LLM API key, or any credential hardcoded in
   any file before staging. If any are found, move them into a
   `.env` file instead and reference them via environment variables.

4. Stage and commit the project in a FEW logical, human-sounding
   commits — not one giant dump, and not robotic auto-generated
   messages. Group related files together and write commit messages
   the way a real developer would while building this feature
   incrementally, for example (adapt wording to what was actually
   built, don't copy these verbatim):

     - "project setup: expo + typescript + navigation skeleton"
     - "add theme tokens and fonts to match web dashboard"
     - "build home screen with site cards and status badges"
     - "add site detail screen with parameter tabs and chart"
     - "mock data layer for sensor readings (thingspeak key pending)"
     - "add AI assistant chat screen with mock responses"
     - "add alerts screen"
     - "wire up bottom tab + stack navigation"
     - "minor styling fixes and dark mode polish"

   Keep each message lowercase-start, short (under ~60 chars for the
   title), written like a person casually describing what they just
   did — not "feat: implement HomeScreen component (#1)" corporate
   style, and not a single message like "initial commit" for
   everything.

5. If this is the first push: create the GitHub repo (ask me for the
   repo name if not already known, or use "wellspring-app" as default),
   set it as the `origin` remote, and push all commits to the `main`
   branch.

6. If a remote already exists: just commit and push normally to the
   current branch.

7. After pushing, show me the final list of commits (`git log --oneline`)
   so I can see how the history reads before I show it to anyone.

====================================================================
IMPORTANT
====================================================================
- Do NOT squash everything into one commit.
- Do NOT use generic messages like "update", "fix", "changes", or
  "commit 1/2/3".
- Do NOT include any API keys, tokens, or .env file contents in any
  commit.
- Match the commit style to what was actually built in this session —
  don't fabricate history for work that wasn't done.




repo :https://github.com/Raghav7-tech/WellSpring.git