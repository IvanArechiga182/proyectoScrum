//Este bloque de codigo funciona para traer el playerName ingresado por el usuario en la sesion actual
//si se cierrra el navegador se pierde este dato.
const playerName = sessionStorage.getItem("nombreUsuario");
if (playerName) {
  document.getElementById(
    "saludoInicial"
  ).textContent = `¡Hola ${playerName}, bienvenido a MethodsMatch!`;
}

//este bloque de codigo limpia el input de answers cuando se recarga la pagina
window.onload = function () {
  // Limpiar todos los inputs al cargar la pagina
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => (input.value = ""));
};

//banderas para determinar estados del juego y opportunities restantes
let isGameStarted = false;
let currentRound = 1;
let globalScore = 0;
let roundScore = 0;
let questionOpportunities = 2;
let questionPoints = 0;
let globalOpportunities = 2;
let questionLosses = 0;
let isPositiveFeedback = false;
let correctAnsweredWords = [];
let correctAnswerStreak = 0;
let latestAnswerStreak = 0;
let totalCorrectAnswers = 0;
//Este bloque de codigo funciona para bloquear el acceso a la pagina del juego inicial
//si se trata de acceder sin haber ingresado un playerName mediante la url directa
window.addEventListener("DOMContentLoaded", () => {
  const playerName = sessionStorage.getItem("nombreUsuario");
  if (!playerName) {
    alert("Debes ingresar tu playerName antes de continuar.");
    window.location.href = "./index.html"; // o la pagina donde se ingresa el playerName
  }
});

//Este bloque de codigo sirve para poder iniciar el juego y mostrar el tablero del area donde
//se mostraran las preguntas
function startGame() {
  showGameBoard();
  showTimer();
  updateOpportunities(questionOpportunities, globalOpportunities);
}
//esta funcion es para mostrar el area de juego una vez empezado
function showGameBoard() {
  document.getElementById("puntajeUsuario").classList.remove("mostrar");
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

let activeTimer = null;
let questionIndex = null;
//esta funcion sirve para mostrar y actualizar el temporizador, asi como actualizar la mecanica de juego

function showTimer() {
  if (globalOpportunities == 0 && roundScore >= 20) {
    alert(
      `¡Te quedaste sin oportunidades suficientes para continuar!, pero con ${roundScore} puntos pasas  a la siguiente ronda!`
    );
    currentRound++;
    nextRound(currentRound);
  } else if (globalOpportunities == 0) {
    alert("¡Te quedaste sin oportunidades suficientes para continuar!");
    restartGame();
    return;
  }

  if (!isGameStarted) return;

  document.getElementById("rondaHeader").innerHTML = `RONDA ${currentRound}`;
  document.getElementById("respuestaUsuario").value = "";

  if (activeTimer) clearInterval(activeTimer);

  if (questionOpportunities === 0 || correctAnsweredWords.length === 4) {
    questionOpportunities = 2;
    questionIndex = null;
  }

  if (questionIndex === null) {
    questionIndex = selectQuestion(currentRound);
  }

  let remaining = 40;
  activeTimer = setInterval(() => {
    let timerText = (document.getElementById("textoTemporizador").textContent =
      remaining + "s");
    remaining--;
    updateTimerStyle(timerText);

    if (remaining < 0) {
      clearInterval(activeTimer);
      activeTimer = null;

      const response = getUserResponse();
      if (!response?.trim()) {
        questionOpportunities--;
        let msg = `¡Tiempo agotado! No ingresaste ninguna respuesta`;
        showUserUiFeedback(msg, isPositiveFeedback);
        if (questionOpportunities == 0) {
          questionLosses++;
          correctAnswerStreak = 0;
          if (questionLosses == 2) {
            questionLosses = 0;
            globalOpportunities--;
          }
        }
        updateOpportunities(questionOpportunities, globalOpportunities);
        showTimer();
        resetTimerStyles();
      }
    }
  }, 1000);

  const btn = document.getElementById("btnVerificarRespuesta");
  if (btn) {
    btn.onclick = null;
    btn.onclick = () => {
      const points = checkAnswer(questionIndex);
      if (points !== undefined) {
        roundScore += points;
        scrollFeedback();
        clearInterval(activeTimer);
        activeTimer = null;
        updateRoundScore(roundScore);
        showTimer();
      }
    };
  }
}

function updateOpportunities(questionOp, roundOp) {
  document.getElementById("opPregunta").textContent = `${questionOp}`;
  document.getElementById("opRonda").textContent = `${roundOp}`;
}

function scrollFeedback() {
  window.scrollTo({ top: 0, behavior: "smooth" });

  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 1000);
}

