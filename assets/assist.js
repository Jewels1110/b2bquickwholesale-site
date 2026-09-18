/* Ask a question — the website assistant.
   Answers from this site's own documentation (setup guide, FAQ, requirements,
   features, pricing) via the app's server. It knows nothing about any store, and
   hands over to email whenever it isn't sure. No cookies, no tracking, and
   nothing is stored in this browser. */
(() => {
  const ENDPOINT = "https://b2b-quick-wholesale.onrender.com/api/assist/public";
  const EMAIL = "b2bquickwholesale@gmail.com";
  const SUGGESTIONS = [
    "Do I need Shopify Plus?",
    "How long does setup take?",
    "What happens to my retail customers?",
  ];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const panel = el("div", "ask");
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Ask a question");
  panel.innerHTML = `
    <div class="ask__head">
      <strong>Ask a question</strong>
      <button class="ask__close" type="button" aria-label="Close">&times;</button>
    </div>
    <div class="ask__log" data-log aria-live="polite">
      <p class="ask__hi">Ask anything about the app, Shopify B2B or setting up wholesale. If I'm not sure, I'll say so and point you to a human.</p>
      <div class="ask__chips" data-chips></div>
    </div>
    <form class="ask__form" data-form>
      <label class="sr-only" for="ask-input">Your question</label>
      <input class="ask__input" id="ask-input" type="text" autocomplete="off" placeholder="Type your question…" maxlength="500">
      <button class="btn btn--sm" type="submit">Ask</button>
    </form>
    <p class="ask__foot">Prefer a person? <a href="mailto:${EMAIL}">Email us</a> — usually answered the same working day.</p>`;

  const launcher = el("button", "ask-launcher", "Ask a question");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");

  document.addEventListener("DOMContentLoaded", () => {
    document.body.append(launcher, panel);

    const log = panel.querySelector("[data-log]");
    const form = panel.querySelector("[data-form]");
    const input = panel.querySelector(".ask__input");
    const chips = panel.querySelector("[data-chips]");
    let history = [];
    let busy = false;

    SUGGESTIONS.forEach((text) => {
      const chip = el("button", "ask__chip", text);
      chip.type = "button";
      chip.addEventListener("click", () => ask(text));
      chips.append(chip);
    });

    const add = (who, text) => {
      const wrap = el("div", `ask__turn ask__turn--${who}`);
      wrap.append(el("span", "ask__who", who === "you" ? "You" : "Assistant"));
      String(text)
        .split("\n")
        .filter(Boolean)
        .forEach((line) => wrap.append(el("p", null, line)));
      log.append(wrap);
      log.scrollTop = log.scrollHeight;
      return wrap;
    };

    const escalation = () => {
      const wrap = el("div", "ask__turn ask__turn--escalate");
      const link = el("a", "btn btn--sm", "Email us this question");
      const transcript = history.map((t) => `${t.role === "user" ? "Me" : "Assistant"}: ${t.content}`).join("\n\n");
      link.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Question about B2B Quick Wholesale")}&body=${encodeURIComponent(transcript + "\n\n--- What I still need ---\n")}`;
      wrap.append(link);
      log.append(wrap);
      log.scrollTop = log.scrollHeight;
    };

    async function ask(text) {
      const question = String(text || "").trim();
      if (!question || busy) return;
      busy = true;
      chips.hidden = true;
      input.value = "";
      add("you", question);
      const thinking = add("assistant", "Thinking…");
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          // text/plain keeps this a CORS "simple request", so the browser sends
          // no preflight. An application/json POST triggers an OPTIONS first,
          // which the app's router answers with 405 — the whole widget failed.
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify({ question, history }),
        });
        const result = await response.json();
        thinking.remove();
        add("assistant", result.text || "I couldn't answer that one.");
        history = [...history, { role: "user", content: question }, { role: "assistant", content: result.text || "" }].slice(-8);
        if (result.escalate || !result.ok) escalation();
      } catch {
        thinking.remove();
        add("assistant", "I couldn't reach the assistant just now.");
        escalation();
      } finally {
        busy = false;
        input.focus();
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      ask(input.value);
    });

    const open = (yes) => {
      panel.hidden = !yes;
      launcher.setAttribute("aria-expanded", String(yes));
      launcher.textContent = yes ? "Close" : "Ask a question";
      if (yes) input.focus();
    };
    launcher.addEventListener("click", () => open(panel.hidden));
    panel.querySelector(".ask__close").addEventListener("click", () => open(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) open(false);
    });
  });
})();
