const checkboxes = document.querySelectorAll(".security-check");
const progressBar = document.getElementById("progress");
const progressText = document.getElementById("progress-text");
const feedback = document.getElementById("feedback");
const resetButton = document.getElementById("reset-check");

function updateProgress() {
  const completed = [...checkboxes].filter((checkbox) => checkbox.checked).length;
  const total = checkboxes.length;

  progressBar.value = completed;
  progressText.textContent = `${completed} / ${total}`;

  if (completed === total) {
    feedback.textContent = "Ajoyib! Barcha asosiy qoidalarni belgiladingiz.";
  } else if (completed === 0) {
    feedback.textContent = "Birinchi qoidani belgilab boshlang.";
  } else {
    feedback.textContent = `Yana ${total - completed} ta qoidani tekshiring.`;
  }
}

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateProgress);
});

resetButton.addEventListener("click", () => {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  updateProgress();
});

updateProgress();
