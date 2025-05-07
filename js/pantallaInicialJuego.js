//Este bloque de codigo funciona para traer el playerName ingresado por el usuario en la sesion actual
//si se cierrra el navegador se pierde este dato.
const playerName = sessionStorage.getItem("nombreUsuario");
if (playerName) {
  document.getElementById(
    "saludoInicial"
  ).textContent = `¡Hola ${playerName}, bienvenido a AgileMatch!`;
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
      `¡Te quedaste sin oportunidades suficientes para continuar!, pero con ${roundScore} pasas  a la siguiente ronda!`
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

  let remaining = 35;
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
  document.getElementById("rondaHeader").classList.remove("mostrar");
  document.getElementById("seccionPreguntas").classList.remove("mostrar");
  document.getElementById("btnIniciarJuego").style.display = "flex"; // vuelve a mostrar el boton
  document.getElementById("puntajeRonda").style.display = "none";
  document.getElementById("infoOportunidades").classList.remove("mostrar");
  document.getElementById("puntajeGlobal").classList.remove("mostrar");
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
    question:
      "¿Que valor del manifiesto agil se enfoca en el equipo y su interaccion?",
    answers: ["personas", "comunicacion", "colaboracion", "equipo"],
  },
  {
    question:
      "¿Que se prefiere sobre los procesos extensivos en el manifiesto agil?",
    answers: ["software", "funcional", "producto", "entrega"],
  },
  {
    question: "¿Que se prioriza sobre la documentacion extensiva?",
    answers: ["comunicacion", "colaboracion", "conversacion", "interaccion"],
  },
  {
    question: "¿Que se valora sobre la negociacion de contratos?",
    answers: ["colaboracion", "cliente", "flexibilidad", "adaptabilidad"],
  },
  {
    question: "¿Que aspecto se prefiere sobre seguir un plan rigido?",
    answers: ["cambio", "adaptacion", "response", "flexibilidad"],
  },
];

const round2 = [
  {
    question: "¿Quien es responsable de maximizar el valor del producto?",
    answers: ["product owner", "dueño", "valor", "negocio"],
  },
  {
    question: "¿Quien facilita al equipo y elimina impedimentos?",
    answers: ["scrum master", "facilitador", "lider", "coach"],
  },
  {
    question: "¿Quien construye el incremento del producto en cada sprint?",
    answers: ["desarrolladores", "equipo", "tecnicos", "programadores"],
  },
  {
    question: "¿Que lista contiene todos los requerimientos del producto?",
    answers: ["backlog", "requerimientos", "lista", "funcionalidades"],
  },
  {
    question:
      "¿Que evento se hace al final del sprint para revisar lo entregado?",
    answers: ["revision", "demo", "retrospectiva", "entrega"],
  },
];

const round3 = [
  {
    question: "¿Como se llama el ciclo de trabajo en Scrum?",
    answers: ["sprint", "iteracion", "ciclo", "desarrollo"],
  },
  {
    question: "¿Que evento se realiza cada dia para sincronizar al equipo?",
    answers: ["daily", "scrum diario", "reunion", "standup"],
  },
  {
    question: "¿Que evento inicia el sprint y se planifica el trabajo?",
    answers: ["planificacion", "sprint planning", "inicio", "kickoff"],
  },
  {
    question: "¿Que evento sirve para mejorar continuamente el proceso?",
    answers: ["retrospectiva", "mejora", "revision", "cierre"],
  },
  {
    question: "¿Que se entrega al final del sprint como resultado?",
    answers: ["incremento", "producto", "entrega", "funcionalidad"],
  },
];

const round4 = [
  {
    question: "¿Que se busca entregar de forma frecuente en agil?",
    answers: ["valor", "software", "producto", "funcionalidad"],
  },
  {
    question: "¿Que es importante mantener entre los miembros del equipo?",
    answers: ["comunicacion", "confianza", "colaboracion", "transparencia"],
  },
  {
    question: "¿Que practica permite adaptar el proceso con regularidad?",
    answers: ["retrospectiva", "mejora", "feedback", "ajuste"],
  },
  {
    question: "¿Que se usa para visualizar el flujo de trabajo?",
    answers: ["tablero", "kanban", "tareas", "columnas"],
  },
  {
    question: "¿Que tecnica divide el trabajo en unidades manejables?",
    answers: ["historias", "tareas", "tickets", "epicas"],
  },
];

const round5 = [
  {
    question: "¿Que marco agil permite escalar Scrum a grandes equipos?",
    answers: ["SAFe", "Nexus", "LeSS", "Spotify"],
  },
  {
    question: "¿Que herramienta digital se usa comúnmente para boards agiles?",
    answers: ["Jira", "Trello", "ClickUp", "Monday"],
  },
  {
    question: "¿Que tecnica ayuda a estimar el esfuerzo de las tareas?",
    answers: ["planning poker", "points", "estimacion", "fibonacci"],
  },
  {
    question: "¿Que practica permite ver el avance en tiempo real?",
    answers: ["burndown", "grafico", "seguimiento", "progreso"],
  },
  {
    question: "¿Que es fundamental recibir constantemente de los usuarios?",
    answers: ["feedback", "retroalimentacion", "comentarios", "validacion"],
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
    showUserUiFeedback(msg, isPositiveFeedback);
    return;
  }

  let popularity = getAnswerPopularity(currentRound, index, response);

  if (popularity == null || popularity == -1) {
    questionOpportunities--;
    msg = `Esta respuesta no está entre las populares.
    Tienes ${questionOpportunities} oportunidades más para esta pregunta.`;
    isPositiveFeedback = false;
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
  globalScore = 0;
  roundScore = 0;
  questionOpportunities = 2;
  globalOpportunities = 2;
  actualRoundPoints = 0;
  roundScore = 0;
  questionIndex = null;
  latestQuestions = [];
  questionLosses = 0;
  hideGameBoard();
  restartWordTable();
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
}
