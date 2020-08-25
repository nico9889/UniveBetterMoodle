// ==UserScript==
// @name     Make Unive Moodle Great Again
// @version  1
// @match       *://moodle.unive.it/*
// @grant    none
// ==/UserScript==

// document.title
let h = document.createElement("H1");                 // Creo un'intestazione
let bold = document.createElement('strong');          // in grossetto
let name = document.title;                            // col nome della materia (titolo della pagina)
let doc = document.querySelector('div[role="main"]'); // che faccia parte della pagina del corso
name.fontsize(16);                                    // e sia ben visibile
h.innerHTML=name;                                     // e concateno il tutto per aggiungerlo
bold.appendChild(h);                                  // TL;DR aggiungo come titolo il nome
doc.prepend(bold);                                    // del corso    

let sub = JSON.parse(localStorage.getItem("sub"));  // Carico una lista delle materie conosciute

if(sub===null){                                     // Se non posso caricarla, questa lista viene creata 
  sub = [];                                         // nuova, vuota
}

let url = document.location.href;                   // Url della pagina
let view = url.includes("view.php?id=")             // Controllo se è una pagina di un corso

if(view){                                           // Se viene aperta una pagina del corso
   let id = url.substring(url.indexOf("id=")+3);    // viene salvato l'ID
   let check = false;
   sub.forEach(function(s){                         // Viene controllato se l'ID lo conosciamo già
     if(s.id===id) {                                // perché salvato nella lista delle materie
       check = true;
     }
   });
   if(!check){                                      // Se non lo conosciamo, salviamo l'ID assieme
	    sub.push({                                    // al titolo della pagina, che corrisponde al nome
         id: id,                                    // del corso
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
  }
});

// Salva la lista dei corsi
localStorage.setItem("sub", JSON.stringify(sub));

// Corpo della pagina
let e = document.body;

// Scala la barra di navigazione laterale per fare spazio al testo
let observer = new MutationObserver(function (event) {
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
