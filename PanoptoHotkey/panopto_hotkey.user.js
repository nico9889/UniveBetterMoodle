// ==UserScript==
// @name     Unive Panopto Hotkey
// @description Aggiunge il supporto delle Hotkey a Panopto
// @version  1.0.0
// @updateURL   https://github.com/nico9889/UniveBetterMoodle/raw/master/PanoptoHotkey/panopto_hotkey.user.js
// @match       *://unive.cloud.panopto.eu/*
// @grant    none
// ==/UserScript==

(function () {
    'use strict';

    function timeToSeconds(time) {
        let splittedTime = time.split(":").reverse();
        let seconds = 0;
        let convertedTime = 0;
        for (let i = 0; i < splittedTime.length; i++) {
            convertedTime = parseInt(splittedTime[i]);
            if (convertedTime < 0) {
                convertedTime = -convertedTime;
            }
            seconds += convertedTime * Math.pow(60, i);
        }
        return seconds;
    }

    let timeRemaining = document.getElementById("timeRemaining");

    let completeTime = timeToSeconds(timeRemaining.innerText);

    function getRemainingTime() {
        let seconds = timeToSeconds(timeRemaining.innerText);
        if (seconds < 0) {
            completeTime = seconds;
        }
        return completeTime - seconds;
    }

    function getSpeedMultiplier() {
        let playSpeedMultiplier = document.getElementById("playSpeedMultiplier");
        switch (playSpeedMultiplier.innerText) {
            case "0,5x":
                return 0.5;
            case "0,75x":
                return 0.75;
            case "1,25x":
                console.log("test");
                return 1.25;
            case "1,5x":
                return 1.5;
            case "1,75x":
                return 1.75;
            case "2x":
                return 2.00;
            default:
                return 1.00;
        }
        let positionObserver = new MutationObserver(function () {
            if ('setPositionState' in navigator.mediaSession) {
                navigator.mediaSession.setPositionState({
                    duration: completeTime,
                    playbackRate: getSpeedMultiplier(),
                    position: getRemainingTime(),
                });
            }
        });
        navigator.mediaSession.metadata = new MediaMetadata({
            title: document.title,
            artist: "",
            album: "",
            artwork: [{
                src: "https://d2hpwsdp0ihr0w.cloudfront.net/sessions/_branding/b1ab06ae-c65b-4dd7-8f95-ac0000a0cd7f/637310098705478668_smalllogo.png",
                sizes: '124x124',
                type: 'image/png'
            }]
        });
        navigator.mediaSession.setActionHandler('play', function () {
            let playButton = document.getElementById("playButton");
            playButton.click();
            if (playButton.classList.contains("paused")) {
                playButton.classList.remove("paused");
                navigator.mediaSession.playbackState = "playing";
            } else {
                playButton.classList.add("paused");
                navigator.mediaSession.playbackState = "paused";
            }
        });
    }
})();