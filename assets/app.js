// footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// pricing selection
const cards = document.querySelectorAll(".card");
const buttons = document.querySelectorAll(".select-btn");

function setSelected(card) {
  cards.forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");

  cards.forEach(c => {
    const btn = c.querySelector(".select-btn");
    if (!btn) return;
    btn.textContent = c.classList.contains("selected") ? "Selected" : "Select Plan";
  });
}

cards.forEach(card => {
  card.addEventListener("click", () => setSelected(card));
});

buttons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const card = btn.closest(".card");
    if (card) setSelected(card);
  });
});
