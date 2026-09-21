/*
 * RyanShutter admin portal — browser side. Talks only to /api/admin/*
 * (netlify/functions/admin-api.mjs). Builds every piece of DOM that shows
 * user-typed text with textContent, never innerHTML.
 */
"use strict";

(() => {
  const $ = (selector) => document.querySelector(selector);

  const CATEGORY_LABELS = { senior: "Senior", family: "Family", nature: "Nature", custom: "Custom Shots" };
  const CATEGORY_ORDER = ["senior", "family", "nature", "custom"];
  const MAX_EDGE = 2400; // matches the photos already on the site
  const MAX_BYTES = 4 * 1024 * 1024; // under the server's 4.5 MB ceiling
  const UPLOADS_AT_ONCE = 3;

  const state = {
    session: null, files: [], titleTouched: false, busy: false, shoots: [], mode: "one", pending: 0,
    // About Me photos: items are {src} (already on the site) or {file, url} (chosen, not uploaded yet).
    about: { items: [], loaded: false, busy: false },
  };

  const MODE_TEXT = {
    one: { hint: "It goes live as soon as it's saved.", button: "Upload and Publish" },
    many: {
      // No batch size to reach and no maximum: two profiles publish the same
      // way twenty do. Say so, because the old wording ("add them all, then
      // press Publish All") read like the batch had to be finished first.
      hint: "Each profile is saved and waits — add as many as you like, there's no limit. Publish whenever you're ready, after two or after twenty: it's one deploy for everything waiting.",
      button: "Save and Add Another",
    },
  };

  class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }

  async function api(path, { method = "GET", body, raw, contentType } = {}) {
    const headers = { "x-rs-admin": "1" };
    let payload;
    if (raw) {
      payload = raw;
      headers["content-type"] = contentType;
    } else if (body !== undefined) {
      payload = JSON.stringify(body);
      headers["content-type"] = "application/json";
    }
    let res;
    try {
      res = await fetch(`/api/admin/${path}`, { method, headers, body: payload, credentials: "same-origin" });
    } catch {
      throw new ApiError("Couldn't reach the website. Check your internet connection and try again.", 0);
    }
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* empty or non-JSON body */
    }
    if (res.status === 401 && path !== "login") {
      showSignIn("Your session ended. Please sign in again.");
    }
    if (!res.ok) throw new ApiError(data.error || `The website answered with an error (${res.status}).`, res.status);
    return data;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  function announce(message) {
    const status = $("#status");
    status.textContent = "";
    // Re-set on the next frame so a repeated message is still announced.
    requestAnimationFrame(() => {
      status.textContent = message;
    });
  }

  function publishMessage(result, done) {
    if (!result.autoPublish) return `${done} It goes live on the next site deploy — automatic publishing isn't switched on yet.`;
    if (!result.triggered) return `${done} The site didn't start rebuilding, though — press Publish Now.`;
    return `${done} The site is rebuilding and will show it in about two minutes.`;
  }

  // -------------------------------------------------------------------------
  // Views
  // -------------------------------------------------------------------------

  function showSignIn(message = "") {
    state.session = null;
    $("#boot").hidden = true;
    $("#app").hidden = true;
    $("#nav").hidden = true;
    $("#signin").hidden = false;
    $("#signin-error").textContent = message;
    $("#password").value = "";
    $("#username").focus();
  }

  function showApp() {
    $("#boot").hidden = true;
    $("#signin").hidden = true;
    $("#app").hidden = false;
    $("#nav").hidden = false;
    renderNotices();
    loadShoots();
  }

  function renderNotices() {
    const box = $("#notices");
    box.textContent = "";
    const add = (text) => {
      const p = document.createElement("p");
      p.className = "notice";
      p.textContent = text;
      box.append(p);
    };
    const s = state.session || {};
    if (s.starterPassword) {
      add("You're signed in with the starter password. Open Account and choose your own — after that, only you know it.");
    }
    if (s.passwordInNetlify) {
      add("Your password is currently set in Netlify's settings (ADMIN_PASSWORD_HASH), so it can't be changed here.");
    }
    if (s.autoPublish === false) {
      add("Automatic publishing isn't switched on yet, so changes you save wait for the next site deploy. Whoever manages the Netlify account needs to add a build hook (BUILD_HOOK_URL) — see the owner's guide.");
    }
  }

  async function refreshSession() {
    state.session = await api("session");
    return state.session;
  }

  // -------------------------------------------------------------------------
  // Sign in / out
  // -------------------------------------------------------------------------

  $("#signin-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter || event.target.querySelector("button");
    const username = $("#username").value.trim();
    const password = $("#password").value;
    if (!username || !password) {
      $("#signin-error").textContent = "Enter your username and password.";
      return;
    }
    button.disabled = true;
    $("#signin-error").textContent = "";
    try {
      await api("login", { method: "POST", body: { username, password } });
      await refreshSession();
      showApp();
    } catch (error) {
      $("#signin-error").textContent = error.message;
      $("#password").select();
    } finally {
      button.disabled = false;
    }
  });

  $("#sign-out").addEventListener("click", async () => {
    try {
      await api("logout", { method: "POST" });
    } catch {
      /* signing out locally anyway */
    }
    showSignIn("You're signed out.");
  });

  // -------------------------------------------------------------------------
  // Add a profile
  // -------------------------------------------------------------------------

  // "Dominic" + Senior -> "Dominic’s Senior Session"; + Family -> "Bundy Family".
  // Profile cards still show just the name (subjectName); this is the page title.
  function suggestTitle(name, category) {
    if (!name) return "";
    const possessive = /s$/i.test(name) ? `${name}’` : `${name}’s`;
    if (category === "senior") return `${possessive} Senior Session`;
    if (category === "family") return /family$/i.test(name) ? name : `${name} Family`;
    return name;
  }

  function updateTitle() {
    if (state.titleTouched) return;
    $("#title").value = suggestTitle($("#subject").value.trim(), $("#category").value);
  }

  $("#subject").addEventListener("input", updateTitle);
  $("#category").addEventListener("change", updateTitle);
  $("#category").addEventListener("change", showCategoryView);
  $("#title").addEventListener("input", (event) => {
    state.titleTouched = event.target.value.trim() !== "";
  });

  function addFiles(fileList) {
    const known = new Set(state.files.map((item) => item.key));
    let skipped = 0;
    for (const file of fileList) {
      const looksLikePhoto = file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
      if (!looksLikePhoto) {
        skipped++;
        continue;
      }
      const key = `${file.name}|${file.size}|${file.lastModified}`;
      if (known.has(key)) continue;
      known.add(key);
      state.files.push({ key, file, url: URL.createObjectURL(file) });
    }
    renderThumbs();
    if (skipped) $("#add-error").textContent = `${plural(skipped, "file")} skipped — only photos can be added.`;
  }

  function renderThumbs() {
    const list = $("#thumbs");
    list.textContent = "";
    state.files.forEach((item, index) => {
      const li = document.createElement("li");

      const frame = document.createElement("div");
      frame.className = "frame";
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.file.name;
      img.loading = "lazy";
      img.decoding = "async";
      frame.append(img);
      if (index === 0) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "Cover";
        frame.append(badge);
      }

      const name = document.createElement("p");
      name.className = "name";
      name.textContent = item.file.name;

      const row = document.createElement("div");
      row.className = "row";
      if (index > 0) {
        const cover = document.createElement("button");
        cover.type = "button";
        cover.className = "btn btn-quiet";
        cover.textContent = "Make Cover";
        cover.dataset.action = "cover";
        cover.dataset.index = String(index);
        cover.setAttribute("aria-label", `Make ${item.file.name} the cover`);
        row.append(cover);
      }
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-danger";
      remove.textContent = "Remove";
      remove.dataset.action = "remove";
      remove.dataset.index = String(index);
      remove.setAttribute("aria-label", `Remove ${item.file.name}`);
      row.append(remove);

      li.append(frame, name, row);
      list.append(li);
    });
    $("#photo-count").textContent = state.files.length ? `${plural(state.files.length, "photo")} selected.` : "";
  }

  $("#thumbs").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || state.busy) return;
    const index = Number(button.dataset.index);
    if (button.dataset.action === "remove") {
      const [removed] = state.files.splice(index, 1);
      URL.revokeObjectURL(removed.url);
    } else if (button.dataset.action === "cover") {
      const [picked] = state.files.splice(index, 1);
      state.files.unshift(picked);
    }
    renderThumbs();
  });

  $("#photos").addEventListener("change", (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  });

  const dropzone = $("#dropzone");
  ["dragenter", "dragover"].forEach((type) =>
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-over");
    })
  );
  ["dragleave", "drop"].forEach((type) =>
    dropzone.addEventListener(type, () => dropzone.classList.remove("is-over"))
  );
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    if (!state.busy && event.dataTransfer?.files) addFiles(event.dataTransfer.files);
  });

  /** Decode, shrink to 2400px on the long edge, re-encode as JPEG. Also strips EXIF (incl. GPS). */
  async function toJpeg(file) {
    let source;
    try {
      source = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      source = await loadImage(file);
    }
    const width = source.naturalWidth || source.width;
    const height = source.naturalHeight || source.height;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    if (typeof source.close === "function") source.close();

    for (const quality of [0.86, 0.78, 0.7, 0.6]) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_BYTES) return blob;
    }
    throw new Error("too large even after shrinking");
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("this browser can't read it — if it's an iPhone HEIC photo, export it as JPG first"));
      img.src = URL.createObjectURL(file);
    });
  }

  async function uploadPhoto(blob, draft) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await api(`photos?draft=${draft}`, { method: "POST", raw: blob, contentType: "image/jpeg" });
      } catch (error) {
        const final = attempt >= 2 || [401, 413, 415].includes(error.status);
        if (final) throw error;
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  function setBusy(busy) {
    state.busy = busy;
    document.querySelectorAll("#add-form input, #add-form select, #add-form textarea, #add-form button").forEach((el) => {
      el.disabled = busy;
    });
    $("#progress-wrap").hidden = !busy;
    // The batch button lives inside the form, so the loop above disabled it
    // too. Re-derive its own state: an upload in flight keeps it off, and
    // finishing one must not switch it on when nothing is waiting.
    renderBatch();
  }

  function setProgress(done, total, text) {
    $("#progress").value = total ? Math.round((done / total) * 100) : 0;
    $("#progress-text").textContent = text;
  }

  function setMode(mode) {
    state.mode = mode;
    $("#mode-hint").textContent = MODE_TEXT[mode].hint;
    $("#add-submit").textContent = MODE_TEXT[mode].button;
    renderBatch();
  }

  /**
   * The publish control under the form. Present the whole time Several
   * Profiles is selected — including before anything is waiting, so it is
   * never a button that appears out of nowhere — and disabled until there is
   * something to send.
   */
  function renderBatch() {
    const box = $("#batch");
    const many = state.mode === "many";
    box.hidden = !many;
    if (!many) return;
    const count = state.pending;
    $("#batch-text").textContent = count
      ? `${plural(count, "profile")} waiting to go live. Publish now, or add more first — either is fine.`
      : "Nothing waiting yet. Save a profile above and it collects here until you publish.";
    $("#publish-batch").disabled = count === 0 || state.busy;
  }

  document.querySelectorAll('input[name="mode"]').forEach((radio) =>
    radio.addEventListener("change", (event) => setMode(event.target.value))
  );

  function resetForm() {
    $("#add-form").reset();
    // reset() puts the radios back to "One Profile"; keep the chosen mode.
    document.querySelector(`input[name="mode"][value="${state.mode}"]`).checked = true;
    state.files.forEach((item) => URL.revokeObjectURL(item.url));
    state.files = [];
    state.titleTouched = false;
    renderThumbs();
  }

  $("#add-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.busy) return;
    const error = $("#add-error");
    error.textContent = "";

    const subjectName = $("#subject").value.trim();
    const category = $("#category").value;
    if (category === "about") return;
    const title = $("#title").value.trim() || suggestTitle(subjectName, category);
    const description = $("#description").value.trim();

    if (!subjectName) return void ((error.textContent = "Add the person's or family's name."), $("#subject").focus());
    if (!category) return void ((error.textContent = "Pick a category."), $("#category").focus());
    if (!state.files.length) return void ((error.textContent = "Add at least one photo."), $("#photos").focus());

    setBusy(true);
    const draft = crypto.randomUUID();
    const items = state.files.slice();
    const total = items.length;
    const uploaded = new Array(total);
    const failures = [];
    let done = 0;
    let next = 0;
    setProgress(0, total, `Uploading photos: 0 of ${total}`);

    async function worker() {
      while (next < total) {
        const i = next++;
        try {
          const jpeg = await toJpeg(items[i].file);
          uploaded[i] = (await uploadPhoto(jpeg, draft)).src;
        } catch (err) {
          if (err.status === 401) throw err;
          failures.push(`${items[i].file.name} (${err.message})`);
        }
        done++;
        setProgress(done, total, `Uploading photos: ${done} of ${total}`);
      }
    }

    try {
      await Promise.all(Array.from({ length: Math.min(UPLOADS_AT_ONCE, total) }, worker));
      const photos = uploaded.filter(Boolean);

      if (failures.length) {
        if (!photos.length) throw new ApiError(`None of the photos could be uploaded: ${failures.join("; ")}`);
        const goOn = window.confirm(
          `${plural(failures.length, "photo")} couldn't be uploaded:\n\n${failures.join("\n")}\n\nPublish the other ${plural(photos.length, "photo")} anyway?`
        );
        if (!goOn) throw new ApiError("Nothing was published. Remove the photos that failed and try again.");
      }

      setProgress(total, total, "Saving the profile…");
      const publish = state.mode === "one";
      const result = await api("shoots", { method: "POST", body: { title, category, subjectName, description, photos, publish } });
      resetForm();
      announce(
        result.queued
          ? `“${title}” is saved and waiting. Add the next one, or press Publish All Now below whenever you want these live.`
          : publishMessage(result, `“${title}” is saved.`)
      );
      await loadShoots();
      if (!publish) $("#subject").focus();
    } catch (err) {
      if (err.status !== 401) error.textContent = err.message;
    } finally {
      setBusy(false);
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (state.busy || state.about.busy) event.preventDefault();
  });

  // -------------------------------------------------------------------------
  // About Me photos — the "About Me" category swaps the profile form for the
  // list of photos of Ryan on the About page.
  // -------------------------------------------------------------------------

  const fileName = (src) => decodeURIComponent(src.split("/").pop() || src);

  function showCategoryView() {
    const about = $("#category").value === "about";
    $("#profile-fields").hidden = about;
    $("#about-panel").hidden = !about;
    $("#add-title").textContent = about ? "About Me Photos" : "Add a Profile";
    $("#add-hint").textContent = about
      ? "The photos of you on the About page."
      : "Pick a category, name it after the person or family, add the photos. It publishes by itself.";
    if (about && !state.about.loaded) loadAbout();
  }

  async function loadAbout() {
    $("#about-error").textContent = "";
    try {
      const { photos } = await api("about");
      state.about.items = photos.map((src) => ({ src, name: fileName(src) }));
      state.about.loaded = true;
      renderAbout();
    } catch (error) {
      if (error.status !== 401) $("#about-error").textContent = error.message;
    }
  }

  function renderAbout() {
    const list = $("#about-thumbs");
    list.textContent = "";
    const { items } = state.about;
    $("#about-empty").hidden = items.length > 0;

    items.forEach((item, index) => {
      const li = document.createElement("li");

      const frame = document.createElement("div");
      frame.className = "frame";
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      if (item.url) img.src = item.url;
      else setThumb(img, item.src);
      frame.append(img);
      if (index === 0) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "Leads";
        frame.append(badge);
      }

      const name = document.createElement("p");
      name.className = "name";
      name.textContent = item.file ? `${item.name} (new)` : item.name;

      const row = document.createElement("div");
      row.className = "row";
      const make = (label, className, action, aria) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `btn ${className}`;
        b.textContent = label;
        b.dataset.action = action;
        b.dataset.index = String(index);
        b.setAttribute("aria-label", `${aria} ${item.name}`);
        return b;
      };
      if (index > 0) row.append(make("Make First", "btn-quiet", "first", "Make"));
      row.append(make("Remove", "btn-danger", "remove", "Remove"));

      li.append(frame, name, row);
      list.append(li);
    });
  }

  function markAboutChanged() {
    $("#about-note").textContent = "You have changes that aren't live yet — press Save and Publish.";
    renderAbout();
  }

  $("#about-thumbs").addEventListener("click", (event) => {
    const b = event.target.closest("button[data-action]");
    if (!b || state.about.busy) return;
    const { items } = state.about;
    const index = Number(b.dataset.index);
    if (b.dataset.action === "remove") {
      const [removed] = items.splice(index, 1);
      if (removed.url) URL.revokeObjectURL(removed.url);
    } else if (b.dataset.action === "first") {
      items.unshift(...items.splice(index, 1));
    }
    markAboutChanged();
  });

  function addAboutFiles(fileList) {
    const { items } = state.about;
    const known = new Set(items.filter((item) => item.file).map((item) => item.key));
    let skipped = 0;
    for (const file of fileList) {
      if (!(file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name))) {
        skipped++;
        continue;
      }
      const key = `${file.name}|${file.size}|${file.lastModified}`;
      if (known.has(key)) continue;
      known.add(key);
      items.push({ key, file, name: file.name, url: URL.createObjectURL(file) });
    }
    $("#about-error").textContent = skipped ? `${plural(skipped, "file")} skipped — only photos can be added.` : "";
    markAboutChanged();
  }

  $("#about-photos").addEventListener("change", (event) => {
    addAboutFiles(event.target.files);
    event.target.value = "";
  });

  const aboutDrop = $("#about-dropzone");
  ["dragenter", "dragover"].forEach((type) =>
    aboutDrop.addEventListener(type, (event) => {
      event.preventDefault();
      aboutDrop.classList.add("is-over");
    })
  );
  ["dragleave", "drop"].forEach((type) =>
    aboutDrop.addEventListener(type, () => aboutDrop.classList.remove("is-over"))
  );
  aboutDrop.addEventListener("drop", (event) => {
    event.preventDefault();
    if (!state.about.busy && event.dataTransfer?.files) addAboutFiles(event.dataTransfer.files);
  });

  function setAboutBusy(busy) {
    state.about.busy = busy;
    document.querySelectorAll("#about-panel input, #about-panel button").forEach((el) => {
      el.disabled = busy;
    });
    $("#category").disabled = busy;
    $("#about-progress-wrap").hidden = !busy;
  }

  $("#about-save").addEventListener("click", async () => {
    if (state.about.busy) return;
    const error = $("#about-error");
    error.textContent = "";
    const items = state.about.items.slice();
    // A photo uploaded by an earlier, failed save already has its src.
    const fresh = items.filter((item) => item.file && !item.src);

    if (!items.length && !window.confirm("Remove every photo? The About page will show a “photo coming soon” box until you add one.")) {
      return;
    }

    setAboutBusy(true);
    const draft = crypto.randomUUID();
    const failures = [];
    let done = 0;
    let next = 0;
    const setAboutProgress = (text) => {
      $("#about-progress").value = fresh.length ? Math.round((done / fresh.length) * 100) : 100;
      $("#about-progress-text").textContent = text;
    };
    if (fresh.length) setAboutProgress(`Uploading photos: 0 of ${fresh.length}`);

    async function worker() {
      while (next < fresh.length) {
        const item = fresh[next++];
        try {
          item.src = (await uploadPhoto(await toJpeg(item.file), draft)).src;
        } catch (err) {
          if (err.status === 401) throw err;
          failures.push(`${item.name} (${err.message})`);
        }
        done++;
        setAboutProgress(`Uploading photos: ${done} of ${fresh.length}`);
      }
    }

    try {
      await Promise.all(Array.from({ length: Math.min(UPLOADS_AT_ONCE, fresh.length) }, worker));
      const photos = items.map((item) => item.src).filter(Boolean);

      if (failures.length) {
        const goOn =
          photos.length > 0 &&
          window.confirm(
            `${plural(failures.length, "photo")} couldn't be uploaded:\n\n${failures.join("\n")}\n\nSave the other ${plural(photos.length, "photo")} anyway?`
          );
        if (!goOn) throw new ApiError(`Nothing was saved. ${failures.join("; ")}`);
      }

      setAboutProgress("Saving…");
      const result = await api("about", { method: "PUT", body: { photos } });
      state.about.items.forEach((item) => item.url && URL.revokeObjectURL(item.url));
      state.about.items = result.photos.map((src) => ({ src, name: fileName(src) }));
      $("#about-note").textContent = "";
      renderAbout();
      announce(publishMessage(result, "Your About Me photos are saved."));
    } catch (err) {
      if (err.status !== 401) error.textContent = err.message;
    } finally {
      setAboutBusy(false);
    }
  });

  // -------------------------------------------------------------------------
  // Profile list
  // -------------------------------------------------------------------------

  async function loadShoots() {
    const box = $("#shoots");
    box.setAttribute("aria-busy", "true");
    try {
      const { shoots, pendingCount } = await api("shoots");
      state.shoots = shoots;
      renderPending(pendingCount || 0);
      renderShoots();
    } catch (error) {
      if (error.status !== 401) {
        box.textContent = "";
        const p = document.createElement("p");
        p.className = "error";
        p.textContent = error.message;
        box.append(p);
      }
    } finally {
      box.setAttribute("aria-busy", "false");
    }
  }

  function button(label, className, action, shoot, aria) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn btn-small ${className}`;
    b.textContent = label;
    b.dataset.action = action;
    b.dataset.slug = shoot.slug;
    b.dataset.title = shoot.title;
    b.dataset.hidden = String(shoot.hidden);
    b.dataset.count = String(shoot.photoCount);
    b.setAttribute("aria-label", `${aria} ${shoot.title}`);
    return b;
  }

  function renderPending(count) {
    state.pending = count;
    $("#pending").hidden = count === 0;
    $("#pending-text").textContent = `${plural(count, "profile")} waiting to go live.`;
    renderBatch();
  }

  /** Small square thumbnail from the Image CDN; falls back to the original once. */
  function setThumb(img, src) {
    img.src = `/.netlify/images?url=${encodeURIComponent(src)}&w=128&h=128&fit=cover&q=70`;
    img.addEventListener("error", () => { img.src = src; }, { once: true });
  }

  const normalize = (text) => text.normalize("NFKD").replace(/[^\w\s]/g, "").toLowerCase().trim();

  function renderShoots() {
    const box = $("#shoots");
    box.textContent = "";
    const query = normalize($("#shoot-search").value);
    const all = state.shoots;
    const shoots = query
      ? all.filter((shoot) => normalize(`${shoot.title} ${shoot.subjectName}`).includes(query))
      : all;
    $("#search-empty").hidden = !(query && all.length && !shoots.length);
    if (!all.length) {
      const p = document.createElement("p");
      p.className = "hint";
      p.textContent = "No profiles yet. Add one above.";
      box.append(p);
      return;
    }
    for (const category of CATEGORY_ORDER) {
      const group = shoots.filter((shoot) => shoot.category === category);
      if (!group.length) continue;
      const heading = document.createElement("h3");
      heading.textContent = CATEGORY_LABELS[category];
      const list = document.createElement("ul");
      list.className = "shoot-list";

      for (const shoot of group) {
        const li = document.createElement("li");
        li.className = `shoot${shoot.hidden ? " is-hidden" : ""}`;

        const img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        if (shoot.cover) setThumb(img, shoot.cover);

        const text = document.createElement("div");
        text.className = "text";
        const title = document.createElement("p");
        title.className = "title";
        title.textContent = shoot.title;
        const meta = document.createElement("p");
        meta.className = "meta";
        meta.append(`${plural(shoot.photoCount, "photo")} · `);
        const tag = document.createElement("span");
        tag.textContent = shoot.hidden ? "Hidden" : shoot.pending ? "Waiting to go live" : "Live";
        if (shoot.hidden) tag.className = "hidden-tag";
        else if (shoot.pending) tag.className = "pending-tag";
        meta.append(tag);
        text.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "actions";
        if (!shoot.hidden && !shoot.pending) {
          const view = document.createElement("a");
          view.className = "btn btn-small btn-quiet";
          view.href = shoot.url;
          view.target = "_blank";
          view.rel = "noopener";
          view.textContent = "View";
          view.setAttribute("aria-label", `View ${shoot.title} on the site`);
          actions.append(view);
        }
        actions.append(
          shoot.hidden
            ? button("Unhide", "btn-quiet", "toggle", shoot, "Unhide")
            : button("Hide", "btn-quiet", "toggle", shoot, "Hide"),
          button("Delete", "btn-danger", "delete", shoot, "Delete")
        );

        li.append(img, text, actions);
        list.append(li);
      }
      box.append(heading, list);
    }
  }

  $("#shoots").addEventListener("click", async (event) => {
    const b = event.target.closest("button[data-action]");
    if (!b) return;
    const { action, slug, title } = b.dataset;
    const hidden = b.dataset.hidden === "true";
    const count = Number(b.dataset.count);

    if (action === "delete") {
      const sure = window.confirm(
        `Delete “${title}” and its ${plural(count, "photo")} from the website?\n\nThis can't be undone. (Hide keeps it and lets you bring it back later.)`
      );
      if (!sure) return;
    }

    b.disabled = true;
    try {
      if (action === "toggle") {
        const result = await api(`shoots/${encodeURIComponent(slug)}`, { method: "PATCH", body: { hidden: !hidden } });
        announce(publishMessage(result, hidden ? `“${title}” is back on the site.` : `“${title}” is hidden.`));
      } else if (action === "delete") {
        const result = await api(`shoots/${encodeURIComponent(slug)}`, { method: "DELETE" });
        announce(publishMessage(result, `“${title}” is deleted.`));
      }
      await loadShoots();
    } catch (error) {
      if (error.status !== 401) announce(error.message);
      b.disabled = false;
    }
  });

  $("#shoot-search").addEventListener("input", () => renderShoots());

  async function publishEverything(event) {
    const b = event.currentTarget;
    b.disabled = true;
    try {
      const result = await api("publish", { method: "POST" });
      await loadShoots();
      announce(
        !result.autoPublish
          ? "Automatic publishing isn't switched on yet — see the notice above."
          : result.triggered
            ? "The site is rebuilding. Changes show in about two minutes."
            : "The rebuild didn't start. Try again in a minute."
      );
    } catch (error) {
      if (error.status !== 401) announce(error.message);
    } finally {
      b.disabled = false;
      // b is one of three publish buttons; the batch one has its own rule
      // (off when nothing is waiting), so let it re-derive rather than
      // inheriting the blanket re-enable above.
      renderBatch();
    }
  }

  $("#publish-now").addEventListener("click", publishEverything);
  $("#publish-all").addEventListener("click", publishEverything);
  $("#publish-batch").addEventListener("click", publishEverything);

  // -------------------------------------------------------------------------
  // Account
  // -------------------------------------------------------------------------

  const dialog = $("#account");

  $("#account-open").addEventListener("click", () => {
    $("#account-form").reset();
    $("#account-error").textContent = "";
    $("#new-username").value = state.session?.username || "";
    dialog.showModal();
    $("#current-password").focus();
  });

  $("#account-cancel").addEventListener("click", () => dialog.close());

  $("#account-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = $("#account-error");
    const currentPassword = $("#current-password").value;
    const username = $("#new-username").value.trim();
    const newPassword = $("#new-password").value;
    if (!currentPassword || !username || !newPassword) return void (error.textContent = "Fill in every box.");
    if (newPassword.length < 10) return void (error.textContent = "Use at least 10 characters for the new password.");
    if (newPassword !== $("#confirm-password").value) return void (error.textContent = "The two new passwords don't match.");

    const submit = event.submitter;
    if (submit) submit.disabled = true;
    try {
      await api("account", { method: "POST", body: { currentPassword, username, newPassword } });
      dialog.close();
      await refreshSession();
      renderNotices();
      announce("Saved. Use your new password from now on — any other signed-in device has been signed out.");
    } catch (err) {
      if (err.status !== 401) error.textContent = err.message;
      else dialog.close();
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  // -------------------------------------------------------------------------

  (async () => {
    try {
      const session = await refreshSession();
      if (session.signedIn) showApp();
      else showSignIn();
    } catch (error) {
      showSignIn(error.message);
    }
  })();
})();
