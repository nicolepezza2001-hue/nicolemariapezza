// Preorder signup: sends each email to Nicole's inbox via FormSubmit (formsubmit.co),
// then shows the thank-you overlay. To change where signups go, edit data-endpoint in the HTML.
(function () {
  var form = document.querySelector(".preorder");
  var thanks = document.querySelector(".thanks");
  if (!form || !thanks) return;

  function closeThanks() { thanks.classList.remove("open"); }
  thanks.addEventListener("click", function (e) {
    if (e.target === thanks || e.target.closest(".close")) closeThanks();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeThanks(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector("button");
    var err = form.querySelector(".error");
    var data = new FormData(form);
    if (data.get("_honey")) return; // bot trap
    btn.disabled = true;
    err.textContent = "";
    fetch(form.dataset.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        language: document.documentElement.lang,
        _subject: "New message from \"nicolemariapezza.com\" (preorder " + document.documentElement.lang.toUpperCase() + ")",
        _template: "table",
        _captcha: "false"
      })
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function () { form.reset(); thanks.classList.add("open"); })
      .catch(function () { err.textContent = form.dataset.error; })
      .finally(function () { btn.disabled = false; });
  });
})();
