// Motion for the story layout. Everything here is decoration: the page reads fine without it.
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Split role titles into letters so they can rise in one by one
  document.querySelectorAll(".role-text h2").forEach(function (h) {
    var t = h.textContent; h.setAttribute("aria-label", t); h.textContent = "";
    Array.from(t).forEach(function (c, i) {
      var s = document.createElement("span"); s.className = "ch"; s.setAttribute("aria-hidden", "true");
      s.textContent = c === " " ? " " : c; s.style.transitionDelay = (0.15 + i * 0.05) + "s";
      h.appendChild(s);
    });
  });

  // Split the statement into words; the five roles are marked in red
  var statement = document.querySelector("[data-words]");
  var words = [];
  if (statement) {
    var roles = (statement.dataset.roles || "").toLowerCase().split(",");
    var txt = statement.textContent.trim(); statement.textContent = "";
    txt.split(/\s+/).forEach(function (w, i, a) {
      var s = document.createElement("span"); s.className = "w"; s.textContent = w;
      var bare = w.toLowerCase().replace(/[^\p{L}]/gu, "");
      if (roles.indexOf(bare) > -1) s.classList.add("role");
      statement.appendChild(s);
      if (i < a.length - 1) statement.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }

  // Reveal things as they scroll into view
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal, .role-art, .role-text").forEach(function (el) {
    if (reduce) el.classList.add("in"); else io.observe(el);
  });
  // The hero is visible straight away
  requestAnimationFrame(function () { document.querySelectorAll(".s-hero .reveal").forEach(function (el) { el.classList.add("in"); }); });

  if (reduce) { words.forEach(function (w) { w.classList.add("lit"); }); return; }

  // Scroll-driven effects: statement lights up word by word, paintings drift (parallax)
  var parallax = Array.from(document.querySelectorAll(".parallax img, .s-close-bg img"));
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      if (statement) {
        var r = statement.getBoundingClientRect();
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        var n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
        words.forEach(function (w, i) { w.classList.toggle("lit", i < n); });
      }
      parallax.forEach(function (img) {
        var b = img.parentElement.getBoundingClientRect();
        if (b.bottom < 0 || b.top > vh) return;
        var c = (b.top + b.height / 2 - vh / 2) / vh; // -1..1 around the centre
        img.style.transform = "translate3d(0," + (c * -6).toFixed(2) + "%,0)";
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // The book tilts gently towards the pointer
  var book = document.querySelector(".s-book .tilt");
  var hero = document.querySelector(".s-hero");
  if (book && hero && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      book.style.transform = "rotateY(" + (x * 14).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg)";
    });
    hero.addEventListener("pointerleave", function () { book.style.transform = ""; });
  }

  // Living portrait: the four takes cross-fade while it is on screen
  var witness = document.querySelector(".witness");
  if (witness) {
    var imgs = witness.querySelectorAll("img"), k = 0, timer = null;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !timer) {
          timer = setInterval(function () { imgs[k].classList.remove("on"); k = (k + 1) % imgs.length; imgs[k].classList.add("on"); }, 3200);
        } else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
      });
    }, { threshold: 0.3 }).observe(witness);
  }

  // Embers rising over the ruined city
  var canvas = document.querySelector(".embers");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, parts = [], running = true;
    function size() { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn(initial) {
      return { x: Math.random() * W, y: initial ? Math.random() * H : H + 10, r: Math.random() * 1.8 + 0.4,
               vy: Math.random() * 0.5 + 0.25, vx: (Math.random() - 0.5) * 0.25, life: Math.random() * Math.PI * 2,
               hue: 10 + Math.random() * 30 };
    }
    size(); window.addEventListener("resize", size);
    var count = W < 700 ? 34 : 70;
    for (var i = 0; i < count; i++) parts.push(spawn(true));
    new IntersectionObserver(function (es) { running = es[0].isIntersecting; if (running) loop(); }).observe(canvas);
    function loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p, i) {
        p.life += 0.02; p.y -= p.vy; p.x += p.vx + Math.sin(p.life) * 0.25;
        var a = Math.max(0, Math.min(1, p.y / H)) * (0.55 + Math.sin(p.life * 2) * 0.35);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + p.hue + ",95%,62%," + a.toFixed(3) + ")";
        ctx.shadowColor = "hsla(" + p.hue + ",100%,55%,0.9)"; ctx.shadowBlur = 8;
        ctx.fill();
        if (p.y < -10) parts[i] = spawn(false);
      });
      requestAnimationFrame(loop);
    }
  }
})();
