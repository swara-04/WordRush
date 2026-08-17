// ---------------------------------------------------------------------------
// WordRush — vanilla JS typing game, two modes, Supabase-backed leaderboard.
//
// FILL THESE IN with your own Supabase project's values (Settings -> API
// for the Project URL, Settings -> API Keys for the Publishable key).
// ---------------------------------------------------------------------------

// These two constants connect the game to your Supabase project. Until you
// replace the placeholder text, the game still works locally (scores just
// will not be shared with anyone else, they only live in your browser).
const SUPABASE_URL = "https://olgowahqvgrmkqswegjy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ293YWhxdmdybWtxc3dlZ2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MzM3NTQsImV4cCI6MjEwMjUwOTc1NH0.6is8Hud-NWwD8bzomOMn64SFOa3GR02USADW-wKlvRQ";

// supabaseClient stays null until a real URL/key is provided. Every function
// that talks to Supabase checks "if (supabaseClient)" first, so the game
// degrades gracefully (no shared leaderboard, but everything else works).
let supabaseClient = null;
if (window.supabase && SUPABASE_URL !== "YOUR_SUPABASE_URL") {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// How long each round lasts, in seconds.
const GAME_DURATION = 30; // seconds

// How many characters of essay text are rendered ahead of the cursor at
// once. This is purely a display window, it does not limit how far the
// player can actually type, it just controls how much text is drawn on
// screen at a time (rendering the whole essay every keystroke would be
// wasteful).
const ESSAY_WINDOW = 180; // characters shown ahead of the cursor

// ---- Content (original, hand written, safe to show publicly) -----------

// The pool of words used in Words mode. A new word is picked at random
// (see pickWord below) each time the player finishes the current one.
const WORDS = [
  "pizza", "llama", "wifi", "couch", "noodle", "gremlin", "chaos", "spooky",
  "banana", "waffle", "turbo", "sneaky", "potato", "glitter", "bubble",
  "snack", "doodle", "wizard", "ninja", "taco",
  "avocado", "unicorn", "spaghetti", "chaotic", "procrastinate",
  "caffeinated", "shenanigans", "ridiculous", "marshmallow", "flamingo",
  "suspicious", "adventure", "spontaneous", "hilarious", "overthinking",
  "tornado", "dinosaur", "glorious", "mysterious", "fantastic",
];

// The raw sentences used to build Essay mode's text. Kept as an array so
// they are easy to read/edit individually, then joined into one long
// string below.
const ESSAY_SENTENCES = [
  "Once upon a time there was a sweet little girl. Everyone who saw her liked her, but most of all her grandmother, who did not know what to give the child next. Once she gave her a little cap made of red velvet. Because it suited her so well, and she wanted to wear it all the time, she came to be known as Little Red Riding Hood. One day her mother said to her: Come Little Red Riding Hood. Here is a piece of cake and a bottle of wine. Take them to your grandmother. She is sick and weak, and they will do her well. Mind your manners and give her my greetings. Behave yourself on the way, and do not leave the path, or you might fall down and break the glass, and then there will be nothing for your sick grandmother.",
  "Little Red Riding Hood promised to obey her mother. The grandmother lived out in the woods, a half hour from the village. When Little Red Riding Hood entered the woods a wolf came up to her. She did not know what a wicked animal he was, and was not afraid of him. Good day to you, Little Red Riding Hood. Thank you, wolf. Where are you going so early, Little Red Riding Hood? To grandmother's. And what are you carrying under your apron? Grandmother is sick and weak, and I am taking her some cake and wine. We baked yesterday, and they should give her strength. Little Red Riding Hood, just where does your grandmother live? Her house is a good quarter hour from here in the woods, under the three large oak trees. There's a hedge of hazel bushes there. You must know the place, said Little Red Riding Hood. The wolf thought to himself: Now there is a tasty bite for me. Just how are you going to catch her? Then he said: Listen, Little Red Riding Hood, haven't you seen the beautiful flowers that are blossoming in the woods? Why don't you go and take a look? And I don't believe you can hear how beautifully the birds are singing. You are walking along as though you were on your way to school in the village. It is very beautiful in the woods.",
  "Little Red Riding Hood opened her eyes and saw the sunlight breaking through the trees and how the ground was covered with beautiful flowers. She thought: If a take a bouquet to grandmother, she will be very pleased. Anyway, it is still early, and I'll be home on time. And she ran off into the woods looking for flowers. Each time she picked one she thought that she could see an even more beautiful one a little way off, and she ran after it, going further and further into the woods. But the wolf ran straight to the grandmother's house and knocked on the door. Who's there? Little Red Riding Hood. I'm bringing you some cake and wine. Open the door for me. Just press the latch, called out the grandmother. I'm too weak to get up. The wolf pressed the latch, and the door opened. He stepped inside, went straight to the grandmother's bed, and ate her up. Then he took her clothes, put them on, and put her cap on his head. He got into her bed and pulled the curtains shut.",
  "Little Red Riding Hood had run after flowers, and did not continue on her way to grandmother's until she had gathered all that she could carry. When she arrived, she found, to her surprise, that the door was open. She walked into the parlor, and everything looked so strange that she thought: Oh, my God, why am I so afraid? I usually like it at grandmother's. Then she went to the bed and pulled back the curtains. Grandmother was lying there with her cap pulled down over her face and looking very strange. Oh, grandmother, what big ears you have! All the better to hear you with. Oh, grandmother, what big eyes you have! All the better to see you with. Oh, grandmother, what big hands you have! All the better to grab you with! Oh, grandmother, what a horribly big mouth you have! All the better to eat you with! And with that he jumped out of bed, jumped on top of poor Little Red Riding Hood, and ate her up.",
  "As soon as the wolf had finished this tasty bite, he climbed back into bed, fell asleep, and began to snore very loudly. A huntsman was just passing by. He thought it strange that the old woman was snoring so loudly, so he decided to take a look. He stepped inside, and in the bed there lay the wolf that he had been hunting for such a long time. He has eaten the grandmother, but perhaps she still can be saved. I won't shoot him, thought the huntsman. So he took a pair of scissors and cut open his belly. He had cut only a few strokes when he saw the red cap shining through. He cut a little more, and the girl jumped out and cried: Oh, I was so frightened! It was so dark inside the wolf's body! And then the grandmother came out alive as well. Then Little Red Riding Hood fetched some large heavy stones. They filled the wolf's body with them, and when he woke up and tried to run away, the stones were so heavy that he fell down dead.",
  "The three of them were happy. The huntsman took the wolf's pelt. The grandmother ate the cake and drank the wine that Little Red Riding Hood had brought. And Little Red Riding Hood thought to herself: As long as I live, I will never leave the path and run off into the woods by myself if mother tells me not to.",
  "They also tell how Little Red Riding Hood was taking some baked things to her grandmother another time, when another wolf spoke to her and wanted her to leave the path. But Little Red Riding Hood took care and went straight to grandmother's. She told her that she had seen the wolf, and that he had wished her a good day, but had stared at her in a wicked manner. If we hadn't been on a public road, he would have eaten me up, she said. Come, said the grandmother. Let's lock the door, so he can't get in. Soon afterward the wolf knocked on the door and called out: Open up, grandmother. It's Little Red Riding Hood, and I'm bringing you some baked things. They remained silent, and did not open the door. The wicked one walked around the house several times, and finally jumped onto the roof. He wanted to wait until Little Red Riding Hood went home that evening, then follow her and eat her up in the darkness. But the grandmother saw what he was up to. There was a large stone trough in front of the house. Fetch a bucket, Little Red Riding Hood, she said. Yesterday I cooked some sausage. Carry the water that I boiled them with to the trough. Little Red Riding Hood carried water until the large, large trough was clear full. The smell of sausage arose into the wolf's nose. He sniffed and looked down, stretching his neck so long that he could no longer hold himself, and he began to slide. He slid off the roof, fell into the trough, and drowned. And Little Red Riding Hood returned home happily and safely.",
];


// All the sentences glued into one continuous string, separated by single
// spaces. This is the "master text" that Essay mode pulls characters from.
// If you want a longer essay, just add more sentences to the array above,
// nothing else needs to change.
const BASE_ESSAY = ESSAY_SENTENCES.join(" ");

// Short blurb shown under the mode buttons on the home screen, keyed by
// mode name so it is easy to swap in $("mode-desc").textContent below.
const MODE_DESC = {
  words: "One word at a time.",
  essay: "Nonstop paragraph, no Enter, just keep typing until time's up.",
};

// Picks a random word from WORDS. The optional "exclude" argument stops the
// same word from appearing twice in a row (the while loop just rerolls if
// it happens to pick the excluded word, as long as there is more than one
// word to choose from).
function pickWord(exclude) {
  let w = WORDS[Math.floor(Math.random() * WORDS.length)];
  while (w === exclude && WORDS.length > 1) {
    w = WORDS[Math.floor(Math.random() * WORDS.length)];
  }
  return w;
}

// Returns the character at absolute position "i" in the essay, wrapping
// around to the start once the end of BASE_ESSAY is reached. This is what
// makes the essay loop forever: position 0, BASE_ESSAY.length, and
// BASE_ESSAY.length * 2 all point at the same character. A player who
// finishes the whole essay just starts seeing it repeat from the top.
function essayChar(i) {
  return BASE_ESSAY[i % BASE_ESSAY.length];
}

// Builds a plain string of "length" characters starting at "startPos",
// using essayChar so it also wraps correctly. Used to grab the chunk of
// upcoming text that gets rendered on screen.
function essayWindowText(startPos, length) {
  let s = "";
  for (let i = 0; i < length; i++) s += essayChar(startPos + i);
  return s;
}

// ---- Game state -----------------------------------------------------------
// A single object holding everything about the current round. Keeping it
// all in one place makes it easy to reset (see startGame) and easy to
// reason about (any function can read/write state.whatever).
const state = {
  phase: "idle", // idle | playing | gameover, which screen we are logically in
  username: "", // whatever the player typed into the name field
  mode: "words", // words | essay, which mode is currently selected/active
  currentWord: "", // Words mode: the word currently being typed
  essayPos: 0, // Essay mode: absolute index into the looping essay text
  essayHistory: [], // Essay mode: booleans, was each recently typed char correct? most recent last
  inputValue: "", // Words mode: mirrors the text box so we can diff new keystrokes
  timeLeft: GAME_DURATION, // seconds left in the round, counts down each tick
  score: 0, // running score for the round
  streak: 0, // current consecutive correct streak
  bestStreak: 0, // highest streak reached this round (kept even after a miss resets streak)
  totalKeys: 0, // total characters attempted, used for accuracy percentage
  correctKeys: 0, // total characters typed correctly, used for accuracy percentage
  timerId: null, // handle returned by setInterval, so we can clearInterval it later
};

// personalBest is loaded from localStorage on page load (this browser only).
// leaderboard is the shared, cross player list fetched from Supabase.
let personalBest = null;
let leaderboard = [];

// ---- DOM helpers ------------------------------------------------------

// Tiny shorthand for document.getElementById, used everywhere below so the
// code is not full of repeated document.getElementById calls.
const $ = (id) => document.getElementById(id);

// Switches which of the three main screens (idle, playing, gameover) is
// visible by toggling the "hidden" CSS class on each one. Only the screen
// matching "name" loses the hidden class.
function showScreen(name) {
  $("screen-idle").classList.toggle("hidden", name !== "idle");
  $("screen-playing").classList.toggle("hidden", name !== "playing");
  $("screen-gameover").classList.toggle("hidden", name !== "gameover");
}

// Safely converts a string into HTML escaped text (so things like "<" or
// "&" typed by a player, or appearing in a username, cannot break the page
// layout or be interpreted as HTML). It works by letting the browser itself
// do the escaping: setting textContent then reading back innerHTML.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- Rendering: Words mode ---

// Draws one little box ("tile") per letter of the current word. Each tile
// is colored based on whether the player has typed that position yet, and
// if so, whether it was correct. This is only ever called while
// state.mode is "words".
function renderWordTiles() {
  const container = $("tiles");
  container.innerHTML = ""; // clear out the previous word's tiles first
  for (let i = 0; i < state.currentWord.length; i++) {
    const ch = state.currentWord[i];
    const span = document.createElement("span");
    span.className = "tile";
    span.textContent = ch;
    if (i < state.inputValue.length) {
      // This position has been typed already, color it green if it
      // matches the target letter, red if it does not.
      span.classList.add(state.inputValue[i] === ch ? "correct" : "wrong");
    }
    container.appendChild(span);
  }
}

// --- Rendering: Essay mode ---
// Shows a trailing window of already typed characters (colored correct or
// wrong, the same idea as the tiles above), the current character under a
// highlighted cursor, and the upcoming text still left to type.
const ESSAY_TRAIL = 40; // how many past characters stay visible behind the cursor

function renderEssayWindow() {
  // Only show up to ESSAY_TRAIL characters behind the cursor, so the box
  // does not grow forever as a long round goes on. essayHistory itself is
  // also capped at this length elsewhere, so this is mostly a safeguard.
  const trailCount = Math.min(state.essayHistory.length, ESSAY_TRAIL);
  const trailStart = state.essayPos - trailCount;

  let trailHtml = "";
  for (let i = 0; i < trailCount; i++) {
    // essayHistory is ordered oldest to newest, so we index from the end
    // to line each stored boolean up with the correct character position.
    const wasCorrect = state.essayHistory[state.essayHistory.length - trailCount + i];
    const ch = essayChar(trailStart + i);
    trailHtml += `<span class="${wasCorrect ? "correct" : "wrong"}">${escapeHtml(ch)}</span>`;
  }

  // The very next character to be typed gets wrapped in the cursor style
  // so the player always knows exactly where they are.
  const current = essayChar(state.essayPos);

  // Everything after the cursor is just upcoming text, dimmed so it reads
  // as "not yet typed" without needing separate spans per character.
  const ahead = essayWindowText(state.essayPos + 1, ESSAY_WINDOW);

  $("essay-text").innerHTML =
    `${trailHtml}<span class="cursor">${escapeHtml(current)}</span><span class="ahead">${escapeHtml(ahead)}</span>`;
}

// Briefly flashes the input box red to give feedback on a mistake, for
// both Words and Essay mode. The class is added then removed 150ms later,
// which the CSS uses to animate a quick flash rather than a solid color.
function flashError() {
  const input = $("game-input");
  input.classList.add("input-error");
  setTimeout(() => input.classList.remove("input-error"), 150);
}

// Refreshes the score, streak, accuracy, and timer numbers shown during
// gameplay. Accuracy is computed on the fly from totalKeys/correctKeys
// rather than stored directly, so it is always in sync with the counters
// used to calculate it. Called after almost every state change while
// playing.
function updateStatsDisplay() {
  $("stat-score").textContent = state.score;
  $("stat-streak").textContent = state.streak;
  const acc = state.totalKeys > 0 ? Math.round((state.correctKeys / state.totalKeys) * 100) : 100;
  $("stat-accuracy").textContent = acc + "%";
  const timerEl = $("stat-timer");
  timerEl.textContent = state.timeLeft + "s";
  // Adds a "low" class in the last few seconds so the CSS can turn the
  // timer red as a visual warning that time is almost up.
  timerEl.classList.toggle("low", state.timeLeft <= 5);
}

// Shows the player's saved personal best (from localStorage) on the home
// screen, or nothing if they have not set one yet.
function renderPersonalBest() {
  const el = $("personal-best");
  el.textContent = personalBest
    ? `Your best: ${personalBest.score} pts, ${personalBest.wpm} wpm, ${personalBest.accuracy}% acc`
    : "";
}

// Renders the shared leaderboard fetched from Supabase. Handles three
// states: Supabase is not configured at all, Supabase is configured but
// has no scores yet, and the normal case of an actual list of scores.
function renderLeaderboard() {
  const el = $("leaderboard-list");
  if (!supabaseClient) {
    el.innerHTML = `<p class="empty-note">Connect Supabase in script.js to enable the shared leaderboard.</p>`;
    return;
  }
  if (leaderboard.length === 0) {
    el.innerHTML = `<p class="empty-note">No scores yet, be the first.</p>`;
    return;
  }
  el.innerHTML = leaderboard
    .map(
      (entry, i) => `
      <div class="row">
        <span><span class="rank">${i + 1}.</span>${escapeHtml(entry.username)}<span class="diff-tag">(${entry.difficulty})</span></span>
        <span>${entry.score} pts, ${entry.wpm} wpm, ${entry.accuracy}%</span>
      </div>`
    )
    .join("");
}

// ---- Persistence: personal best, saved to localStorage --------------------------

// Loads the player's saved personal best from this browser's localStorage,
// if one exists, and immediately renders it. Wrapped in try/catch because
// localStorage can throw (private browsing modes, corrupted data, etc),
// in which case we just fall back to no personal best.
function loadPersonalBest() {
  try {
    const raw = localStorage.getItem("wordrush_personal_best");
    personalBest = raw ? JSON.parse(raw) : null;
  } catch (e) {
    personalBest = null;
  }
  renderPersonalBest();
}

// Saves a new personal best entry to localStorage and re-renders it.
// Called from endGame whenever the round's score beats the previous best.
function savePersonalBest(entry) {
  personalBest = entry;
  localStorage.setItem("wordrush_personal_best", JSON.stringify(entry));
  renderPersonalBest();
}

// ---- Persistence: shared leaderboard, saved to Supabase --------------------------
// NOTE: the "difficulty" column name is kept as is (it now holds "words" or
// "essay" instead of easy/medium/hard) so an existing Supabase table does
// not need to be recreated or migrated.

// Fetches the top 10 scores from the "scores" table, ordered highest
// first. Returns an empty array if Supabase is not configured, or if the
// request fails for any reason (the error is logged so it is still
// debuggable, but the game does not crash the leaderboard over it).
async function fetchLeaderboard() {
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(10);
  if (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
  return data;
}

// Inserts one finished round's result into the "scores" table. Silently
// does nothing (with a console warning) if Supabase is not configured, so
// the game still works fully offline.
async function submitScore(entry) {
  if (!supabaseClient) {
    console.warn("Supabase not configured, score was not saved.");
    return;
  }
  const { error } = await supabaseClient.from("scores").insert([entry]);
  if (error) console.error("Failed to submit score:", error);
}

// Convenience wrapper that fetches the latest leaderboard and immediately
// redraws it. Called on page load and again after every finished round.
async function refreshLeaderboard() {
  leaderboard = await fetchLeaderboard();
  renderLeaderboard();
}

// ---- Game flow --------------------------------------------------------

// Kicks off a new round. Resets every per round counter in state, prepares
// whichever mode is active (a fresh random word, or the essay cursor back
// to position 0), swaps to the playing screen, and starts the countdown
// timer. Used both for the initial "Start Game" button and "Play Again".
function startGame() {
  state.phase = "playing";
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.totalKeys = 0;
  state.correctKeys = 0;
  state.timeLeft = GAME_DURATION;
  state.inputValue = "";
  state.essayPos = 0;
  state.essayHistory = [];
  state.currentWord = pickWord();

  // Show only the element that belongs to the active mode. Both classList
  // calls run every time so switching modes between rounds always ends up
  // with exactly one of the two visible.
  $("tiles").classList.toggle("hidden", state.mode !== "words");
  $("essay-text").classList.toggle("hidden", state.mode !== "essay");

  showScreen("playing");
  if (state.mode === "words") {
    renderWordTiles();
  } else {
    $("tiles").innerHTML = ""; // clear out any leftover word from a previous Words round
    renderEssayWindow();
  }
  updateStatsDisplay();

  const input = $("game-input");
  input.value = "";
  input.placeholder = state.mode === "words" ? "type it, then press space" : "just start typing...";
  input.focus();

  // Clear any timer left running from a previous round before starting a
  // fresh one, so rounds can never overlap or count down twice as fast.
  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 1000);
}

// Runs once per second while playing. Counts the clock down and ends the
// round the moment it hits zero.
function tick() {
  state.timeLeft -= 1;
  updateStatsDisplay();
  if (state.timeLeft <= 0) endGame();
}

// Lets the player abandon a round early and return to the home screen.
// Stops the timer so it cannot keep ticking in the background.
function quitToHome() {
  clearInterval(state.timerId);
  showScreen("idle");
}

// Wraps up a finished round: stops the timer, computes final stats (words
// per minute and accuracy), builds the result entry, updates the game
// over screen, submits the score to Supabase, refreshes the shared
// leaderboard, and updates the local personal best if this round beat it.
async function endGame() {
  clearInterval(state.timerId);
  state.phase = "gameover";

  // WPM is the classic (characters typed correctly / 5) divided by minutes
  // played formula, "5 characters" being the standard stand in for one
  // word regardless of how long actual words are.
  const wpm = Math.round((state.correctKeys / 5) / (GAME_DURATION / 60));
  const accuracy = state.totalKeys > 0 ? Math.round((state.correctKeys / state.totalKeys) * 100) : 100;
  const name = state.username.trim() || "Player";
  const entry = {
    username: name,
    score: state.score,
    wpm,
    accuracy,
    streak: state.bestStreak,
    difficulty: state.mode, // column kept as "difficulty" for schema compatibility
  };

  $("result-score").textContent = entry.score;
  $("result-wpm").textContent = entry.wpm;
  $("result-accuracy").textContent = entry.accuracy + "%";
  $("result-streak").textContent = `Best streak: ${entry.streak}`;
  showScreen("gameover");

  await submitScore(entry);
  await refreshLeaderboard();

  if (!personalBest || entry.score > personalBest.score) {
    savePersonalBest(entry);
  }
}

// --- Words mode: submit on space/enter, same behaviour as before ---

// Checks whatever the player has typed against the current word. Correct
// guesses add 10 points and extend the streak, wrong guesses reset the
// streak and flash the input red. Either way, a new random word (never
// the same one twice in a row) is picked and the tiles are redrawn.
function submitWord() {
  if (!state.inputValue.trim()) return; // ignore submitting an empty box
  const correct = state.inputValue.trim() === state.currentWord;
  if (correct) {
    state.score += 10;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else {
    state.streak = 0;
    flashError();
  }
  state.currentWord = pickWord(state.currentWord);
  state.inputValue = "";
  $("game-input").value = "";
  renderWordTiles();
  updateStatsDisplay();
}

// Fires on every keystroke in Words mode. Compares the newly typed
// characters (the difference between the old and new input value) against
// the target word one by one, so accuracy counts every attempt, not just
// the final submitted word.
function handleWordInput(e) {
  const newValue = e.target.value;
  if (newValue.length > state.inputValue.length) {
    // Only the newly added characters need checking, everything before
    // that was already counted on a previous call.
    for (let i = state.inputValue.length; i < newValue.length; i++) {
      state.totalKeys++;
      if (newValue[i] === state.currentWord[i]) state.correctKeys++;
    }
  }
  state.inputValue = newValue;
  renderWordTiles();
  updateStatsDisplay();
}

// Listens for the keys that submit a word. Both Enter and Space count, and
// the default behaviour is prevented so a space does not actually get
// typed into the box (it is treated purely as a submit action).
function handleWordKeyDown(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    submitWord();
  }
}

// --- Essay mode: continuous, no submit, cursor advances one character at a
// time. Reads directly off keydown (one event per keystroke, nothing gets
// dropped or bundled together the way it can with the input event when
// typing very fast). The input box's value is never actually allowed to
// change, we call preventDefault and manage everything through state
// instead. ---
function handleEssayKeyDown(e) {
  if (e.key === "Backspace") {
    e.preventDefault();
    // Nothing to undo if we are already at the very start of the essay,
    // or nothing has been typed yet this round.
    if (state.essayHistory.length === 0 || state.essayPos === 0) return;

    const wasCorrect = state.essayHistory.pop();
    state.essayPos--;
    state.totalKeys--;
    if (wasCorrect) state.correctKeys--;

    // Recompute the current streak by counting how many correct
    // characters are still at the very end of the trimmed history. This
    // keeps the streak accurate after undoing a keystroke, rather than
    // just guessing.
    let streak = 0;
    for (let i = state.essayHistory.length - 1; i >= 0; i--) {
      if (state.essayHistory[i]) streak++;
      else break;
    }
    state.streak = streak;

    renderEssayWindow();
    updateStatsDisplay();
    return;
  }

  // Ignore anything that is not a single printable character, this
  // filters out Shift, Tab, Enter, arrow keys, function keys, and so on
  // (their e.key values are longer than one character, for example
  // "Shift" or "ArrowLeft", while a normal letter or the space bar is
  // exactly one character long).
  if (e.key.length !== 1) return;
  e.preventDefault();

  const expected = essayChar(state.essayPos);
  const correct = e.key === expected;

  state.essayHistory.push(correct);
  // Keep the history capped at ESSAY_TRAIL entries so it does not grow
  // forever over a long round, we only ever need the most recent stretch
  // for rendering the trail behind the cursor.
  if (state.essayHistory.length > ESSAY_TRAIL) state.essayHistory.shift();

  state.totalKeys++;
  if (correct) {
    state.correctKeys++;
    state.score += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else {
    state.streak = 0;
    flashError();
  }
  state.essayPos++;
  renderEssayWindow();
  updateStatsDisplay();
}

// ---- Wire everything up ---------------------------------------------------
// Waits for the page's HTML to finish loading before touching any elements,
// then attaches every event listener the game needs, exactly once.
document.addEventListener("DOMContentLoaded", () => {
  loadPersonalBest();
  refreshLeaderboard();
  $("mode-desc").textContent = MODE_DESC[state.mode];

  // Keeps state.username in sync as the player types their name, so it is
  // ready to use whenever a round ends.
  $("username-input").addEventListener("input", (e) => {
    state.username = e.target.value;
  });

  // Each mode button (Words / Essay) is a <button data-mode="..."> element.
  // Clicking one marks it active, un-marks the other, switches
  // state.mode, and updates the description text underneath.
  document.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.mode = btn.dataset.mode;
      $("mode-desc").textContent = MODE_DESC[state.mode];
    });
  });

  $("start-btn").addEventListener("click", startGame);
  $("quit-btn").addEventListener("click", quitToHome);
  $("play-again-btn").addEventListener("click", startGame);
  $("home-btn").addEventListener("click", () => showScreen("idle"));

  // The single text input used during gameplay. Which handler actually
  // does the work depends on the active mode: Words mode reads normal
  // typed text, Essay mode ignores the input event entirely (it is driven
  // by keydown instead) and just keeps the box forcibly empty.
  const input = $("game-input");
  input.addEventListener("input", (e) => {
    if (state.mode === "words") handleWordInput(e);
    else e.target.value = ""; // essay mode is driven by keydown, keep the field empty
  });
  input.addEventListener("keydown", (e) => {
    if (state.mode === "words") handleWordKeyDown(e);
    else handleEssayKeyDown(e);
  });
});