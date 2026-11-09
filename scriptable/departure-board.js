// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: subway;

/* Departure Board — a Scriptable widget
 *
 * The next departures from one Zürich (or any Swiss) stop, drawn like the
 * LED dot-matrix displays at VBZ tram and bus stops:
 *
 *      Zürich, Bellevue                 22:47
 *        4  Altstetten                     2'
 *       15  Bucheggplatz                   5'
 *       11  Auzelg                     [vehicle]
 *
 *   line | destination | minutes until it leaves (live delays included)
 *
 * SETUP
 *   1. Install "Scriptable" (free) from the App Store.
 *   2. In Scriptable tap +, paste this whole file, name it "Departure Board".
 *   3. Run it once inside Scriptable: it asks for the station, lets you pick
 *      the right stop, shows a preview and copies the station name.
 *   4. On the Home Screen add a Scriptable widget (small, medium or large),
 *      long-press it → Edit Widget → Script: "Departure Board",
 *      Parameter: paste the station name (e.g. "Zürich, Bellevue").
 *      An empty Parameter shows Zürich HB.
 *
 * The header shows the stop and the time the board was drawn. iOS decides
 * how often a widget refreshes (usually every few minutes), so the minutes
 * count from that time.
 *
 * Data: transport.opendata.ch (open API on top of the official Swiss
 * timetable, with live delays). No API key.
 *
 * Font: the pixel font and vehicle symbols come from
 * https://github.com/sschueller/vbz-fahrgastinformation
 * (MIT licence, Copyright (c) 2022 Stefan Schüller — full notice at the end
 * of this file). The letters J, Q, X, j and x are not in that font and were
 * drawn in the same style.
 */

