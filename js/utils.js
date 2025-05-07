import { updateScores } from "./actualizarPuntos.js";

export function showUserUiFeedback(template, feedbackStatus) {
  const userFeedbackArea = document.getElementById("UIFeedback");

  userFeedbackArea.textContent = template;
  userFeedbackArea.classList.add("visible");

  if (feedbackStatus) {
    userFeedbackArea.classList.add("exitoso");
  }

  setTimeout(() => {
    userFeedbackArea.classList.remove("visible");

    setTimeout(() => {
      userFeedbackArea.style.visibility = "hidden";
      userFeedbackArea.classList.remove("exitoso");
    }, 500);
  }, 2000);
  userFeedbackArea.style.visibility = "visible";
  isPositiveFeedback = false;
}

export function showGameBoard() {
  document.getElementById("btnIniciarJuego").style.display = "none";
  document.getElementById("puntajeRonda").style.display = "flex";
  updateScores(roundScore, globalScore);
  // document.getElementById(
  //   "puntajeRonda"
  // ).textContent = `PUNTAJE DE RONDA: ${roundScore}`;
  // document.getElementById(
  //   "puntajeGlobal"
  // ).textContent = `PUNTAJE DE RONDA: ${roundScore}`;
  const div = document.getElementById("seccionPreguntas");
  const puntajeDiv = document.getElementById("puntajeRonda");
  const infoOportunidades = document.getElementById("infoOportunidades");
  const rondaHeader = document.getElementById("rondaHeader");
  const puntajeGlobalDiv = document.getElementById("puntajeGlobal");
  isGameStarted = true;
  div.classList.add("mostrar");
  puntajeDiv.classList.add("mostrar");
  infoOportunidades.classList.add("mostrar");
  rondaHeader.classList.add("mostrar");
  puntajeGlobalDiv.classList.add("mostrar");
}
