// ==UserScript==
// @name     Make Unive Moodle Great Again
// @description Rende Moodle un posto migliore con tante piccole modifiche :)
// @version  2.0.0
// @updateURL https://raw.githubusercontent.com/nico9889/UniveBetterMoodle/master/mumga.user.js
// @match       *://moodle.unive.it/*
// @grant    none
// ==/UserScript==

let sub = new Map();
let favourites = [];
let current_course = undefined;

function load_subject() {
    // Carico la lista delle materie che conosco, se non c'è allora è vuota
    sub = new Map(JSON.parse(localStorage.getItem("mumga-sub"))) || new Map();
    favourites = JSON.parse(localStorage.getItem("mumga-fav")) || [];
    console.log(favourites);
}

function generate_favourites(){
    const favourites_elements = document.createElement("ul");
    for(const favourite of favourites){
        const favourite_entry = document.createElement("li");
        const favourite_link = document.createElement("a");
        favourite_link.setAttribute("href", "https://moodle.unive.it/course/view.php?id=" + favourite);
        favourite_entry.appendChild(favourite_link);
        favourites_elements.appendChild(favourite_entry);
        favourite_link.innerText = sub.get(favourite.toString()) || favourite;
    }
    return favourites_elements;
}

function set_favourite_menu() {
    const notifications = document.getElementById("nav-notification-popover-container");

    let showed = false;

    const fav_container = document.createElement("div");
    fav_container.setAttribute("class", "popover-region collapsed");
    fav_container.setAttribute("data-region", "popover-region-favourites");

    const fav_toggler = document.createElement("div");
    fav_toggler.setAttribute("class", "popover-region-toggle nav-link");
    fav_toggler.setAttribute("data-region", "popover-region-toggle");
    fav_toggler.setAttribute("role", "button");
    fav_toggler.setAttribute("aria-controls", "mumga-favourites");

    const fav_icon = document.createElement("i");
    fav_icon.setAttribute("class", "fa fa-star fa-fw");
    fav_icon.setAttribute("title", "Mostra corsi preferiti (Feature non ufficiale!)");
    fav_icon.setAttribute("aria-label", "Mostra corsi preferiti (Feature non ufficiale!)");

    const fav_menu = document.createElement("div");
    fav_menu.setAttribute("id", "mumga-favourites");
    fav_menu.setAttribute("class", "popover-region-container");
    fav_menu.setAttribute("role", "region");
    fav_menu.setAttribute("aria-expaneded", "false");
    fav_menu.setAttribute("aria-hidden", "true");

    const fav_header = document.createElement("div");
    fav_header.setAttribute("class", "popover-region-header-container");

    const fav_title = document.createElement("h3");
    fav_title.setAttribute("class", "popover-region-header-text");
    fav_title.setAttribute("data-region", "popover-region-header-text");
    fav_title.innerText = "Corsi preferiti - Feature non ufficiale :)";

    const fav_content = document.createElement("div");
    fav_content.setAttribute("class", "popover-region-content-container")


    fav_toggler.onclick = function(){
        if(!showed) {
            fav_container.setAttribute("class", "popover-region");
            fav_content.innerHTML = "";
            fav_content.appendChild(generate_favourites());
        }else{
            fav_container.setAttribute("class", "popover-region collapsed");
        }
        showed = !showed;
    }

    fav_header.appendChild(fav_title);
    fav_menu.appendChild(fav_header);
    fav_menu.appendChild(fav_content);

    fav_toggler.appendChild(fav_icon);
    fav_container.appendChild(fav_toggler);
    fav_container.appendChild(fav_menu);
    notifications.parentElement.prepend(fav_container);
}

function get_subject_name() {
    const url = new URL(document.location.href);
    const id = url.searchParams.get("id");
    if (id) {
        if (id.match(/^[0-9]+$/)) {
            current_course = id;
            // Salva il nome del corso in un dizionario
            if (!sub.has(id)) {
                sub.set(id, document.title);
            }
        }
    }else{
        current_course = undefined;
    }
}


