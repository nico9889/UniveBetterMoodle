// ==UserScript==
// @name     Make Unive Moodle Great Again
// @description Rende Moodle un posto migliore con tante piccole modifiche :). Attenzione: questo script per il corretto funzionamento salva il NOME DEI CORSI che apri su Moodle nella memoria locale del tuo browser. Questi sono POTENZIALMENTE accessibili da altri script di terze parti che agiscono sulla pagina di Moodle. Fai sempre attenzione a quello che installi, è tua responsabilità proteggere i dati che ritieni sensibili.
// @version  1.5.1
// @updateURL https://raw.githubusercontent.com/nico9889/UniveBetterMoodle/master/mumga.user.js
// @match       *://moodle.unive.it/*
// @grant    none
// ==/UserScript==

// Aggiunge in intestazione del corso il nome del corso
let h = document.createElement("H1");
let bold = document.createElement('strong');
let name = document.title;
let doc = document.querySelector('div[role="main"]');
name.fontsize(16);
h.innerHTML=name;
bold.appendChild(h);
doc.prepend(bold);

// Carico la lista delle materie che conosco, se non c'è allora è vuota
let sub = JSON.parse(localStorage.getItem("sub")) || [];

let url = document.location.href;
let view = url.includes("view.php?id=");

// Ricava il nome del corso se la pagina è valida
if(view){
    let id = url.substring(url.indexOf("id=")+3);
    let check = false;
    sub.forEach(function(s){
        if(s.id===id) {
            check = true;
        }
    });

    // Salva il nome del corso in un dizionario
    if(!check){
        sub.push({
            id: id,
            title: document.title
        });
    }
}

// Per ogni materia in lista, cerca l'ID corrispondente nella pagina, se lo trova ne cambia
// vuol dire che è presente nella barra laterale e ne cambia il testo interno da codice a nome
sub.forEach(function(s){
    let a = document.querySelector('a[data-key="'+s.id+'"]');
    if(a!=null){
        a.children[0].children[0].children[1].innerHTML=s.title;

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
            let name_div = document.getElementById("div-name-"+s.id);
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
        name_input.setAttribute("id","name-"+s.id);
        name_input.addEventListener("click", function(event) {
            event.preventDefault();
        }, false);
        div_name.setAttribute("id","div-name-"+s.id);
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
            edit_name(s.id, name_input.value);
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

// Salva la lista dei corsi
localStorage.setItem("sub", JSON.stringify(sub));

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

// Crea il pulsante per chiudere la chat
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

// Utils

// Previene l'apertura di un link in un determinato elemento cliccato
let prevent_href = function(e) {
    e.preventDefault();
};

// Individua il nome nello pseudo-dizionario di nomi salvati
// lo modifica e lo salva
let edit_name = function(id, name) {
    let i = 0;
    while(i<sub.length && sub[i].id!==id){
        i++;
    }
    if(i<sub.length){
        let a = document.querySelector('a[data-key="'+id+'"]');
        a.children[0].children[0].children[1].innerHTML=name;
        sub[i].title = name;
    }
    localStorage.setItem("sub", JSON.stringify(sub));
};
