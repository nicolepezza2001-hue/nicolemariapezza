// Optional atmosphere: a few slow embers over the hero, and the book leaning towards the pointer.
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

  // Embers rising over the hero
  var c = document.createElement("canvas"); c.className = "fx-embers"; c.setAttribute("aria-hidden", "true");
  document.body.insertBefore(c, document.body.firstChild);
  var ctx = c.getContext("2d"); if (!ctx) return;
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W, H, parts = [], visible = true;
  function size() { W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(first) {
    return { x: Math.random() * W, y: first ? Math.random() * H : H + 10, r: Math.random() * 2.6 + 0.8,
             vy: Math.random() * 0.5 + 0.2, vx: (Math.random() - 0.5) * 0.2, t: Math.random() * 6.3, h: 12 + Math.random() * 26 };
  }
  size(); window.addEventListener("resize", size);
  for (var i = 0; i < (W < 700 ? 70 : 160); i++) parts.push(spawn(true));
  new IntersectionObserver(function (es) { var was = visible; visible = es[0].isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(c);
  function loop() {
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i]; p.t += 0.015; p.y -= p.vy; p.x += p.vx + Math.sin(p.t) * 0.2;
      var a = Math.max(0, Math.min(1, p.y / H)) * (0.65 + Math.sin(p.t * 2) * 0.3);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = "hsla(" + p.h + ",95%,62%," + a.toFixed(3) + ")";
      ctx.shadowColor = "hsla(" + p.h + ",100%,55%,.8)"; ctx.shadowBlur = 12; ctx.fill();
      if (p.y < -10) parts[i] = spawn(false);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