// Per ogni materia in lista, cerca l'ID corrispondente nella pagina, se lo trova ne cambia
// vuol dire che è presente nella barra laterale e ne cambia il testo interno da codice a nome
function update_subject_navigation() {
    sub.forEach(function (title, id) {
        let a = document.querySelector('a[data-key="' + id + '"]');
        if (a != null) {
            a.children[0].children[0].children[1].innerHTML = title;

            // Aggiungo icona per editare il nome
            const edit_icon = document.createElement("i");
            const edit_icon_click = document.createElement("a");
            const div_icon = document.createElement("div");
            edit_icon.setAttribute("class", "fa fa-edit fa-lg");
            edit_icon.setAttribute("aria-hidden", "true");
            edit_icon_click.setAttribute("class", "nav-link");
            edit_icon_click.setAttribute("role", "button");
            edit_icon_click.setAttribute("href", "#");
            edit_icon_click.addEventListener("click", function () {
                let name_div = document.getElementById("div-name-" + id);
                name_div.hidden = !name_div.hidden;
            }, false);
            edit_icon_click.appendChild(edit_icon);
            div_icon.appendChild(edit_icon_click);
            a.children[0].children[0].appendChild(div_icon);

            // Aggiungo campo nascosto per editare il nome
            const name_input = document.createElement("input");
            const div_name = document.createElement("div");
            name_input.setAttribute("type", "text");
            name_input.setAttribute("placeholder", "Modifica nome corso");
            name_input.setAttribute("id", "name-" + id);
            name_input.addEventListener("click", function (event) {
                event.preventDefault();
            }, false);
            div_name.setAttribute("id", "div-name-" + id);
            div_name.setAttribute("class", "row");
            div_name.hidden = true;
            div_name.appendChild(name_input);
            a.children[0].appendChild(div_name);

            // Aggiungo icona per confermare l'input
            const confirm_icon = document.createElement("i");
            const confirm_icon_click = document.createElement("a");
            confirm_icon.setAttribute("class", "fa fa-check fa-lg");
            confirm_icon.setAttribute("aria-hidden", "true");
            confirm_icon_click.setAttribute("class", "nav-link");
            confirm_icon_click.setAttribute("role", "button");
            confirm_icon_click.setAttribute("href", "#");
            confirm_icon_click.addEventListener("click", function () {
                edit_name(id, name_input.value);
            }, false);
            confirm_icon_click.appendChild(confirm_icon);
            div_name.appendChild(confirm_icon_click);

            // Cambio colore icone se la materia è selezionata
            if (a.classList.contains("active")) {
                edit_icon.style.color = "white";
                confirm_icon.style.color = "white";
                confirm_icon.style["text-shadow"] = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
                edit_icon.style["text-shadow"] = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
            }
        }
    });
}


function save_subject() {
    // Salva la lista dei corsi
    localStorage.setItem("mumga-sub", JSON.stringify(Array.from(sub.entries())));
}


function set_wider_subject_navigation() {
    const e = document.body;

    // Scala la barra di navigazione laterale per fare spazio al testo
    let observer = new MutationObserver(function () {
        if (document.body.classList.contains("drawer-open-left")) {
            document.body.style.marginLeft = "400px";
            document.getElementById("nav-drawer").style.width = "400px";
        } else {
            document.body.style.marginLeft = "0px";
            document.getElementById("nav-drawer").style.width = "0px";
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
function add_close_chat_button() {
    const bar = document.getElementsByClassName("border-bottom p-1 px-sm-2 py-sm-3");
    if (bar !== null) {
        const icon = document.createElement("i");
        const icon_click = document.createElement("a");
        const div_icon = document.createElement("div");
        icon.setAttribute("class", "fa fa-times");
        icon.setAttribute("aria-hidden", "true");
        icon_click.setAttribute("class", "nav-link");
        icon_click.setAttribute("role", "button");
        icon_click.setAttribute("href", "#");
        icon_click.addEventListener("click", function () {
            // Propaga il click al pulsante originale, che finisce sotto il menu della chat
            document.getElementsByClassName("nav-link d-inline-block popover-region-toggle position-relative")[0].click();
        });
        icon_click.appendChild(icon);
        div_icon.appendChild(icon_click);
        bar[0].children[0].appendChild(div_icon);
    }
}


// Previene l'apertura di un link in un determinato elemento cliccato
let prevent_href = function (e) {
    e.preventDefault();
};


// Individua il nome nello pseudo-dizionario di nomi salvati
// lo modifica e lo salva
let edit_name = function (id, name) {
    if (sub.has(id)) {
        const a = document.querySelector('a[data-key="' + id + '"]');
        if (name) {
            a.children[0].children[0].children[1].innerHTML = name;
            sub.set(id, name);
            save_subject();
        }
    }
};

function toggle_favourite(){
    if(current_course) {
        let course = favourites.find((course) => {
            return course.toString() === current_course.toString()
        });
        if (course){
            favourites = favourites.filter((course) => {
                return course.toString() !== current_course.toString()
            })
        }else {
            favourites.push(current_course);
        }
        localStorage.setItem("mumga-fav", JSON.stringify(favourites));
    }
}

function set_toggle_favourite(){
    const course_content = document.getElementsByClassName("course-content");
    if (course_content) {
        const label = document.createElement("a");
        label.setAttribute("role", "button");

        const icon = document.createElement("i");

        function set_icon(){
            if (favourites.includes(current_course.toString())) {
                icon.setAttribute("class", "fa fa-times");
                label.text = "Rimuovi dai preferiti";
            }else{
                icon.setAttribute("class", "fa fa-star");
                label.text = "Aggiungi ai preferiti";
            }
            label.prepend(icon);
        }

        set_icon();

        label.onclick = () => {
            toggle_favourite();
            set_icon();
        };


        course_content[0].prepend(label);
    }
}


//set_subject_title();
load_subject();
get_subject_name();
update_subject_navigation();
save_subject();
set_wider_subject_navigation();
add_close_chat_button();
set_toggle_favourite();
set_favourite_menu();
console.log("MUMGA - Tweaks loaded");