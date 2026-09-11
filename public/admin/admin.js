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

  const state = { session: null, files: [], titleTouched: false, busy: false };

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
  }

  function setProgress(done, total, text) {
    $("#progress").value = total ? Math.round((done / total) * 100) : 0;
    $("#progress-text").textContent = text;
  }

  function resetForm() {
    $("#add-form").reset();
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
      const result = await api("shoots", { method: "POST", body: { title, category, subjectName, description, photos } });
      resetForm();
      announce(publishMessage(result, `“${title}” is saved.`));
      loadShoots();
    } catch (err) {
      if (err.status !== 401) error.textContent = err.message;
    } finally {
      setBusy(false);
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (state.busy) event.preventDefault();
  });

  // -------------------------------------------------------------------------
  // Profile list
  // -------------------------------------------------------------------------

  async function loadShoots() {
    const box = $("#shoots");
    box.setAttribute("aria-busy", "true");
    try {
      const { shoots } = await api("shoots");
      renderShoots(shoots);
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

  function renderShoots(shoots) {
    const box = $("#shoots");
    box.textContent = "";
    if (!shoots.length) {
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
        if (shoot.cover) img.src = shoot.cover;

        const text = document.createElement("div");
        text.className = "text";
        const title = document.createElement("p");
        title.className = "title";
        title.textContent = shoot.title;
        const meta = document.createElement("p");
        meta.className = "meta";
        meta.append(`${plural(shoot.photoCount, "photo")} · `);
        const tag = document.createElement("span");
        tag.textContent = shoot.hidden ? "Hidden" : "Live";
        if (shoot.hidden) tag.className = "hidden-tag";
        meta.append(tag);
        text.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "actions";
        if (!shoot.hidden) {
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

  $("#publish-now").addEventListener("click", async (event) => {
    const b = event.currentTarget;
    b.disabled = true;
    try {
      const result = await api("publish", { method: "POST" });
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
    }
  });

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
