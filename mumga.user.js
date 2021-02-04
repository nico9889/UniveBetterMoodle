// ==UserScript==
// @name     Make Unive Moodle Great Again
// @description Rende Moodle un posto migliore con tante piccole modifiche :)
// @version  1.6.2
// @updateURL https://raw.githubusercontent.com/nico9889/UniveBetterMoodle/master/mumga.user.js
// @match       *://moodle.unive.it/*
// @grant    none
// ==/UserScript==

let sub = new Map();
// Aggiunge in intestazione del corso il nome del corso
/* Siamo nel futuro, è stato aggiunto come feature di default!
function set_subject_title(){
  let h = document.createElement("H1");
  let bold = document.createElement('strong');
  let name = document.title;
  let doc = document.querySelector('div[role="main"]');
  name.fontsize(16);
  h.innerHTML=name;
  bold.appendChild(h);
  doc.prepend(bold);
}
*/

function load_subject(){
  // Carico la lista delle materie che conosco, se non c'è allora è vuota
  sub = new Map(JSON.parse(localStorage.getItem("mumga-sub"))) || new Map();
}

function get_subject_name(){
  let url = document.location.href;
  let view = url.includes("view.php?id=");

  // Ricava il nome del corso se la pagina è valida
  if(view){
      let id = url.substring(url.indexOf("id=")+3);
  	let numbers = /^[0-9]+$/;
  	if(id.match(numbers)){
  		// Salva il nome del corso in un dizionario
  		if(!sub.has(id)){
  			sub.set(id, document.title);
  		}
  	}
  }
}

// Per ogni materia in lista, cerca l'ID corrispondente nella pagina, se lo trova ne cambia
// vuol dire che è presente nella barra laterale e ne cambia il testo interno da codice a nome
function update_subject_navigation(){
    sub.forEach(function(title, id){
    let a = document.querySelector('a[data-key="'+id+'"]');
    if(a!=null){
        a.children[0].children[0].children[1].innerHTML=title;

        // Aggiungo icona per editare il nome
        let edit_icon = document.createElement("i");
        let edit_icon_click = document.createElement("a");
        let div_icon = document.createElement("div");
        edit_icon.setAttribute("class", "fa fa-edit fa-lg");
        edit_icon.setAttribute("aria-hidden","true");
        edit_icon_click.setAttribute("class","nav-link");
        edit_icon_click.setAttribute("role","button");
        edit_icon_click.setAttribute("href","#");
        edit_icon_click.addEventListener("click", function(){
            let name_div = document.getElementById("div-name-"+id);
            name_div.hidden = !name_div.hidden;
        }, false);
        edit_icon_click.appendChild(edit_icon);
        div_icon.appendChild(edit_icon_click);
        a.children[0].children[0].appendChild(div_icon);

        // Aggiungo campo nascosto per editare il nome
        let name_input = document.createElement("input");
        let div_name = document.createElement("div");
        name_input.setAttribute("type", "text");
        name_input.setAttribute("placeholder", "Modifica nome corso");
        name_input.setAttribute("id","name-"+id);
        name_input.addEventListener("click", function(event) {
            event.preventDefault();
        }, false);
        div_name.setAttribute("id","div-name-"+id);
        div_name.setAttribute("class","row");
        div_name.hidden = true;
        div_name.appendChild(name_input);
        a.children[0].appendChild(div_name);

        // Aggiungo icona per confermare l'input
        let confirm_icon = document.createElement("i");
        let confirm_icon_click = document.createElement("a");
        confirm_icon.setAttribute("class", "fa fa-check fa-lg");
        confirm_icon.setAttribute("aria-hidden","true");
        confirm_icon_click.setAttribute("class","nav-link");
        confirm_icon_click.setAttribute("role","button");
        confirm_icon_click.setAttribute("href","#");
        confirm_icon_click.addEventListener("click", function(){
            edit_name(id, name_input.value);
        }, false);
        confirm_icon_click.appendChild(confirm_icon);
        div_name.appendChild(confirm_icon_click);

        // Cambio colore icone se la materia è selezionata
        if(a.classList.contains("active")){
            edit_icon.style.color = "white";
            confirm_icon.style.color = "white";
            confirm_icon.style["text-shadow"] = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
            edit_icon.style["text-shadow"] = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
        }
    }
  });
}

function save_subject(){
  // Salva la lista dei corsi
  localStorage.setItem("mumga-sub", JSON.stringify(Array.from(sub.entries())));
}

function set_wider_subject_navigation(){
  let e = document.body;

  // Scala la barra di navigazione laterale per fare spazio al testo
  let observer = new MutationObserver(function () {
      if(document.body.classList.contains("drawer-open-left")){
          document.body.style.marginLeft="400px";
          document.getElementById("nav-drawer").style.width="400px";
      }else{
          document.body.style.marginLeft="0px";
          document.getElementById("nav-drawer").style.width="0px";
      }
  });

  // Controlla quando viene aperta la barra laterale
  observer.observe(e, {
      attributes: true,
      attributeFilter: ['class'],
      childList: false,
      characterData: false
  });
}
// Crea il pulsante per chiudere la chat
function add_close_chat_button(){
  let bar = document.getElementsByClassName("border-bottom p-1 px-sm-2 py-sm-3");
  if(bar!==null){
      let icon = document.createElement("i");
      let icon_click = document.createElement("a");
      let div_icon = document.createElement("div");
      icon.setAttribute("class", "fa fa-times");
      icon.setAttribute("aria-hidden","true");
      icon_click.setAttribute("class","nav-link");
      icon_click.setAttribute("role","button");
      icon_click.setAttribute("href","#");
      icon_click.addEventListener("click",function() {
          // Propaga il click al pulsante originale, che finisce sotto il menu della chat
          document.getElementsByClassName("nav-link d-inline-block popover-region-toggle position-relative")[0].click();
      });
      icon_click.appendChild(icon);
      div_icon.appendChild(icon_click);
      bar[0].children[0].appendChild(div_icon);
  }
}
// Utils

// Previene l'apertura di un link in un determinato elemento cliccato
let prevent_href = function(e) {
    e.preventDefault();
};

// Individua il nome nello pseudo-dizionario di nomi salvati
// lo modifica e lo salva
let edit_name = function(id, name) {
    console.log("'" + name + "'");
    if(sub.has(id)){
        let a = document.querySelector('a[data-key="'+id+'"]');
        if(name){
          a.children[0].children[0].children[1].innerHTML=name;
          sub.set(id, name);
          save_subject();
        }
    }
};


//set_subject_title();
load_subject();
get_subject_name();
update_subject_navigation();
save_subject();
set_wider_subject_navigation();
add_close_chat_button();
console.log("MUMGA - Tweaks loaded");