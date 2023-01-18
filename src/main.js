/// <reference path="ace_patch.d.ts"/>

//TODO: snippets
//TODO: formatting
//TODO: custom colors

import Split from "split.js";
import Tabby from "tabbyjs";
import * as iro from "irojs";

import sampleGrammar from "./sample.iro";
import samplePreview from "./sample.txt";

import "./style/main.scss";

//TODO: settings screen
var config = {
    compile_delay: 10,
    auto_save: false,
};
//TODO: multiple projects
/**@type {Map<string, [string, string]>} */
var projects = new Map();

document.body.classList.remove("skeleton");

var panes = Split(["#left", "#right"], {
    // minSize: 200,
    gutterSize: 9,
});
var tabs = new Tabby("#tabs");
window["panes"] = panes;
window["tabs"] = tabs;

function openHelp() {
    window.open("https://web.archive.org/web/20191007073218/https://eeyo.io/iro/documentation/index.html", "_blank");
}
document.querySelector("#toolbar .help").addEventListener("click", openHelp);
document.querySelector("#toolbar .help").addEventListener("auxclick", openHelp);

/**
 * @param {string} id
 * @param {AceAjax.Options} [options]
 */
const aceInit = (id, options) => ace.edit(id, Object.assign({ theme: "ace/theme/monokai" }, options));
//TODO: token & scopes marker popup (https://codepen.io/oatssss/pen/oYxJQV?editors=0010)
var editor = aceInit("editor", {
    mode: "ace/mode/rion",
    useSoftTabs: false,
    tabSize: 4,
});
var tab_preview = aceInit("preview");
//TODO: display textmate's xml and json versions
var tab_textmate = aceInit("textmate", { useWorker: false, mode: "ace/mode/json", readOnly: true });
var tab_ace = aceInit("ace", { useWorker: false, mode: "ace/mode/javascript", readOnly: true });

window["editor"] = editor;
window["tab_preview"] = tab_preview;
window["tab_textmate"] = tab_textmate;
window["tab_ace"] = tab_ace;

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        save();
    }
});
var saveAnimation;
const saveSaveIcon = document.querySelector("#toolbar .save .la-save");
const saveCheckIcon = document.querySelector("#toolbar .save .la-check");
function save() {
    localStorage.setItem("version", EDITORVERSION);
    for (let [prj, data] of projects.entries()) {
        localStorage.setItem(prj + ":editor", editor.getValue());
        localStorage.setItem(prj + ":sample", tab_preview.getValue());
    }
    console.log("Saved document");

    //TODO: css animation
    saveSaveIcon.style = "display: none;";
    saveCheckIcon.style = "";
    clearTimeout(saveAnimation);
    saveAnimation = setTimeout(() => {
        saveSaveIcon.style = "";
        saveCheckIcon.style = "display: none;";
    }, 1000);
}
function restore() {
    var list = localStorage.getItem("projects");
    if (!list) {
        list = ["main"];
        projects.set("main", [sampleGrammar, samplePreview]);
    } else {
        for (let p of list) {
            projects.set(p, [localStorage.getItem(p + ":editor"), localStorage.getItem(p + ":sample")]);
        }
    }
    editorChangeIgnore = true;
    editor.setValue(projects.get("main")[0], -1);
    editor.session.getUndoManager().reset();
    editor.session.setAnnotations();
    tab_preview.setValue(projects.get("main")[1], -1);
    tab_preview.session.getUndoManager().reset();
}

const Status = {
    Ok: 0,
    InProgress: 1,
    Error: 2,
    Warning: 3,
};
const toolbar = document.querySelector("#toolbar");
const compilationIcon = document.querySelector("#toolbar .compile i");
function setStatus(status) {
    var isFatal = false;
    switch (status) {
        case Status.InProgress:
            compilationIcon.className = "las la-circle-notch la-spin";
            break;
        case Status.Ok:
            toolbar.classList.remove("error");
            toolbar.classList.remove("warning");
            compilationIcon.className = "las la-play";
            break;
        case Status.Error:
            isFatal = true;
        case Status.Warning:
            isFatal = false;
        case Status.Error:
        case Status.Warning:
            toolbar.classList.toggle("error", isFatal);
            toolbar.classList.toggle("warning", !isFatal);
            compilationIcon.className = "las la-exclamation-" + (isFatal ? "circle" : "triangle");
    }
}