const FONT = {
  30:[9,1,0,[32256,33024,65280,33024,33024,33024,33024,65280,48384,65280,16896]],
  31:[10,1,0,[6144,6144,0,6144,16128,22528,40832,40832,33408,17536,14528]],
  32:[5,1,10,[]],
  39:[2,1,1,[32768,32768,32768]],
  42:[5,1,5,[43008,28672,63488,28672,43008]],
  44:[3,1,7,[24576,24576,49152,49152]],
  45:[7,1,4,[64512,64512]],
  46:[3,1,8,[49152,49152]],
  47:[5,1,1,[12288,12288,12288,24576,24576,24576,49152,49152,49152]],
  48:[7,1,1,[30720,52224,52224,52224,52224,52224,52224,52224,30720]],
  49:[6,1,1,[12288,28672,61440,12288,12288,12288,12288,12288,12288]],
  50:[7,1,1,[30720,52224,52224,3072,6144,12288,24576,52224,64512]],
  51:[7,1,1,[30720,52224,52224,3072,6144,3072,52224,52224,30720]],
  52:[7,1,1,[49152,49152,49152,55296,55296,64512,6144,6144,6144]],
  53:[7,1,1,[64512,52224,49152,49152,63488,3072,3072,52224,30720]],
  54:[7,1,1,[30720,52224,49152,49152,63488,52224,52224,52224,30720]],
  55:[7,1,1,[64512,52224,3072,6144,12288,24576,49152,49152,49152]],
  56:[7,1,1,[30720,52224,52224,52224,30720,52224,52224,52224,30720]],
  57:[7,1,1,[30720,52224,52224,52224,31744,3072,3072,52224,30720]],
  58:[3,1,4,[49152,49152,0,0,49152,49152]],
  60:[6,1,1,[6144,12288,24576,49152,24576,12288,6144]],
  62:[6,1,1,[49152,24576,12288,6144,12288,24576,49152]],
  65:[7,1,1,[30720,52224,52224,52224,52224,64512,52224,52224,52224]],
  66:[7,1,1,[63488,52224,52224,52224,63488,52224,52224,52224,63488]],
  67:[7,1,1,[30720,52224,52224,49152,49152,49152,52224,52224,30720]],
  68:[7,1,1,[63488,52224,52224,52224,52224,52224,52224,52224,63488]],
  69:[7,1,1,[64512,52224,49152,49152,61440,49152,49152,52224,64512]],
  70:[7,1,1,[64512,52224,49152,49152,61440,49152,49152,49152,49152]],
  71:[7,1,1,[30720,52224,52224,49152,49152,56320,52224,52224,30720]],
  72:[7,1,1,[52224,52224,52224,52224,64512,52224,52224,52224,52224]],
  73:[3,1,1,[49152,49152,49152,49152,49152,49152,49152,49152,49152]],
  75:[7,1,1,[52224,52224,55296,61440,57344,61440,55296,52224,52224]],
  76:[7,1,1,[49152,49152,49152,49152,49152,49152,49152,52224,64512]],
  77:[9,1,1,[49920,59136,65280,56064,49920,49920,49920,49920,49920]],
  78:[7,1,1,[50688,50688,58880,62976,56832,52736,50688,50688,50688]],
  79:[7,1,1,[30720,52224,52224,52224,52224,52224,52224,52224,30720]],
  80:[7,1,1,[63488,52224,52224,52224,63488,49152,49152,49152,49152]],
  82:[7,1,1,[63488,52224,52224,52224,63488,61440,56320,52224,52224]],
  83:[7,1,1,[30720,52224,49152,57344,30720,7168,3072,52224,30720]],
  84:[7,1,1,[64512,46080,12288,12288,12288,12288,12288,12288,12288]],
  85:[7,1,1,[52224,52224,52224,52224,52224,52224,52224,52224,30720]],
  86:[7,1,1,[52224,52224,52224,52224,52224,52224,52224,30720,12288]],
  87:[9,1,1,[49920,49920,49920,49920,49920,56064,56064,32256,9216]],
  89:[7,1,1,[52224,52224,52224,52224,30720,12288,12288,12288,12288]],
  90:[7,1,1,[64512,52224,3072,6144,12288,24576,49152,52224,64512]],
  96:[3,1,1,[49152,49152,32768]],
  97:[7,1,3,[30720,52224,3072,31744,52224,52224,29696]],
  98:[7,1,1,[49152,49152,63488,52224,52224,52224,52224,52224,63488]],
  99:[7,1,3,[30720,52224,49152,49152,49152,52224,30720]],
  100:[7,1,1,[3072,3072,31744,52224,52224,52224,52224,52224,31744]],
  101:[7,1,3,[30720,52224,52224,64512,49152,52224,30720]],
  102:[5,1,1,[12288,24576,24576,61440,24576,24576,24576,24576,24576]],
  103:[7,1,3,[30720,52224,52224,52224,52224,31744,3072,52224,30720]],
  104:[7,1,1,[49152,49152,63488,52224,52224,52224,52224,52224,52224]],
  105:[3,1,0,[49152,49152,0,49152,49152,49152,49152,49152,49152,49152]],
  107:[7,1,1,[49152,49152,52224,55296,61440,61440,55296,52224,50176]],
  108:[4,1,1,[49152,49152,49152,49152,49152,49152,49152,49152,24576]],
  109:[10,1,3,[56064,65408,51584,51584,51584,51584,51584]],
  110:[7,1,3,[55296,64512,52224,52224,52224,52224,52224]],
  111:[7,1,3,[30720,52224,52224,52224,52224,52224,30720]],
  112:[7,1,3,[63488,52224,52224,52224,52224,52224,63488,49152,49152]],
  113:[7,1,3,[31744,52224,52224,52224,52224,52224,31744,3072,3072]],
  114:[5,1,3,[45056,61440,49152,49152,49152,49152,49152]],
  115:[7,1,3,[30720,52224,49152,30720,3072,52224,30720]],
  116:[5,1,1,[24576,24576,61440,24576,24576,24576,24576,24576,12288]],
  117:[7,1,3,[52224,52224,52224,52224,52224,64512,27648]],
  118:[7,1,3,[52224,52224,52224,52224,52224,30720,12288]],
  119:[10,1,3,[49536,49536,51584,51584,51584,32512,13824]],
  121:[6,1,3,[52224,52224,52224,52224,52224,15360,3072,52224,30720]],
  122:[7,1,3,[64512,35840,6144,12288,24576,50176,64512]],
  123:[7,1,0,[52224,52224,0,30720,52224,3072,31744,52224,52224,29696]],
  124:[7,1,0,[52224,52224,0,30720,52224,52224,52224,52224,52224,30720]],
  125:[7,1,0,[52224,52224,0,52224,52224,52224,52224,52224,64512,27648]],
  228:[7,1,0,[52224,52224,0,30720,52224,3072,31744,52224,52224,29696]],
  246:[7,1,0,[52224,52224,0,30720,52224,52224,52224,52224,52224,30720]],
  252:[7,1,0,[52224,52224,0,52224,52224,52224,52224,52224,64512,27648]],
  // Added in the same style: not in the original font (J, Q, X, j, x).
  74:[7,1,1,[3072,3072,3072,3072,3072,3072,52224,52224,30720]],
  81:[7,1,1,[30720,52224,52224,52224,52224,52224,56320,30720,3072]],
  88:[7,1,1,[52224,52224,52224,30720,12288,30720,52224,52224,52224]],
  106:[5,1,0,[12288,12288,0,12288,12288,12288,12288,12288,12288,12288,12288,57344]],
  120:[7,1,3,[52224,52224,30720,12288,30720,52224,52224]]
};