function updateTimerStyle(tiempoRestante) {
  const textoTemporizador = document.getElementById("textoTemporizador");

  if (tiempoRestante === "15s") {
    textoTemporizador.classList.add("advertencia");
  }

  if (tiempoRestante === "10s") {
    resetTimerStyles();
    textoTemporizador.classList.add("critico");
  }
}

function resetTimerStyles() {
  document
    .getElementById("textoTemporizador")
    .classList.remove("advertencia", "critico");
}

//esta funcion complementaria de restartGame() sirve para ocultar area de juego y mostrar el boton
//para iniciar a jugar de nuevo
function hideGameBoard() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("rondaHeader").classList.remove("mostrar");
  document.getElementById("seccionPreguntas").classList.remove("mostrar");
  document.getElementById("btnIniciarJuego").style.display = "flex"; // vuelve a mostrar el boton
  document.getElementById("puntajeRonda").style.display = "none";
  document.getElementById("infoOportunidades").classList.remove("mostrar");
  document.getElementById("puntajeGlobal").classList.remove("mostrar");
  document.getElementById("puntajeUsuario").classList.add("mostrar");
  let puntajeTotalPartida;
  if (globalScore == 0) {
    puntajeTotalPartida = roundScore;
  } else {
    puntajeTotalPartida = globalScore;
  }
  document.getElementById(
    "puntajeAnterior"
  ).textContent = `PUNTAJE ANTERIOR: ${puntajeTotalPartida}`;
  document.getElementById(
    "rachaPreguntasCorrectas"
  ).textContent = `MAYOR RACHA DE ACIERTOS: ${latestAnswerStreak}`;
  document.getElementById(
    "respuestasCorrectasIntroducidas"
  ).textContent = `TOTAL DE ACIERTOS: ${totalCorrectAnswers}`;
  restartWordTable();
}

