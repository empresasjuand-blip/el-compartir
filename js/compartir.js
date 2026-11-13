/* El Compartir La Italiana 2026 · la presentación.
   Navegación (flechas, teclado, rueda, deslizar, #n), cuenta regresiva al 6-dic,
   pestañas, galería, rubros, valores y los mensajes de WhatsApp que se arman solos. */
(function () {
  "use strict";
  var WA = "584245976337";
  var EVENTO = new Date("2026-12-06T08:00:00-04:00"); // hora de Venezuela
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var laminas = [].slice.call(document.querySelectorAll(".lamina"));
  var N = laminas.length, actual = -1, bloqueo = 0;
  var $ = function (id) { return document.getElementById(id); };
  var todos = function (sel, raiz) { return [].slice.call((raiz || document).querySelectorAll(sel)); };
  var wa = function (texto) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(texto); };
  var enlace = location.origin + location.pathname;

  /* ── aviso ──────────────────────────────────────────────── */
  var tAviso;
  function aviso(t) { var a = $("aviso"); a.textContent = t; a.classList.add("ver"); clearTimeout(tAviso); tAviso = setTimeout(function () { a.classList.remove("ver"); }, 2400); }

  /* ── navegación ─────────────────────────────────────────── */
  $("total").textContent = N;
  var indice = $("indice");
  laminas.forEach(function (l, j) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "punto";
    b.setAttribute("aria-label", "Ir a la lámina " + (j + 1) + ": " + (l.getAttribute("aria-label") || ""));
    b.addEventListener("click", function () { ir(j); });
    indice.appendChild(b);
  });
  var puntos = todos(".punto", indice);

  function ir(i, sinHash) {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === actual) return;
    laminas.forEach(function (l, j) {
      var si = j === i;
      l.classList.toggle("activa", si);
      l.setAttribute("aria-hidden", si ? "false" : "true");
      if ("inert" in l) l.inert = !si;
    });
    var crema = laminas[i].classList.contains("lamina--crema");
    document.body.classList.toggle("en-crema", crema);
    document.body.classList.toggle("en-portada", i === 0);
    $("barraLogo").src = crema ? "assets/logo/logo-color.png" : "assets/logo/logo-oscuro.png";
    $("barraLogo").style.opacity = (i === 0 || i === N - 1) ? "0" : "1";
    $("actual").textContent = (i + 1 < 10 ? "0" : "") + (i + 1);
    $("barraProgreso").style.width = ((i + 1) / N * 100) + "%";
    $("ant").disabled = i === 0; $("sig").disabled = i === N - 1;
    puntos.forEach(function (p, j) { p.classList.toggle("activo", j === i); p.setAttribute("aria-current", j === i ? "step" : "false"); });
    actual = i;
    var c = laminas[i].querySelector(".contenido"); if (c) c.scrollTop = 0;
    if (laminas[i].id === "d3") contar();
    if (!sinHash) try { history.replaceState(null, "", "#" + (i + 1)); } catch (e) {}
  }
  function paso(d) { var ahora = Date.now(); if (ahora < bloqueo) return; bloqueo = ahora + 650; ir(actual + d); }
  $("ant").addEventListener("click", function () { ir(actual - 1); });
  $("sig").addEventListener("click", function () { ir(actual + 1); });
  todos("[data-ir]").forEach(function (b) { b.addEventListener("click", function () { ir(+b.dataset.ir - 1); }); });

  function escribiendo(t) { return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT"); }
  document.addEventListener("keydown", function (e) {
    if ($("visorGrande").classList.contains("abierto")) {
      if (e.key === "Escape") cerrarVisor();
      else if (e.key === "ArrowRight") verFoto(fotoActual + 1);
      else if (e.key === "ArrowLeft") verFoto(fotoActual - 1);
      return;
    }
    var t = e.target;
    if (escribiendo(t)) return;
    if (["ArrowRight", "PageDown", "ArrowDown"].indexOf(e.key) >= 0 || (e.key === " " && !(t && t.tagName === "BUTTON"))) { e.preventDefault(); ir(actual + 1); }
    else if (["ArrowLeft", "PageUp", "ArrowUp"].indexOf(e.key) >= 0) { e.preventDefault(); ir(actual - 1); }
    else if (e.key === "Home") ir(0);
    else if (e.key === "End") ir(N - 1);
    else if (e.key === "f" || e.key === "F") pantalla();
  });
  window.addEventListener("wheel", function (e) {
    if ($("visorGrande").classList.contains("abierto")) return;
    if (Math.abs(e.deltaY) < 12) return;
    var c = laminas[actual].querySelector(".contenido");
    if (c && c.scrollHeight > c.clientHeight + 4) {
      var arriba = c.scrollTop <= 0, abajo = c.scrollTop + c.clientHeight >= c.scrollHeight - 2;
      if ((e.deltaY > 0 && !abajo) || (e.deltaY < 0 && !arriba)) return;
    }
    paso(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });

  // deslizar en horizontal (en vertical, la lámina hace scroll)
  var x0 = null, y0 = null;
  document.addEventListener("touchstart", function (e) { if (e.touches.length !== 1) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if ($("visorGrande").classList.contains("abierto")) { if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) verFoto(fotoActual + (dx < 0 ? 1 : -1)); return; }
    if (escribiendo(e.target)) return;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) ir(actual + (dx < 0 ? 1 : -1));
  }, { passive: true });

  function pantalla() {
    var d = document;
    if (!d.fullscreenElement) { var el = d.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); }
    else (d.exitFullscreen || d.webkitExitFullscreen).call(d);
  }
  $("btnPantalla").addEventListener("click", pantalla);
  if (!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)) $("btnPantalla").hidden = true;
  window.addEventListener("hashchange", function () { var n = parseInt(location.hash.slice(1), 10); if (n) ir(n - 1, true); });

  /* ── 03 · cifras y cuenta regresiva ────────────────────── */
  var contado = false;
  function contar() {
    if (contado || quieto) return; contado = true;
    todos("[data-contar]").forEach(function (b) {
      var fin = +b.dataset.contar, t0 = performance.now(), dur = 900;
      (function cuadro(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        b.textContent = Math.round(fin * e);
        if (p < 1) requestAnimationFrame(cuadro);
      })(t0);
    });
  }
  function reloj() {
    var ms = EVENTO - Date.now();
    if (ms <= 0) {
      $("reloj").hidden = true;
      $("cuentaTexto").innerHTML = Date.now() < EVENTO.getTime() + 864e5
        ? "<strong>Hoy es El Compartir.</strong> Gracias a todos los que se sumaron."
        : "<strong>El Compartir 2026 ya se realizó.</strong> Pronto compartiremos el informe con lo recaudado, su uso y los resultados.";
      return;
    }
    var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    $("rDias").textContent = d; $("rHoras").textContent = h; $("rMin").textContent = (m < 10 ? "0" : "") + m;
    $("cuentaTexto").innerHTML = "<strong>Faltan " + d + " días para el 6 de diciembre.</strong> Ya invitamos a las 150 familias; ahora estamos reuniendo los aportes.";
  }
  reloj(); setInterval(reloj, 30000);

  /* ── 04 · pestañas ─────────────────────────────────────── */
  var tabs = todos(".pestana");
  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () {
      tabs.forEach(function (o) { o.setAttribute("aria-selected", o === t ? "true" : "false"); o.tabIndex = o === t ? 0 : -1; $(o.dataset.foto).classList.toggle("ver", o === t); });
    });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault(); e.stopPropagation();
      var n = tabs[(k + (e.key === "ArrowDown" ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click();
    });
  });

  /* ── 05 · galería ──────────────────────────────────────── */
  var fotos = todos("#galeria button").map(function (b) { var i = b.querySelector("img"); return { src: i.getAttribute("src"), alt: i.alt, txt: b.querySelector("span").textContent }; });
  var fotoActual = 0, ultimoFoco = null;
  function verFoto(i) { fotoActual = (i + fotos.length) % fotos.length; var f = fotos[fotoActual]; $("vImg").src = f.src; $("vImg").alt = f.alt; $("vTxt").textContent = f.txt + " · " + (fotoActual + 1) + " de " + fotos.length; }
  function cerrarVisor() { $("visorGrande").classList.remove("abierto"); if (ultimoFoco) ultimoFoco.focus(); }
  todos("#galeria button").forEach(function (b) { b.addEventListener("click", function () { ultimoFoco = b; verFoto(+b.dataset.i); $("visorGrande").classList.add("abierto"); $("vCerrar").focus(); }); });
  $("vCerrar").addEventListener("click", cerrarVisor);
  $("vAnt").addEventListener("click", function () { verFoto(fotoActual - 1); });
  $("vSig").addEventListener("click", function () { verFoto(fotoActual + 1); });
  $("visorGrande").addEventListener("click", function (e) { if (e.target === this) cerrarVisor(); });

  /* ── 06 y 09 · tarjetas que se abren ───────────────────── */
  todos(".rubro, .valor").forEach(function (b) {
    b.addEventListener("click", function () { b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true"); });
  });

  /* ── 07 · aporte de una persona ────────────────────────── */
  var monto = "50";
  var chips = todos("#formPersona .chip");
  function textoPersona() {
    var nombre = $("inNombre").value.trim();
    var m = monto === "otro" ? $("inMonto").value.trim() : monto;
    var cuanto = m && +m > 0 ? "con un aporte de US$" + (+m).toLocaleString("es-VE") : "con un aporte";
    return (nombre ? "Hola, soy " + nombre + ". " : "Hola. ") + "Quiero sumarme a El Compartir 2026 " + cuanto + " para los niños de La Aduana de Cerro Verde. ¿Cómo puedo hacerlo llegar?";
  }
  function pintarPersona() {
    var t = textoPersona(); $("msgPersona").textContent = t; $("btnPersona").href = wa(t);
    var falta = monto === "otro" && !(+$("inMonto").value > 0);
    $("btnPersona").setAttribute("aria-disabled", falta ? "true" : "false");
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      monto = c.dataset.monto;
      chips.forEach(function (o) { o.setAttribute("aria-pressed", o === c ? "true" : "false"); });
      $("montoLibre").hidden = monto !== "otro";
      if (monto === "otro") $("inMonto").focus();
      pintarPersona();
    });
  });
  $("inMonto").addEventListener("input", pintarPersona);
  $("inNombre").addEventListener("input", pintarPersona);
  pintarPersona();

  /* ── 08 y 10 · conectar ────────────────────────────────── */
  $("btnVoluntario").href = wa("Hola, quiero ser voluntario en El Compartir 2026 (6 de diciembre). ¿Cómo puedo ayudar?");
  $("btnPresentar").href = wa("Hola, conozco a una persona que podría colaborar con El Compartir 2026. Te cuento:");
  $("lnkWa").href = wa("Hola, Gabriel. Vi la presentación de El Compartir 2026 y quiero conversar sobre cómo sumarme.");

  function compartir() {
    var texto = "El 6 de diciembre, El Compartir La Italiana lleva comida, juegos y juguetes a 350 niños de La Aduana de Cerro Verde, Yaracuy. Mira cómo sumarte:";
    if (navigator.share) { navigator.share({ title: "Súmate a El Compartir 2026", text: texto, url: enlace }).catch(function () {}); return; }
    var hecho = function () { aviso("Enlace copiado. Pégalo donde quieras."); };
    if (navigator.clipboard) navigator.clipboard.writeText(texto + " " + enlace).then(hecho, function () { window.open("https://wa.me/?text=" + encodeURIComponent(texto + " " + enlace), "_blank", "noopener"); });
    else window.open("https://wa.me/?text=" + encodeURIComponent(texto + " " + enlace), "_blank", "noopener");
  }
  todos("[data-compartir]").forEach(function (b) { b.addEventListener("click", compartir); });
  $("btnCompartirBarra").addEventListener("click", compartir);

  /* ── arranque ──────────────────────────────────────────── */
  var n0 = parseInt(location.hash.slice(1), 10);
  ir(n0 >= 1 && n0 <= N ? n0 - 1 : 0, true);
})();