// ---------------------------------------------------------------- settings

const DEFAULT_STATION = "Zürich HB";
const AMBER = "#f7b500";
const API = "https://transport.opendata.ch/v1";

// Widget sizes in points (typical iPhone). The drawing is scaled to fill.
const SIZES = {
  small: [170, 170],
  medium: [364, 170],
  large: [364, 382],
  extraLarge: [715, 340],
};

// Column widths in dots — the same layout as the mirror's board.
const CELL = 12; // dots per text line
const PITCH = 17; // dots per board line
const LABEL_W = 26;
const GAP_W = 8;
const TIME_W = 22;
const MARGIN_W = 2;

// The display's vehicle symbol (front view). The font's other symbol, 0x1F,
// is the wheelchair / level-entry sign, so it is not used for departures.
const ICON_VEHICLE = 0x1e;
const TICK_LIVE = "`"; // fat tick: live data
const TICK_PLAN = "'"; // thin tick: timetable only

// Trams and buses are known by their number ("4"), trains by category +
// number ("S14", "IR36").
const NUMBER_ONLY = new Set(["T", "B", "BUS", "TRAM", "NFT", "NFB", "NFO", "TRO", "M"]);

// ---------------------------------------------------------------- dot font

function glyphFor(ch) {
  const code = ch.codePointAt(0);
  if (FONT[code]) return FONT[code];
  const plain = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (plain !== ch && FONT[plain.codePointAt(0)]) return FONT[plain.codePointAt(0)];
  return FONT[32]; // unknown character: a blank
}

/* Glyphs of `text` that fit in `maxDots`, and their total width. */
function layout(text, maxDots) {
  const glyphs = [];
  let w = 0;
  for (const ch of text) {
    const g = glyphFor(ch);
    if (maxDots && w + g[0] > maxDots) break;
    glyphs.push(g);
    w += g[0];
  }
  return { glyphs, width: w };
}

/* Draw text as separated LED dots. (x, y) is the top-left of the text cell
 * in points, `u` the size of one dot, `maxDots` the column width. */
