(function () {
  var groupsData = window.prayerGroups;
  if (!groupsData || !Array.isArray(groupsData.groups)) return;

  var groups = groupsData.groups;
  var activeIndex = 0;
  var opener = null;
  var previousOverflow = "";
  var transitionId = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var style = document.createElement("style");
  style.textContent = `
    .prayer-groups-trigger {
      display: block;
      width: 100%;
      min-height: 48px;
      margin-top: 14px;
      padding: 10px 16px;
      border: 1.5px solid #2e7d32;
      border-bottom: 2px solid #b8860b;
      border-radius: 12px;
      background: #fffdf8;
      color: #1b5e20 !important;
      -webkit-text-fill-color: #1b5e20;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.4;
      text-align: center;
      text-indent: 0;
      opacity: 1;
      cursor: pointer;
      touch-action: manipulation;
    }
    .prayer-groups-trigger:focus-visible,
    .prayer-groups-sheet button:focus-visible {
      outline: 3px solid #b8860b;
      outline-offset: 2px;
    }
    .prayer-groups-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      visibility: hidden;
      pointer-events: none;
    }
    .prayer-groups-overlay.is-open {
      visibility: visible;
      pointer-events: auto;
    }
    .prayer-groups-backdrop {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
      background: rgba(31, 47, 34, 0.28);
      opacity: 0;
      transition: opacity 220ms ease;
    }
    .prayer-groups-overlay.is-open .prayer-groups-backdrop {
      opacity: 1;
    }
    .prayer-groups-sheet {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      width: min(100%, 720px);
      height: 70vh;
      height: 70dvh;
      max-height: 85vh;
      padding: 8px 14px max(12px, env(safe-area-inset-bottom));
      overflow: hidden;
      border-top: 2px solid #b8860b;
      border-radius: 18px 18px 0 0;
      background: #fffdf8;
      color: #2d3748;
      box-shadow: 0 -8px 28px rgba(25, 42, 27, 0.18);
      transform: translateY(100%);
      transition: transform 260ms ease;
    }
    .prayer-groups-overlay.is-open .prayer-groups-sheet {
      transform: translateY(0);
    }
    .prayer-groups-handle {
      flex: 0 0 auto;
      width: 38px;
      height: 5px;
      margin: 1px auto 8px;
      border-radius: 99px;
      background: #c5b98f;
      touch-action: none;
      cursor: grab;
    }
    .prayer-groups-header {
      position: relative;
      flex: 0 0 auto;
      padding: 0 38px 9px 0;
      color: #596651;
      font-size: 0.82rem;
      line-height: 1.5;
    }
    .prayer-groups-close {
      position: absolute;
      top: -3px;
      right: 0;
      width: 40px;
      height: 40px;
      border: 1px solid rgba(184, 134, 11, 0.4);
      border-radius: 50%;
      background: transparent;
      color: #1b5e20;
      font: inherit;
      font-size: 1.15rem;
      cursor: pointer;
    }
    .prayer-groups-strip {
      display: flex;
      flex: 0 0 auto;
      gap: 8px;
      padding: 3px 2px 10px;
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .prayer-groups-strip::-webkit-scrollbar { display: none; }
    .prayer-groups-number {
      position: relative;
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 1px solid #2e7d32;
      border-radius: 50%;
      background: #fffdf8;
      color: #1b5e20;
      font: inherit;
      font-size: 0.9rem;
      cursor: pointer;
      scroll-snap-align: center;
    }
    .prayer-groups-number.is-selected {
      background: #2e7d32;
      color: #fffdf8;
    }
    .prayer-groups-navigation {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 1px 0 8px;
    }
    .prayer-groups-nav-button {
      width: 42px;
      height: 40px;
      border: 1px solid rgba(46, 125, 50, 0.45);
      border-radius: 10px;
      background: transparent;
      color: #1b5e20;
      font: inherit;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
    }
    .prayer-groups-nav-button:disabled {
      opacity: 0.38;
      cursor: default;
    }
    .prayer-groups-count {
      color: #687466;
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
    }
    .prayer-groups-card {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: 12px 14px;
      border: 1px solid rgba(46, 125, 50, 0.16);
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 2px 10px rgba(31, 47, 34, 0.06);
      overscroll-behavior: contain;
      opacity: 1;
      transform: translateX(0);
      transition: opacity 150ms ease, transform 150ms ease;
      touch-action: pan-y;
    }
    .prayer-groups-card.is-changing {
      opacity: 0;
      transform: translateX(8px);
    }
    .prayer-groups-title {
      margin: 0;
      color: #1b5e20;
      font-size: 1.18rem;
      font-weight: 700;
      line-height: 1.45;
    }
    .prayer-groups-rule {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 8px 0 10px;
      color: #b8860b;
      font-size: 0.85rem;
      line-height: 1;
    }
    .prayer-groups-rule::before,
    .prayer-groups-rule::after {
      height: 1px;
      flex: 1;
      background: rgba(184, 134, 11, 0.55);
      content: "";
    }
    .prayer-groups-people {
      margin: 0;
      color: #2d3748;
      font-size: 17px;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
    body.prayer-groups-open { overflow: hidden; }
    body.prayer-groups-open .scroll-top { visibility: hidden; }
    @media (prefers-reduced-motion: reduce) {
      .prayer-groups-backdrop,
      .prayer-groups-sheet,
      .prayer-groups-card { transition: none; }
    }
  `;
  document.head.appendChild(style);

  var overlay = document.createElement("div");
  overlay.className = "prayer-groups-overlay";
  overlay.innerHTML = `
    <button class="prayer-groups-backdrop" type="button" aria-label="დახურვა"></button>
    <section class="prayer-groups-sheet" role="dialog" aria-modal="true" aria-label="მოსახსენებელი" tabindex="-1">
      <div class="prayer-groups-handle" aria-hidden="true"></div>
      <div class="prayer-groups-header"></div>
      <button class="prayer-groups-close" type="button" aria-label="დახურვა">✕</button>
      <div class="prayer-groups-strip" aria-label="აირჩიეთ ჯგუფი"></div>
      <div class="prayer-groups-navigation">
        <button class="prayer-groups-nav-button" type="button" data-direction="-1" aria-label="წინა ჯგუფი">‹</button>
        <span class="prayer-groups-count"></span>
        <button class="prayer-groups-nav-button" type="button" data-direction="1" aria-label="შემდეგი ჯგუფი">›</button>
      </div>
      <article class="prayer-groups-card" aria-live="polite"></article>
    </section>
  `;
  document.body.appendChild(overlay);

  var sheet = overlay.querySelector(".prayer-groups-sheet");
  var header = overlay.querySelector(".prayer-groups-header");
  var strip = overlay.querySelector(".prayer-groups-strip");
  var card = overlay.querySelector(".prayer-groups-card");
  var counter = overlay.querySelector(".prayer-groups-count");
  var previousButton = overlay.querySelector('[data-direction="-1"]');
  var nextButton = overlay.querySelector('[data-direction="1"]');
  var closeButton = overlay.querySelector(".prayer-groups-close");
  var triggers = Array.from(document.querySelectorAll("[data-prayer-groups-trigger]"));
  if (!triggers.length) return;
  triggers.forEach(function (button) {
    button.classList.add("prayer-groups-trigger");
    button.textContent = "მოსახსენებელი";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
  });

  header.textContent = groupsData.header;
  var numberButtons = [];

  function centerNumberButton(index) {
    var button = numberButtons[index];
    if (!button) return;
    var behavior = reduceMotion.matches ? "auto" : "smooth";
    strip.scrollTo({
      left: button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2,
      behavior: behavior,
    });
  }

  function renderGroup(index, animate) {
    if (index < 0 || index >= groups.length) return;
    activeIndex = index;
    var group = groups[index];

    numberButtons.forEach(function (button, buttonIndex) {
      var selected = buttonIndex === activeIndex;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    counter.textContent = (index + 1) + " / " + groups.length;
    previousButton.disabled = index === 0;
    nextButton.disabled = index === groups.length - 1;

    var id = ++transitionId;
    if (animate && !reduceMotion.matches) card.classList.add("is-changing");

    function updateCard() {
      if (id !== transitionId) return;
      card.replaceChildren();

      var title = document.createElement("h2");
      title.className = "prayer-groups-title";
      title.textContent = group.number + " · " + group.name;
      card.appendChild(title);

      var rule = document.createElement("div");
      rule.className = "prayer-groups-rule";
      rule.setAttribute("aria-hidden", "true");
      rule.textContent = "✠";
      card.appendChild(rule);

      var people = document.createElement("p");
      people.className = "prayer-groups-people";
      people.textContent = group.people.join(" · ");
      card.appendChild(people);

      card.classList.remove("is-changing");
      centerNumberButton(index);
    }

    if (animate && !reduceMotion.matches) {
      window.setTimeout(updateCard, 120);
    } else {
      updateCard();
    }
  }

  groups.forEach(function (group, index) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "prayer-groups-number";
    button.textContent = String(group.number);
    button.dataset.number = String(group.number);
    button.setAttribute("aria-label", "ჯგუფი " + group.number + ": " + group.name);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", function () {
      renderGroup(index, true);
    });
    numberButtons.push(button);
    strip.appendChild(button);
  });

  function openSheet() {
    if (!groups.length) return;
    opener = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("prayer-groups-open");
    overlay.classList.add("is-open");
    opener.setAttribute("aria-expanded", "true");
    renderGroup(0, false);
    closeButton.focus();
  }

  function closeSheet() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    if (opener) opener.setAttribute("aria-expanded", "false");
    document.body.classList.remove("prayer-groups-open");
    document.body.style.overflow = previousOverflow;
    if (opener && typeof opener.focus === "function") opener.focus();
  }

  triggers.forEach(function (button) {
    button.addEventListener("click", openSheet);
  });
  closeButton.addEventListener("click", closeSheet);
  overlay.querySelector(".prayer-groups-backdrop").addEventListener("click", closeSheet);
  previousButton.addEventListener("click", function () { renderGroup(activeIndex - 1, true); });
  nextButton.addEventListener("click", function () { renderGroup(activeIndex + 1, true); });

  document.addEventListener("keydown", function (event) {
    if (!overlay.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeSheet();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      renderGroup(activeIndex - 1, true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      renderGroup(activeIndex + 1, true);
    } else if (event.key === "Tab") {
      var focusable = Array.from(sheet.querySelectorAll("button:not(:disabled)"));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  var handle = overlay.querySelector(".prayer-groups-handle");
  var handleStartY = null;
  handle.addEventListener("pointerdown", function (event) {
    handleStartY = event.clientY;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointerup", function (event) {
    if (handleStartY !== null && event.clientY - handleStartY > 50) closeSheet();
    handleStartY = null;
  });
  handle.addEventListener("pointercancel", function () { handleStartY = null; });

  var cardStart = null;
  card.addEventListener("pointerdown", function (event) {
    cardStart = { x: event.clientX, y: event.clientY };
  });
  card.addEventListener("pointerup", function (event) {
    if (!cardStart) return;
    var deltaX = event.clientX - cardStart.x;
    var deltaY = event.clientY - cardStart.y;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      renderGroup(activeIndex + (deltaX < 0 ? 1 : -1), true);
    }
    cardStart = null;
  });
  card.addEventListener("pointercancel", function () { cardStart = null; });
})();
