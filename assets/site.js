// Mailing-list signup: sends each email to Nicole's inbox via FormSubmit (formsubmit.co),
// then shows the thank-you overlay. To change where signups go, edit data-endpoint in the HTML.
(function () {
  var forms = document.querySelectorAll(".preorder");
  var thanks = document.querySelector(".thanks");
  if (!forms.length || !thanks) return;

  function closeThanks() { thanks.classList.remove("open"); }
  thanks.addEventListener("click", function (e) {
    if (e.target === thanks || e.target.closest(".close")) closeThanks();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeThanks(); });

  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button");
      var err = form.querySelector(".error");
      var data = new FormData(form);
      if (data.get("_honey")) return; // bot trap
      var email = String(data.get("email") || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = form.dataset.error;
        form.querySelector('input[type="email"]').focus();
        return;
      }
      btn.disabled = true;
      err.textContent = "";
      fetch(form.dataset.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email: email,
          language: document.documentElement.lang,
          _subject: "New message from \"nicolemariapezza.com\" (mailing list " + document.documentElement.lang.toUpperCase() + ")",
          _template: "table",
          _captcha: "false"
        })
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () { form.reset(); thanks.classList.add("open"); thanks.querySelector(".close").focus(); if (window.nmpTrack) nmpTrack("signup-" + document.documentElement.lang); })
        .catch(function () { err.textContent = form.dataset.error; })
        .finally(function () { btn.disabled = false; });
    });
  });
})();