function drawText(ctx, text, x, y, u, maxDots, align, color) {
  const { glyphs, width } = layout(text, maxDots);
  let cx = align === "right" ? x + (maxDots - width) * u : x;
  ctx.setFillColor(color);
  const dot = 0.84 * u;
  for (const [adv, xo, yo, rows] of glyphs) {
    for (let r = 0; r < rows.length; r++) {
      const bits = rows[r];
      if (!bits) continue;
      for (let c = 0; c < 16; c++) {
        if (bits & (1 << (15 - c))) {
          ctx.fillRect(new Rect(cx + (xo + c + 0.08) * u, y + (yo + r + 0.08) * u, dot, dot));
        }
      }
    }
    cx += adv * u;
  }
}

// ---------------------------------------------------------------- data

async function getJSON(url) {
  const req = new Request(url);
  req.timeoutInterval = 15;
  return req.loadJSON();
}

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/* Stations matching a search text, best first. */
async function findStations(query) {
  const j = await getJSON(`${API}/locations?query=${encodeURIComponent(query)}&type=station`);
  const list = (j.stations || []).filter((s) => s && s.id && s.name);
  // An exact name match wins; otherwise prefer Zürich stops, then the
  // API's own ranking.
  const exact = list.filter((s) => norm(s.name) === norm(query));
  const zurich = list.filter((s) => !exact.includes(s) && /^zürich\b/i.test(s.name));
  const rest = list.filter((s) => !exact.includes(s) && !zurich.includes(s));
  return [...exact, ...zurich, ...rest].map((s) => ({ id: String(s.id), name: s.name }));
}

async function resolveStation(param) {
  if (/^\d{7}$/.test(param)) return { id: param, name: null }; // a station id
  const list = await findStations(param);
  return list[0] || null;
}

/* Destinations in the stop's own town drop the town, like the real
 * displays: at "Zürich, Bellevue", "Zürich, Heuried" shows as "Heuried". */
function shortDest(to, stationName) {
  const town = String(stationName || "").split(",")[0].trim().split(/\s+/)[0];
  const prefix = `${town}, `;
  return town && to.startsWith(prefix) && to.length > prefix.length ? to.slice(prefix.length) : to;
}

function lineLabel(category, number) {
  const cat = String(category || "").trim();
  const num = String(number || "").trim();
  if (NUMBER_ONLY.has(cat.toUpperCase()) && num) return num;
  return `${cat}${num}` || "?";
}

/* Milliseconds since 1970 from the API's ISO times. The API writes the
 * offset as "+0100", which JavaScriptCore (iOS) does not parse; turn it
 * into "+01:00" first. */
function parseTime(s) {
  if (!s) return NaN;
  const iso = String(s).replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  return new Date(iso).getTime();
}

/* When a departure really leaves (ms), and whether that is live data.
 * Prefer the live forecast, then the timetable time plus the delay. */
function departureTime(stop) {
  const live = parseTime(stop.prognosis && stop.prognosis.departure);
  if (isFinite(live) && live > 0) return { at: live, live: true };
  const delay = Number(stop.delay) || 0;
  const hasDelay = stop.delay !== null && stop.delay !== undefined;
  const ts = Number(stop.departureTimestamp);
  if (stop.departureTimestamp && isFinite(ts) && ts > 0) {
    return { at: ts * 1000 + delay * 60000, live: hasDelay };
  }
  const planned = parseTime(stop.departure);
  if (isFinite(planned) && planned > 0) return { at: planned + delay * 60000, live: hasDelay };
  return null;
}

async function loadDepartures(id, limit) {
  // No `fields[]` filter: on the stationboard it can drop the nested `stop`
  // data, which leaves every departure without a time ("No departures").
  const j = await getJSON(`${API}/stationboard?id=${encodeURIComponent(id)}&limit=${limit + 6}`);
  const raw = j.stationboard || [];
  const departures = [];
  for (const e of raw) {
    if (!e || !e.stop) continue;
    const t = departureTime(e.stop);
    if (!t) continue;
    departures.push({
      label: lineLabel(e.category, e.number),
      to: e.to || "",
      rail: !NUMBER_ONLY.has(String(e.category || "").toUpperCase()),
      at: t.at,
      live: t.live,
    });
  }
  return { name: j.station && j.station.name, departures, rawCount: raw.length };
}

