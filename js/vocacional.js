/* ============================================================
   INSTITUTO RMB — vocacional.js
   Motor del test "¿Qué bachillerato me conviene?".
   Solo se ejecuta si la página tiene el contenedor #voc-quiz-mode.
   ============================================================ */

(function () {
  "use strict";

  const quizMode = document.getElementById("voc-quiz-mode");
  if (!quizMode) return;

  const QUESTIONS = [
    {
      text: "¿Qué actividad te llama más la atención?",
      options: [
        { letter: "A", value: "inf", text: "Armar, configurar o resolver problemas con computadoras y tecnología" },
        { letter: "B", value: "cf",  text: "Organizar cuentas, presupuestos o llevar registros ordenados" },
        { letter: "C", value: "ch",  text: "Leer, investigar y debatir sobre distintos temas" },
      ],
    },
    {
      text: "En un trabajo en equipo, ¿qué rol prefieres?",
      options: [
        { letter: "A", value: "inf", text: "El que resuelve fallas técnicas o arma la parte digital del proyecto" },
        { letter: "B", value: "cf",  text: "El que lleva el control de gastos y organiza los recursos" },
        { letter: "C", value: "ch",  text: "El que investiga la información y prepara el contenido" },
      ],
    },
    {
      text: "Después del bachillerato, ¿qué te gustaría hacer?",
      options: [
        { letter: "A", value: "inf", text: "Seguir una carrera relacionada con programación, redes o soporte técnico" },
        { letter: "B", value: "cf",  text: "Estudiar Contaduría Pública, Administración de Empresas o Finanzas" },
        { letter: "C", value: "ch",  text: "Continuar con una carrera universitaria general (Derecho, Medicina, Educación, etc.)" },
      ],
    },
    {
      text: "¿Qué materia se te da mejor o disfrutas más?",
      options: [
        { letter: "A", value: "inf", text: "Informática o Computación" },
        { letter: "B", value: "cf",  text: "Matemáticas y Contabilidad" },
        { letter: "C", value: "ch",  text: "Ciencias Sociales, Español o Literatura" },
      ],
    },
    {
      text: "¿Cómo te describen tus amigos?",
      options: [
        { letter: "A", value: "inf", text: "El o la que sabe de tecnología y ayuda a resolver problemas con equipos" },
        { letter: "B", value: "cf",  text: "El o la organizada, meticulosa con el dinero o las cuentas" },
        { letter: "C", value: "ch",  text: "El o la que lee mucho, opina y le gusta discutir ideas" },
      ],
    },
  ];

  const ICON_MONITOR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
  const ICON_CHART   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>';
  const ICON_BOOK    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';

  const RESULTS = {
    inf: {
      icon: ICON_MONITOR,
      tagClass: "voc-tag-inf",
      tag: "BTP Informática",
      title: "Bachillerato Técnico Profesional en Informática",
      desc: "Tus respuestas muestran interés por la tecnología, la resolución de problemas y las herramientas digitales. Este bachillerato te prepara en programación, sistemas operativos, ofimática y soporte técnico.",
      href: "carrera-informatica.html",
    },
    cf: {
      icon: ICON_CHART,
      tagClass: "voc-tag-cf",
      tag: "BTP Contaduría y Finanzas",
      title: "Bachillerato Técnico Profesional en Contaduría y Finanzas",
      desc: "Tus respuestas reflejan orden, atención al detalle y gusto por el manejo de números y recursos. Este bachillerato te forma en procesos contables, registros financieros y organización económica.",
      href: "carrera-contaduria.html",
    },
    ch: {
      icon: ICON_BOOK,
      tagClass: "voc-tag-ch",
      tag: "Bachillerato en Ciencias y Humanidades",
      title: "Bachillerato en Ciencias y Humanidades",
      desc: "Tus respuestas muestran interés por el conocimiento general, la lectura y el análisis. Este bachillerato te da una base académica amplia para continuar estudios superiores en distintas áreas.",
      href: "carrera-ciencias-humanidades.html",
    },
  };

  const progressFill  = document.getElementById("voc-progress-fill");
  const progressLabel = document.getElementById("voc-progress-label");
  const progressPct   = document.getElementById("voc-progress-pct");
  const qNum          = document.getElementById("voc-qnum");
  const qText         = document.getElementById("voc-qtext");
  const optionsWrap   = document.getElementById("voc-options");
  const backBtn       = document.getElementById("voc-back-btn");

  const resultBox   = document.getElementById("voc-result");
  const resultIcon  = document.getElementById("voc-result-icon");
  const resultTag   = document.getElementById("voc-result-tag");
  const resultTitle = document.getElementById("voc-result-title");
  const resultDesc  = document.getElementById("voc-result-desc");
  const resultCta   = document.getElementById("voc-result-cta");
  const tieList     = document.getElementById("voc-tie-list");
  const retakeBtn   = document.getElementById("voc-retake-btn");

  let current = 0;
  const answers = new Array(QUESTIONS.length).fill(null);

  function renderQuestion() {
    const q = QUESTIONS[current];

    progressLabel.textContent = "Pregunta " + (current + 1) + " de " + QUESTIONS.length;
    progressPct.textContent = Math.round(((current) / QUESTIONS.length) * 100) + "%";
    progressFill.style.width = ((current) / QUESTIONS.length) * 100 + "%";

    qNum.textContent = "Pregunta " + (current + 1);
    qText.textContent = q.text;

    optionsWrap.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "voc-option";
      if (answers[current] === opt.value) btn.classList.add("selected");

      const letter = document.createElement("span");
      letter.className = "voc-option-letter";
      letter.textContent = opt.letter;

      const label = document.createElement("span");
      label.textContent = opt.text;

      btn.append(letter, label);
      btn.addEventListener("click", () => selectOption(opt.value));
      optionsWrap.appendChild(btn);
    });

    backBtn.disabled = current === 0;
  }

  function selectOption(value) {
    answers[current] = value;
    renderQuestion();

    window.setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        current++;
        renderQuestion();
      } else {
        progressFill.style.width = "100%";
        progressPct.textContent = "100%";
        showResult();
      }
    }, 380);
  }

  backBtn.addEventListener("click", () => {
    if (current === 0) return;
    current--;
    renderQuestion();
  });

  function tally() {
    const counts = { inf: 0, cf: 0, ch: 0 };
    answers.forEach((a) => { if (a) counts[a]++; });
    return counts;
  }

  function showResult() {
    const counts = tally();
    const max = Math.max(counts.inf, counts.cf, counts.ch);
    const winners = Object.keys(counts).filter((k) => counts[k] === max);

    quizMode.style.display = "none";
    resultBox.classList.add("show");

    const winnerKey = winners[0];
    const winner = RESULTS[winnerKey];

    resultIcon.innerHTML = winner.icon;
    resultTag.textContent = winner.tag;
    resultTag.className = "voc-result-tag " + winner.tagClass;
    resultTitle.textContent = winner.title;
    resultDesc.textContent = winner.desc;
    resultCta.href = winner.href;

    if (winners.length > 1) {
      tieList.style.display = "flex";
      tieList.innerHTML = "";
      winners.forEach((k) => {
        const chip = document.createElement("span");
        chip.className = "voc-tie-chip";
        chip.textContent = RESULTS[k].tag;
        tieList.appendChild(chip);
      });
      resultDesc.textContent =
        "Tus respuestas están repartidas entre más de un bachillerato. Revisa las opciones abajo y considera cuál se ajusta mejor a tus metas.";
    } else {
      tieList.style.display = "none";
      tieList.innerHTML = "";
    }
  }

  retakeBtn.addEventListener("click", () => {
    current = 0;
    answers.fill(null);
    resultBox.classList.remove("show");
    quizMode.style.display = "";
    renderQuestion();
    quizMode.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderQuestion();
})();
