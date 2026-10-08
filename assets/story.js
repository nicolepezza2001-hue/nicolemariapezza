// Gentle fade-ins, and the five roles shown one at a time as a carousel.
// The page works fully without this script (the roles then show as a row).
(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Roles carousel ----------
  var section = document.querySelector(".roles");
  if (!section) return;
  var row = section.querySelector(".role-row");
  var slides = Array.prototype.slice.call(row.querySelectorAll(".role"));
  if (slides.length < 2) return;

  var MS = 6500, i = 0, timer = null, inView = false, hovering = false;
  section.classList.add("is-carousel");
  section.style.setProperty("--role-ms", MS + "ms");
  row.setAttribute("aria-live", "polite");
  slides.forEach(function (s) { s.classList.add("in"); });

  var nav = document.createElement("div"); nav.className = "role-nav";
  var prev = document.createElement("button"); prev.className = "arrow"; prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.textContent = "‹";
  var next = document.createElement("button"); next.className = "arrow"; next.type = "button"; next.setAttribute("aria-label", "Next"); next.textContent = "›";
  nav.appendChild(prev);
  var dots = slides.map(function (s, k) {
    var b = document.createElement("button"); b.className = "dot"; b.type = "button";
    var title = s.querySelector("h3"); b.textContent = s.querySelector(".num").textContent;
    b.setAttribute("aria-label", title ? title.textContent : String(k + 1));
    b.addEventListener("click", function () { go(k, true); });
    nav.appendChild(b); return b;
  });
  nav.appendChild(next);
  row.parentNode.insertBefore(nav, row.nextSibling);

  function show(k) {
    i = (k + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle("is-active", n === i); s.setAttribute("aria-hidden", n === i ? "false" : "true"); });
    dots.forEach(function (d, n) {
      d.removeAttribute("aria-current");
      if (n === i) { void d.offsetWidth; d.setAttribute("aria-current", "true"); }
    });
  }
  function schedule() {
    clearTimeout(timer);
    var paused = reduce || !inView || hovering || document.hidden;
    section.classList.toggle("paused", paused);
    if (!paused) timer = setTimeout(function () { show(i + 1); schedule(); }, MS);
  }
  function go(k) { show(k); schedule(); }

  prev.addEventListener("click", function () { go(i - 1); });
  next.addEventListener("click", function () { go(i + 1); });
  row.addEventListener("mouseenter", function () { hovering = true; schedule(); });
  row.addEventListener("mouseleave", function () { hovering = false; schedule(); });
  document.addEventListener("visibilitychange", schedule);

  // swipe on phones
  var x0 = null;
  row.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  row.addEventListener("touchend", function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; schedule(); }, { threshold: 0.4 }).observe(row);
  } else { inView = true; }
  show(0); schedule();
})();
