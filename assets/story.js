// Gentle fade-ins and the "Keep reading" toggle. The page works fully without this script.
(function () {
  document.documentElement.classList.add("js");

  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  var excerpt = document.querySelector(".excerpt");
  if (excerpt) {
    var btn = excerpt.querySelector(".excerpt-more button");
    var more = btn.textContent;
    btn.addEventListener("click", function () {
      var open = excerpt.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? btn.dataset.less : more;
      if (!open) excerpt.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
})();