//Esta funcion sirve para mostrarle al usuario feedback en color rojo por default
//para el feedback negativo y se cambia en cuestion de feedbackStatus a verde
//si este viene en true y al final reinicia a false
function showUserUiFeedback(template, feedbackStatus) {
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

//Esta funcion sirve para que al pasar de pregunta se reinicie el tablero de la respuestas ingresadas
function restartWordTable() {
  totalCorrectAnswers += correctAnsweredWords.length;
  correctAnsweredWords = [];
  document.getElementById("primerLugar").textContent = "--------";
  document.getElementById("segundoLugar").textContent = "--------";
  document.getElementById("tercerLugar").textContent = "--------";
  document.getElementById("cuartoLugar").textContent = "--------";
}

//En esta parte se definen los arrays que contienen las preguntas y answers de cada ronda, en cada ronda
//el orden de aparicion de las preguntas va a ser aleatoria pero el indice del objeto respuetas
//equivale a la popularity de la response, entre mas bajo el indice mas points debe otorgar
const round1 = [
  {
    question: "¿Qué tipo de marco es Scrum?",
    answers: ["agil", "colaborativo", "flexible", "iterativo"],
  },
  {
    question: "¿Cuál es el objetivo principal de un Sprint?",
    answers: [
      "valor continuo",
      "entrega funcional",
      "trabajo técnico",
      "planificación fija",
    ],
  },
  {
    question: "¿Qué rol se encarga de priorizar el Product Backlog?",
    answers: [
      "Product Owner",
      "Scrum Master",
      "Development Team",
      "Stakeholder",
    ],
  },
  {
    question: "¿Qué evento ocurre todos los días en Scrum?",
    answers: [
      "Daily Scrum",
      "Sprint Planning",
      "Sprint Review",
      "Sprint Retrospective",
    ],
  },
  {
    question: "¿Qué artefacto representa el trabajo completado y funcional?",
    answers: [
      "Incremento",
      "Sprint Backlog",
      "Product Backlog",
      "Daily Report",
    ],
  },
];

const round2 = [
  {
    question: "¿Qué guía usa cinco grupos de procesos?",
    answers: ["PMBOK", "Scrum", "One Page", "Kanban"],
  },
  {
    question: "¿Qué grupo de procesos viene después de Ejecución?",
    answers: ["Monitoreo Control", "Cierre", "Inicio", "Planificación"],
  },
  {
    question:
      "¿Cuál área de conocimiento busca coordinación total del proyecto?",
    answers: [
      "Gestión Integración",
      "Gestión Tiempo",
      "Gestión Costos",
      "Gestión Calidad",
    ],
  },
  {
    question: "¿Qué área se enfoca en identificar y analizar riesgos?",
    answers: [
      "Gestión Riesgos",
      "Gestión Calidad",
      "Gestión Integración",
      "Gestión Comunicación",
    ],
  },
  {
    question: "¿Cuál es una diferencia clave entre Scrum y PMBOK?",
    answers: [
      "Scrum flexible",
      "PMBOK Sprints",
      "Scrum rígido",
      "PMBOK informal",
    ],
  },
];

const round3 = [
  {
    question: "¿Qué permite One Page Planning?",
    answers: [
      "resumen clave",
      "plan detallado",
      "control diario",
      "entrega ágil",
    ],
  },
  {
    question: "¿Qué elementos incluye One Page Planning?",
    answers: [
      "objetivos clave",
      "sprints diarios",
      "backlog global",
      "retrospectivas",
    ],
  },
  {
    question: "¿Quién se beneficia más de One Page Planning?",
    answers: [
      "stakeholders externos",
      "Scrum Master",
      "Development Team",
      "usuarios internos",
    ],
  },
  {
    question: "¿Qué tipo de herramienta es One Page Planning?",
    answers: [
      "herramienta complementaria",
      "marco trabajo",
      "evento ágil",
      "guía formal",
    ],
  },
  {
    question: "¿Qué permite priorizar en One Page Planning?",
    answers: ["requisitos", "eventos", "artefactos", "procesos"],
  },
];

const round4 = [
  {
    question: "¿Qué enfoque es más útil en entornos cambiantes?",
    answers: ["Scrum", "PMBOK", "One Page", "Waterfall"],
  },
  {
    question: "¿Qué enfoque es más rígido y estructurado?",
    answers: ["PMBOK", "Scrum", "One Page", "Extreme"],
  },
  {
    question:
      "¿Qué herramienta presenta la visión del proyecto en forma compacta?",
    answers: ["One Page", "Scrum Board", "PMBOK Guía", "Sprint Review"],
  },
  {
    question: "¿Cuál permite sincronización diaria del equipo?",
    answers: ["Scrum", "PMBOK", "Kanban", "One Page"],
  },
  {
    question: "¿Qué se recomienda usar para un plan largo y controlado?",
    answers: ["PMBOK", "Scrum", "Kanban", "Lean"],
  },
];

const round5 = [
  {
    question: "¿Qué elemento contiene requisitos priorizados?",
    answers: ["Product Backlog", "Sprint Backlog", "Daily Scrum", "Incremento"],
  },
  {
    question: "¿Qué evento reflexiona y mejora al final del Sprint?",
    answers: [
      "Sprint Retrospective",
      "Sprint Planning",
      "Sprint Review",
      "Daily Scrum",
    ],
  },
  {
    question: "¿Qué rol elimina obstáculos y facilita procesos?",
    answers: ["Scrum Master", "Product Owner", "Stakeholder", "Team Leader"],
  },
  {
    question: "¿Qué parte del PMBOK analiza la calidad?",
    answers: [
      "Gestión Calidad",
      "Gestión Alcance",
      "Gestión Costos",
      "Gestión Riesgos",
    ],
  },
  {
    question: "¿Qué grupo de procesos marca el final de un proyecto?",
    answers: ["Cierre", "Monitoreo Control", "Ejecución", "Inicio"],
  },
];

const rounds = [round1, round2, round3, round4, round5];

function getUserResponse() {
  let response = document.getElementById("respuestaUsuario").value;
  return response;
}

function updateScores(rScore, gScore) {
  document.getElementById(
    "puntajeRonda"
  ).textContent = `PUNTAJE RONDA: ${rScore}`;

  document.getElementById(
    "puntajeGlobal"
  ).textContent = `PUNTAJE GLOBAL: ${gScore}`;
}

function updateRoundScore(roundScore) {
  document.getElementById(
    "puntajeRonda"
  ).textContent = `PUNTAJE RONDA: ${roundScore}`;
  return;
}

function updateGlobalScore(globalScore) {
  document.getElementById(
    "puntajeGlobal"
  ).textContent = `PUNTAJE GLOBAL: ${gScore}`;
}

function nextRound(round) {
  let msg = "";
  if (round > rounds.length) {
    msg = `¡Felicidades, completaste todas las rondas! Total: ${globalScore} puntos.`;
    alert(msg);
    restartGame();
    return;
  }

  if (globalOpportunities == 0) {
    globalOpportunities++;
    alert("Te regalamos 1 vida global más!");
  }
  msg = `¡Felicidades, completaste la ronda ${
    round - 1
  } Hiciste: ${roundScore} puntos.`;
  alert(msg);
  msg = `Pasando a la ronda ${round}...`;
  alert(msg);
  globalScore += roundScore;
  roundScore = 0;
  updateScores(roundScore, globalScore);
  questionIndex = null;
  showTimer();
  return;
}
//esta funcion sirve para validar la response del usuario y otorgar puntos

function checkAnswer(index) {
  let msg = "";
  let response = normalize(getUserResponse());
  if (response === "" || response === null) {
    msg = `No ingresaste ninguna respuesta!`;
    scrollFeedback();
    showUserUiFeedback(msg, isPositiveFeedback);
    return;
  }

  let popularity = getAnswerPopularity(currentRound, index, response);

  if (popularity == null || popularity == -1) {
    questionOpportunities--;
    msg = `Esta respuesta no está entre las populares.
    Tienes ${questionOpportunities} oportunidades más para esta pregunta.`;
    isPositiveFeedback = false;
    correctAnswerStreak = 0;
    scrollFeedback();
    showUserUiFeedback(msg, isPositiveFeedback);
    if (questionOpportunities == 0) {
      questionLosses++;
      if (questionLosses == 2) {
        questionLosses = 0;
        globalOpportunities--;
      }
    }
    updateOpportunities(questionOpportunities, globalOpportunities);
    document.getElementById("respuestaUsuario").value = "";
    showTimer();
    return;
  }

  if (!checkAnswerInBoard(response, correctAnsweredWords)) {
    correctAnsweredWords.push(response);
    let earnedPoints = 0;
    switch (popularity) {
      case 0:
        earnedPoints = 15;
        document.getElementById("primerLugar").innerHTML =
          response.toUpperCase();
        break;
      case 1:
        earnedPoints = 10;
        document.getElementById("segundoLugar").innerHTML =
          response.toUpperCase();
        break;
      case 2:
        earnedPoints = 7;
        document.getElementById("tercerLugar").innerHTML =
          response.toUpperCase();
        break;
      case 3:
        earnedPoints = 5;
        document.getElementById("cuartoLugar").innerHTML =
          response.toUpperCase();
        break;
      default:
        earnedPoints = 0;
        break;
    }
    msg = `¡Bien hecho! Ganaste ${earnedPoints} puntos.`;
    isPositiveFeedback = true;
    correctAnswerStreak++;
    if (correctAnswerStreak > latestAnswerStreak) {
      latestAnswerStreak = correctAnswerStreak;
    }

    showUserUiFeedback(msg, isPositiveFeedback);
    document.getElementById("respuestaUsuario").value = "";
    // showTimer();
    return earnedPoints;
  } else {
    msg = `Esta respuesta ya está en el tablero! No se otorgaron puntos`;
    isPositiveFeedback = false;
    showUserUiFeedback(msg, isPositiveFeedback);
    return;
  }
}

function getAnswerPopularity(round, questionIndex, userResponse) {
  const roundQuestions = rounds[round - 1];
  if (!roundQuestions || !roundQuestions[questionIndex]) {
    return -1;
  }
  const answers = roundQuestions[questionIndex].answers;
  const response = userResponse.trim().toLowerCase();
  return answers.findIndex((ans) => ans.toLowerCase() === response);
}

function normalize(str) {
  return str
    .normalize("NFD") // descompone letras con acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina los acentos
    .toLowerCase(); // convierte a minúsculas
}
//Esta funcion sirve para revisar si la respuesta ingresada ya esta en el tablero de respuestas
//y mostrar un feedback de que ya se contestó pero no quitar ninguna oportunidad.
function checkAnswerInBoard(answer, answers) {
  const normalizedAnswer = normalize(answer);
  return answers.some((a) => normalize(a) === normalizedAnswer);
}

//esta funcion determina que pregunta aleatoria se va a mostrar dependiendo de la ronda en la que este actualmente
//el jugador
let latestQuestions = [];
function selectQuestion(round) {
  if (!round) return;

  const activeRound = rounds[round - 1];
  const availableQuestions = activeRound.filter(
    (p) => !latestQuestions.includes(p.question)
  );
  if (availableQuestions.length === 0) {
    setTimeout(() => {
      alert(`¡Ya se mostraron todas las preguntas de esta ronda!`);
      if (globalOpportunities > 0) {
        currentRound++;
        nextRound(currentRound);
        return;
      }
    }, 600);
    restartWordTable();
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  latestQuestions.push(selectedQuestion.question);
  document.getElementById("pregunta").innerHTML = selectedQuestion.question;
  updateOpportunities(questionOpportunities, globalOpportunities);
  restartWordTable();
  return activeRound.findIndex((p) => p.question === selectedQuestion.question);
}

//esta funcion restaura al estado inicial la pagina para poder jugar de nuevo
function restartGame() {
  isGameStarted = false;
  currentRound = 1;
  questionOpportunities = 2;
  globalOpportunities = 2;
  actualRoundPoints = 0;
  questionIndex = null;
  latestQuestions = [];
  questionLosses = 0;
  hideGameBoard();
  latestAnswerStreak = 0;
  correctAnswerStreak = 0;
  totalCorrectAnswers = 0;
  globalScore = 0;
  roundScore = 0;
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
}