// Last good board per station, shown (with fresh minutes) when offline.
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.documentsDirectory(), "departure-board-cache.json");

function readCache() {
  try {
    return fm.fileExists(cachePath) ? JSON.parse(fm.readString(cachePath)) : {};
  } catch (e) {
    return {};
  }
}

function writeCache(cache) {
  try {
    fm.writeString(cachePath, JSON.stringify(cache));
  } catch (e) {
    /* a cache write failure is not worth failing the widget for */
  }
}

/* Everything the board needs for one station: name, departures, and a
 * message when something went wrong. Falls back to the cache offline. */
async function getBoard(param, maxRows) {
  const cache = readCache();
  const key = norm(param);
  try {
    const station = await resolveStation(param);
    if (!station) return { name: param, rows: [], message: "Station not found" };
    const data = await loadDepartures(station.id, maxRows);
    const name = station.name || data.name || param;
    const message =
      data.rawCount === 0 ? "No departures" : data.departures.length === 0 ? "No times in data" : null;
    if (data.departures.length) {
      cache[key] = { name, departures: data.departures, fetchedAt: Date.now() };
      writeCache(cache);
    }
    return { name, rows: data.departures, fetchedAt: Date.now(), message };
  } catch (e) {
    console.error(`Departure Board: ${e}`);
    const old = cache[key];
    if (old && Date.now() - old.fetchedAt < 3 * 3600 * 1000) {
      return { name: old.name, rows: old.departures, fetchedAt: old.fetchedAt, offline: true };
    }
    return { name: param, rows: [], message: "No connection" };
  }
}

// ---------------------------------------------------------------- drawing

function familyOf(f) {
  return SIZES[f] ? f : "medium";
}

function maxRowsFor(family) {
  const [W, H] = SIZES[family];
  const destW = family === "small" ? 52 : 120;
  const cols = 2 * MARGIN_W + LABEL_W + GAP_W + destW + GAP_W + TIME_W;
  const u = W / cols;
  return Math.max(1, Math.min(10, Math.floor(H / (PITCH * u)) - 1)); // -1: header
}

function drawBoard(family, board) {
  const [W, H] = SIZES[family];
  const destW = family === "small" ? 52 : 120;
  const cols = 2 * MARGIN_W + LABEL_W + GAP_W + destW + GAP_W + TIME_W;
  const u = W / cols;
  const pitch = PITCH * u;
  const maxRows = maxRowsFor(family);

  const ctx = new DrawContext();
  ctx.size = new Size(W, H);
  ctx.opaque = true;
  ctx.respectScreenScale = true;
  ctx.setFillColor(new Color("#000000"));
  ctx.fillRect(new Rect(0, 0, W, H));

  const amber = new Color(AMBER);
  const dim = new Color(AMBER, 0.55);
  const textTop = ((PITCH - CELL) / 2) * u;
  // Centre the block (header + all lines) vertically.
  const top = (H - (maxRows + 1) * pitch) / 2;

  const xLabel = MARGIN_W * u;
  const xDest = xLabel + (LABEL_W + GAP_W) * u;
  const xTime = xDest + (destW + GAP_W) * u;

  // Header: stop name on the left, time of drawing on the right.
  const stampTime = new Date(board.fetchedAt || Date.now());
  const stamp =
    (board.offline ? "* " : "") +
    `${String(stampTime.getHours()).padStart(2, "0")}:${String(stampTime.getMinutes()).padStart(2, "0")}`;
  const stampW = layout(stamp).width;
  const innerW = cols - 2 * MARGIN_W;
  drawText(ctx, board.name || "", xLabel, top + textTop, u, innerW - stampW - GAP_W, "left", dim);
  drawText(ctx, stamp, xLabel, top + textTop, u, innerW, "right", dim);

  const now = Date.now();
  const rows = (board.rows || [])
    .map((d) => ({ ...d, minutes: Math.floor((d.at - now) / 60000) }))
    .filter((d) => d.at - now > -60000) // keep "leaving now" for a minute
    .sort((a, b) => a.at - b.at)
    .slice(0, maxRows);

  if (!rows.length) {
    const msg = board.message || "No departures";
    drawText(ctx, msg, xLabel, top + pitch + textTop, u, innerW, "left", dim);
  }

  rows.forEach((d, i) => {
    const y = top + (i + 1) * pitch + textTop;
    drawText(ctx, d.label, xLabel, y, u, LABEL_W, "right", amber);
    drawText(ctx, shortDest(d.to, board.name), xDest, y, u, destW, "left", amber);
    const time =
      d.minutes <= 0
        ? String.fromCodePoint(ICON_VEHICLE)
        : `${d.minutes}${d.live ? TICK_LIVE : TICK_PLAN}`;
    drawText(ctx, time, xTime, y, u, TIME_W, "right", amber);
  });

  return ctx.getImage();
}

