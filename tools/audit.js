/* Layout audit for this site. Paste into the browser console on any page, at any
   window size. It catches the two failures that automated checks otherwise miss:
   text squeezed into a collapsed column, and text overlapping other text.

   Usage:  copy this file, paste in the console, press Enter.  */
(() => {
  const hidden = (el) => el.closest("details:not([open])") || !el.offsetParent;
  const els = [...document.querySelectorAll("p,li,h1,h2,h3,h4,td,th,summary")]
    .filter((el) => !hidden(el) && el.textContent.trim().length > 40);

  const squeezed = els
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width < 210 && el.textContent.trim().length > 70 && !el.closest("table");
    })
    .map((el) => ({ what: el.className || el.tagName, width: Math.round(el.getBoundingClientRect().width), text: el.textContent.trim().slice(0, 40) }));

  const boxes = els.map((el) => ({ el, r: el.getBoundingClientRect() }));
  const overlaps = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (x > 14 && y > 10) overlaps.push({ a: a.el.textContent.trim().slice(0, 30), b: b.el.textContent.trim().slice(0, 30) });
    }
  }

  const inline = (el) => el.tagName === "A" && ["P", "LI", "TD", "SPAN", "SUMMARY", "H2", "H3", "H4"].includes(el.parentElement?.tagName) && !el.closest("nav, .footer ul, .btn-row");
  const smallTargets = [...document.querySelectorAll("a,button,summary,input,select")]
    .filter((el) => el.offsetParent && !el.closest("details:not([open])") && !inline(el))
    .map((el) => ({ what: (el.textContent || el.value || el.type || "").trim().slice(0, 24), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) }))
    .filter((x) => x.h > 0 && x.h < 36);

  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  const result = { page: location.pathname, width: innerWidth, overflow, squeezed, overlaps: overlaps.slice(0, 10), smallTargets: smallTargets.slice(0, 8) };
  const bad = result.squeezed.length || result.overlaps.length || result.overflow || (matchMedia("(pointer: coarse)").matches && result.smallTargets.length);
  console.log(bad ? "PROBLEMS" : "clean", result);
  return result;
})();