var editorChangeIgnore = false;
editor.on("change", (e) => {
    if (editorChangeIgnore) {
        editorChangeIgnore = false;
        return;
    }
    setStatus(Status.InProgress);
    clearTimeout(changedTimeout);
    changedTimeout = setTimeout(compile, config.compile_delay);
});
document.querySelector("#toolbar .compile").addEventListener("click", () => {
    setStatus(Status.InProgress);
    clearTimeout(changedTimeout);
    setTimeout(compile);
});
var changedTimeout;
var errorMarkers = [];
//TODO: use worker
function compile() {
    try {
        // var currentTab = document.querySelector('#tabs a[aria-selected="true"]').attributes.href.value;
        var result = iro.compile(editor.getValue(), { targets: ["textmate", "ace"] });
        editor.session.clearAnnotations();
        editor.session.setAnnotations(
            result.errors.map((e) => ({
                row: e.location.start.line - 1,
                column: e.location.start.column,
                text: e.message,
                type: e.fatal ? "error" : "warning",
            }))
        );
        var session = editor.getSession();
        errorMarkers.forEach((m) => session.removeMarker(m));
        errorMarkers = [];
        for (let e of result.errors) {
            let {
                location: { start, end },
            } = e;
            let range = new ace.Range(
                start.line - 1,
                start.column,
                end.line - 1,
                start.offset == end.offset ? start.column + 1 : end.column
            );
            range.start = session.doc.createAnchor(range.start);
            range.end = session.doc.createAnchor(range.end);
            var type = e.fatal ? "error" : "warning";
            errorMarkers.push(session.addMarker(range, type + "-squiggle"));
        }
        var isFatal = !!result.errors.find((e) => e.fatal);
        if (result.errors.length > 0) setStatus(isFatal ? Status.Error : Status.Warning);
        else setStatus(Status.Ok);
        if (!isFatal) {
            var aceScript = result.makeAceHighlighter({ spacing: 4 });
            updateMode(aceScript, result.ace.name);
            tab_textmate.setValue(JSON.stringify(result.textmate, null, 4), -1);
            tab_ace.setValue(aceScript, -1);
        }
    } catch (e) {
        console.error(e);
        setStatus(Status.Error);
    }
}

/**
 * @param {string} mode
 * @param {string} name
 */
function updateMode(mode, name) {
    var script = mode
        .replace("define(", 'define("ace/mode/new_highlight_rules",')
        .replace(new RegExp(name + "HighlightRules", "g"), "HighlightRules");
    delete define.modules["ace/mode/new_highlight_rules"];
    delete define.modules["ace/mode/new"];
    delete tab_preview.session.$modes["ace/mode/new"];
    // delete define.payloads["ace/mode/new_highlight_rules"];
    // delete define.payloads["ace/mode/new"];
    (0, eval)(script);
    define("ace/mode/new", [
        "require",
        "exports",
        "module",
        "ace/lib/oop",
        "ace/mode/text",
        "ace/mode/new_highlight_rules",
    ], function (require, exports, module) {
        "use strict";
        var oop = require("../lib/oop");
        var TextMode = require("./text").Mode;
        var HighlightRules = require("./new_highlight_rules").HighlightRules;
        var Mode = function () {
            this.HighlightRules = HighlightRules;
        };
        oop.inherits(Mode, TextMode);
        (function () {
            this.lineCommentStart = "#";
            this.$id = "ace/mode/new";
        }.call(Mode.prototype));
        exports.Mode = Mode;
    });
    tab_preview.session.setMode();
    tab_preview.session.setMode("ace/mode/new");
}

document.querySelector(".version").textContent = "v" + IROVERSION;
restore();
compile();