async function buildWidget(family, param) {
  const board = await getBoard(param, maxRowsFor(family));
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#000000");
  widget.setPadding(0, 0, 0, 0);
  widget.backgroundImage = drawBoard(family, board);
  // Ask iOS for a refresh in a minute; it decides when it really happens.
  widget.refreshAfterDate = new Date(Date.now() + 60 * 1000);
  return widget;
}

// ---------------------------------------------------------------- main

async function runInApp() {
  const ask = new Alert();
  ask.title = "Departure Board";
  ask.message = "Which station? For example: Bellevue, Stadelhofen, Zürich HB";
  ask.addTextField("Station", DEFAULT_STATION);
  ask.addAction("Search");
  ask.addCancelAction("Cancel");
  if ((await ask.presentAlert()) === -1) return;

  const query = ask.textFieldValue(0).trim() || DEFAULT_STATION;
  let list = [];
  try {
    list = await findStations(query);
  } catch (e) {
    const err = new Alert();
    err.title = "No connection";
    err.message = "Could not reach the timetable service.";
    err.addAction("OK");
    await err.presentAlert();
    return;
  }
  if (!list.length) {
    const none = new Alert();
    none.title = "Not found";
    none.message = `No station matches "${query}".`;
    none.addAction("OK");
    await none.presentAlert();
    return;
  }

  let station = list[0];
  if (list.length > 1) {
    const pick = new Alert();
    pick.title = "Which stop?";
    list.slice(0, 8).forEach((s) => pick.addAction(s.name));
    pick.addCancelAction("Cancel");
    const i = await pick.presentAlert();
    if (i === -1) return;
    station = list[i];
  }

  Pasteboard.copyString(station.name);
  const done = new Alert();
  done.title = station.name;
  done.message =
    "Copied to the clipboard.\n\nAdd a Scriptable widget to your Home Screen, " +
    "then Edit Widget → Script: this script → Parameter: paste the name.";
  done.addAction("Show preview");
  await done.presentAlert();

  const widget = await buildWidget("medium", station.name);
  await widget.presentMedium();
}

if (config.runsInWidget) {
  const family = familyOf(config.widgetFamily);
  const param = (args.widgetParameter || "").trim() || DEFAULT_STATION;
  Script.setWidget(await buildWidget(family, param));
} else if (config.runsInApp) {
  await runInApp();
} else {
  // Siri / Shortcuts: just show the board for the default station.
  const widget = await buildWidget("medium", (args.widgetParameter || "").trim() || DEFAULT_STATION);
  await widget.presentMedium();
}
Script.complete();

/* ----------------------------------------------------------------------
 * Pixel font: https://github.com/sschueller/vbz-fahrgastinformation
 *
 * Copyright (c) 2022 Stefan Schüller
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
