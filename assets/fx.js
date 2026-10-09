// Optional atmosphere: embers drifting over the hero, and the book leaning towards the pointer.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Wrap the book image so it can tilt without fighting the float animation
  var img = document.querySelector(".hero-book img");
  if (img && !img.parentElement.classList.contains("tilt")) {
    var wrap = document.createElement("div"); wrap.className = "tilt";
    img.parentNode.insertBefore(wrap, img); wrap.appendChild(img);
  }
  var tilt = document.querySelector(".hero-book .tilt");
  var hero = document.querySelector(".hero");
  if (tilt && hero && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = "rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
    });
    hero.addEventListener("pointerleave", function () { tilt.style.transform = ""; });
  }


  // ---------- 1. The title writes itself ----------
  var h1 = document.querySelector(".hero-head h1");
  if (h1 && !h1.dataset.split) {
    var txt = h1.textContent; h1.dataset.split = "1"; h1.setAttribute("aria-label", txt); h1.textContent = "";
    var n = 0;
    txt.split(" ").forEach(function (word, wi, arr) {
      var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
      Array.from(word).forEach(function (c) { var ch = document.createElement("span"); ch.className = "ch"; ch.textContent = c; ch.style.setProperty("--i", n++); w.appendChild(ch); });
      h1.appendChild(w); if (wi < arr.length - 1) h1.appendChild(document.createTextNode(" "));
    });
  }

  // ---------- 2. The opening line lights up word by word ----------
  var teaser = document.querySelector(".reader .teaser"), tWords = [];
  if (teaser) {
    var tt = teaser.textContent.trim(); teaser.setAttribute("aria-label", tt); teaser.textContent = "";
    tt.split(/\s+/).forEach(function (wd, k, a) {
      var sp = document.createElement("span"); sp.className = "tw"; sp.setAttribute("aria-hidden", "true"); sp.textContent = wd;
      teaser.appendChild(sp); if (k < a.length - 1) teaser.appendChild(document.createTextNode(" ")); tWords.push(sp);
    });
  }

  // ---------- The opening line lights up as you scroll to it ----------
  var ticking = false;
  function onScroll() {
    if (ticking || !tWords.length) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false; var vh = innerHeight, r = teaser.getBoundingClientRect();
      var p = (vh * 0.88 - r.top) / (vh * 0.42);
      var k = Math.round(Math.max(0, Math.min(1, p)) * tWords.length);
      tWords.forEach(function (w, i) { w.classList.toggle("lit", i < k); });
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  // About section: arrive when scrolled to; on a computer the photo leans toward the cursor
  var about = document.querySelector(".about"), photo = about && about.querySelector(".portrait .photo");
  if (about) {
    new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { about.classList.add("in"); ob.disconnect(); } }, { threshold: 0.25 }).observe(about);
  }

  // The divider eye: its iris follows the cursor, and it blinks when touched
  document.querySelectorAll(".ornament svg").forEach(function (svg) {
    var iris = svg.querySelector(".iris");
    var eyeG = svg.querySelector(".eye");
    function blink() {
      if (!eyeG || !eyeG.animate) return;
      eyeG.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.06)", offset: .45 }, { transform: "scaleY(1)" }], { duration: 420, easing: "ease-in-out" });
    }
    var hasCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    // starts closed, opens slowly the first time it scrolls into view
    if (eyeG && "IntersectionObserver" in window) {
      eyeG.classList.add("closed");
      new IntersectionObserver(function (es, ob) {
        if (!es[0].isIntersecting) return; ob.disconnect();
        setTimeout(function () {
          eyeG.classList.remove("closed");
          if (eyeG.animate) eyeG.animate([{ transform: "scaleY(.06)" }, { transform: "scaleY(.35)", offset: .4 }, { transform: "scaleY(.3)", offset: .55 }, { transform: "scaleY(1)" }], { duration: 1600, easing: "ease-in-out" });
        }, 350);
      }, { threshold: 0.8 }).observe(svg);
    }
    // On phones the eye blinks (every few seconds, and when tapped); with a cursor it only watches
    if (!hasCursor) {
      (function every() { setTimeout(function () { blink(); setTimeout(blink, 520); every(); }, 3500 + Math.random() * 3000); })();
      svg.addEventListener("click", blink);
    }
    if (!iris) return;
    function look(x, y) {
      var r = svg.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      iris.style.transform = "translate(" + (dx / d * 3.6 * k).toFixed(2) + "px," + (dy / d * 1.5 * k).toFixed(2) + "px)";
    }
    // Only on devices with a real cursor; on phones the eye just blinks
    if (hasCursor) {
      addEventListener("pointermove", function (e) { look(e.clientX, e.clientY); }, { passive: true });
    }
  });

  // Embers: three depths, like drifting sparks filmed with a shallow focus.
  // Far: many tiny specks. Mid: brighter sparks with a short motion streak. Near: a few large, soft, out-of-focus glows.
  var c = document.createElement("canvas"); c.className = "fx-embers"; c.setAttribute("aria-hidden", "true");
  document.body.insertBefore(c, document.body.firstChild);
  var ctx = c.getContext("2d"); if (!ctx) return;
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, parts = [], visible = true, last = 0;
  var wind = 0, windT = Math.random() * 100;
  var LAYERS = [
    { share: 0.6,  r: [0.8, 1.7], speed: [0.3, 0.7],  alpha: [0.6, 1.0],  blur: 0,  streak: 0.8 },
    { share: 0.34, r: [1.6, 3.0], speed: [0.7, 1.5],  alpha: [0.8, 1.0],  blur: 0,  streak: 2.4 },
    { share: 0.06, r: [6, 13],    speed: [1.3, 2.4],  alpha: [0.55, 0.85], blur: 1, streak: 1.4 }
  ];
  function rnd(a) { return a[0] + Math.random() * (a[1] - a[0]); }
  function pick() { var x = Math.random(), acc = 0; for (var i = 0; i < LAYERS.length; i++) { acc += LAYERS[i].share; if (x <= acc) return LAYERS[i]; } return LAYERS[0]; }
  function spawn(first) {
    var L = pick();
    return { L: L, x: Math.random() * W, y: first ? Math.random() * H : H + 20 + Math.random() * 40,
             r: rnd(L.r), sp: rnd(L.speed), a: rnd(L.alpha), t: Math.random() * 6.3, f: 0.6 + Math.random() * 1.6,
             drift: (Math.random() - 0.3) * 0.6, hue: Math.random() < 0.12 ? 36 + Math.random() * 10 : 4 + Math.random() * 20 };
  }
  // The embers cover the page from the top down to the first star-eye divider, and stop there
  var depth = 0;
  function active() { return N; }
  function size() {
    var stop = document.querySelector(".ornament");
    var h = stop ? stop.getBoundingClientRect().top + scrollY + stop.offsetHeight / 2 : innerHeight;
    c.style.height = Math.round(h) + "px";
    W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); window.addEventListener("resize", size); window.addEventListener("load", size);
  if ("ResizeObserver" in window) new ResizeObserver(function () { size(); }).observe(document.body);
  new IntersectionObserver(function (es) { var was = visible; visible = es[0].isIntersecting; if (visible && !was) { last = 0; requestAnimationFrame(loop); } }).observe(c);
  var N = W < 700 ? 130 : 280;
  for (var i = 0; i < N; i++) parts.push(spawn(true));
  function loop(now) {
    if (!visible) return;
    var dt = last ? Math.min((now - last) / 16.7, 3) : 1; last = now;
    if (document.hidden) { requestAnimationFrame(loop); return; }
    windT += 0.004 * dt; wind = Math.sin(windT) * 0.6 + Math.sin(windT * 2.7) * 0.25;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    var on = active();
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], L = p.L;
      if (i >= on && p.dormant) continue;
      if (i >= on && (p.y < -30 || p.y > H + 60)) { p.dormant = true; continue; }
      if (i < on && p.dormant) { parts[i] = p = spawn(false); L = p.L; }
      p.t += 0.03 * p.f * dt;
      var vx = (p.drift + wind * (0.4 + p.sp * 0.5) + Math.sin(p.t * 0.7) * 0.35) * dt;
      var vy = -p.sp * dt;
      p.x += vx; p.y += vy;
      var fade = Math.max(0, Math.min(1, p.y / (H * 0.12), (H - p.y) / 160));
      var flick = 0.65 + Math.sin(p.t * 3.1) * 0.25 + Math.sin(p.t * 7.3) * 0.1;
      var a = p.a * fade * flick; if (a <= 0.01) { if (p.y < -30) parts[i] = spawn(false); continue; }
      var hue = p.hue - depth * 14, lit = (L.blur ? 55 : 62) - depth * 12;
      var col = "hsla(" + hue.toFixed(0) + ",100%," + lit.toFixed(0) + "%,";
      if (L.blur) {
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        g.addColorStop(0, col + (a * 0.9).toFixed(3) + ")"); g.addColorStop(0.45, col + (a * 0.45).toFixed(3) + ")"); g.addColorStop(1, col + "0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.2, 0, 6.283); ctx.fill();
      } else {
        // a short streak along the direction of travel, with a hot core
        var len = Math.max(0.01, Math.hypot(vx, vy)) , k = L.streak * p.r / len;
        ctx.strokeStyle = col + (a * 0.55).toFixed(3) + ")"; ctx.lineWidth = p.r * 1.6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.x - vx * k, p.y - vy * k); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = "hsla(" + (hue + 8).toFixed(0) + ",100%," + (64 - depth * 12).toFixed(0) + "%," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.75, 0, 6.283); ctx.fill();
      }
      if (p.y < -30 || p.x < -60 || p.x > W + 60) parts[i] = i < on ? spawn(false) : (p.dormant = true, p);
    }
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
