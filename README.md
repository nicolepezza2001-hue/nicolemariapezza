# nicolemariapezza.com

Author site for Nicole Maria Pezza and *Tallulah Has Nothing / Tallulah Non Ha Niente*. Plain HTML and CSS, hosted on GitHub Pages; every push to `main` goes live in about a minute.

| Page | File |
|---|---|
| English home | `index.html` |
| Italian home | `home-italian/index.html` |
| Privacy policy | `privacy-policy/index.html` |
| Styles (colors, fonts, layout) | `assets/style.css` |
| Preorder form behavior | `assets/site.js` |
| Images | `images/` |

**Editing:** change the English and Italian pages together so they stay in sync. Colors and fonts are variables at the top of `assets/style.css`.

**Preorder signups** are emailed to nicole.pezza2001@gmail.com through FormSubmit (set in `data-endpoint` on each page's form). The very first signup triggers a one-time "activate form" email from FormSubmit that must be confirmed.

**Domain:** once DNS points to GitHub, add a `CNAME` file containing `nicolemariapezza.com`. `/blog/` redirects home (the old WordPress blog had only the sample post).
