/* Small conveniences only: the site works without JavaScript.
   1. The mobile navigation toggle.
   2. The current year in the footer.
   3. On the setup guide, a progress marker for the section you're reading. */
(() => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.hasAttribute("data-open");
      if (open) nav.removeAttribute("data-open");
      else nav.setAttribute("data-open", "");
      toggle.setAttribute("aria-expanded", String(!open));
    });
    nav.addEventListener("click", (event) => {
      if (event.target.tagName === "A") nav.removeAttribute("data-open");
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  const links = [...document.querySelectorAll("[data-guide-nav] a")];
  if (links.length && "IntersectionObserver" in window) {
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) =>
            link.toggleAttribute("data-current", link.getAttribute("href") === `#${entry.target.id}`),
          );
        });
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  }
})();
