"use strict";
! function() {
    function a() {
        var a = angular.injector(["ng"]).get("$http"),
            b = angular.injector(["zeppelinWebApp"]).get("baseUrlSrv");
        return a.defaults.withCredentials = !0, a.get(b.getRestApiBase() + "/security/ticket").then(function(a) {
            c.run(["$rootScope", function(b) {
                b.ticket = angular.fromJson(a.data).body
            }])
        }, function(a) {})
    }

    function b() {
        angular.bootstrap(document, ["zeppelinWebApp"])
    }
    var c = angular.module("zeppelinWebApp", ["ngCookies", "ngAnimate", "ngRoute", "ngSanitize", "angular-websocket", "ui.ace", "ui.bootstrap", "as.sortable", "ngTouch", "ngDragDrop", "angular.filter", "monospaced.elastic", "puElasticInput", "xeditable", "ngToast", "focus-if", "ngResource"]).filter("breakFilter", function() {
        return function(a) {
            if (a) return a.replace(/\n/g, "<br />")
        }
    }).config(["$httpProvider", "$routeProvider", "ngToastProvider", function(a, b, c) {
        a.defaults.withCredentials = !0, b.when("/", {
            templateUrl: "app/home/home.html"
        }).when("/notebook/:noteId", {
            templateUrl: "app/notebook/notebook.html",
            controller: "NotebookCtrl"
        }).when("/notebook/:noteId/paragraph?=:paragraphId", {
            templateUrl: "app/notebook/notebook.html",
            controller: "NotebookCtrl"
        }).when("/notebook/:noteId/paragraph/:paragraphId?", {
            templateUrl: "app/notebook/notebook.html",
            controller: "NotebookCtrl"
        }).when("/interpreter", {
            templateUrl: "app/interpreter/interpreter.html",
            controller: "InterpreterCtrl"
        }).when("/credential", {
            templateUrl: "app/credential/credential.html",
            controller: "CredentialCtrl"
        }).when("/configuration", {
            templateUrl: "app/configuration/configuration.html",
            controller: "ConfigurationCtrl"
        }).when("/search/:searchTerm", {
            templateUrl: "app/search/result-list.html",
            controller: "SearchResultCtrl"
        }).otherwise({
            redirectTo: "/"
        }), c.configure({
            dismissButton: !0,
            dismissOnClick: !1,
            timeout: 6e3
        })
    }]);
    angular.element(document).ready(function() {
        a().then(b)
    })
}(), angular.module("zeppelinWebApp").controller("MainCtrl", ["$scope", "$rootScope", "$window", function(a, b, c) {
    a.looknfeel = "default";
    var d = function() {
        a.asIframe = c.location.href.indexOf("asIframe") > -1
    };
    d(), b.$on("setIframe", function(b, c) {
        b.defaultPrevented || (a.asIframe = c, b.preventDefault())
    }), b.$on("setLookAndFeel", function(b, c) {
        !b.defaultPrevented && c && "" !== c && c !== a.looknfeel && (a.looknfeel = c, b.preventDefault())
    }), b.$on("$routeChangeStart", function(a, c, d) {
        b.$broadcast("setLookAndFeel", "default")
    }), BootstrapDialog.defaultOptions.onshown = function() {
        angular.element("#" + this.id).find(".btn:last").focus()
    }, BootstrapDialog.configDefaultOptions({
        animate: !1
    })
}]), angular.module("zeppelinWebApp").controller("HomeCtrl", ["$scope", "notebookListDataFactory", "websocketMsgSrv", "$rootScope", "arrayOrderingSrv", "$http", "baseUrlSrv", function(a, b, c, d, e, f, g) {
    var h = this;
    h.notes = b, h.websocketMsgSrv = c, h.arrayOrderingSrv = e, h.notebookHome = !1, void 0 !== d.ticket ? h.staticHome = !1 : h.staticHome = !0, a.isReloading = !1;
    var i = function() {
        c.getHomeNotebook()
    };
    i(), a.$on("setNoteContent", function(a, b) {
        b ? (h.note = b, d.$broadcast("setLookAndFeel", "home"), h.viewOnly = !0, h.notebookHome = !0, h.staticHome = !1) : (h.staticHome = !0, h.notebookHome = !1)
    }), a.$on("setNoteMenu", function(b, c) {
        a.isReloadingNotes = !1
    }), a.reloadNotebookList = function() {
        c.reloadAllNotesFromRepo(), a.isReloadingNotes = !0
    }, a.toggleFolderNode = function(a) {
        a.hidden = !a.hidden
    }, angular.element("#loginModal").on("hidden.bs.modal", function(a) {
        d.$broadcast("initLoginValues")
    })
}]), angular.module("zeppelinWebApp").controller("NotebookCtrl", ["$scope", "$route", "$routeParams", "$location", "$rootScope", "$http", "$window", "websocketMsgSrv", "baseUrlSrv", "$timeout", "SaveAsService", function(a, b, c, d, e, f, g, h, i, j, k) {
    function l() {
        angular.isArray(a.permissions.owners) || (a.permissions.owners = a.permissions.owners.split(",")), angular.isArray(a.permissions.readers) || (a.permissions.readers = a.permissions.readers.split(",")), angular.isArray(a.permissions.writers) || (a.permissions.writers = a.permissions.writers.split(","))
    }

    function m(b) {
        var c = 0;
        if (b !== a.role) {
            if ("owners" === a.role)
                for (v = [], c = 0; c < u.length; c++) v[c] = u[c];
            if ("readers" === a.role)
                for (w = [], c = 0; c < u.length; c++) w[c] = u[c];
            if ("writers" === a.role)
                for (x = [], c = 0; c < u.length; c++) x[c] = u[c];
            if (a.role = b, u = [], "owners" === b)
                for (c = 0; c < v.length; c++) u[c] = v[c];
            if ("readers" === b)
                for (c = 0; c < w.length; c++) u[c] = w[c];
            if ("writers" === b)
                for (c = 0; c < x.length; c++) u[c] = x[c]
        }
    }

    function n(b) {
        if (a.permissions) {
            "owners" === b && "string" == typeof a.permissions.owners ? y = a.permissions.owners.split(",") : "readers" === b && "string" == typeof a.permissions.readers ? y = a.permissions.readers.split(",") : "writers" === b && "string" == typeof a.permissions.writers && (y = a.permissions.writers.split(","));
            for (var c = 0; c < y.length; c++) y[c] = y[c].trim()
        }
    }

    function o(b) {
        "owners" === b ? a.permissions.owners = y.join() : "readers" === b ? a.permissions.readers = y.join() : "writers" === b && (a.permissions.writers = y.join())
    }

    function p(b) {
        a.suggestions = [], f.get(i.getRestApiBase() + "/security/userlist/" + b).then(function(b) {
            var c = angular.fromJson(b.data).body;
            for (var d in c) a.suggestions.push(c[d])
        })
    }

    function q() {
        for (var a = 0; a < y.length; a++) u[a] = y[a]
    }
    a.note = null, a.showEditor = !1, a.editorToggled = !1, a.tableToggled = !1, a.viewOnly = !1, a.showSetting = !1, a.looknfeelOption = ["default", "simple", "report"], a.cronOption = [{
        name: "None",
        value: void 0
    }, {
        name: "1m",
        value: "0 0/1 * * * ?"
    }, {
        name: "5m",
        value: "0 0/5 * * * ?"
    }, {
        name: "1h",
        value: "0 0 0/1 * * ?"
    }, {
        name: "3h",
        value: "0 0 0/3 * * ?"
    }, {
        name: "6h",
        value: "0 0 0/6 * * ?"
    }, {
        name: "12h",
        value: "0 0 0/12 * * ?"
    }, {
        name: "1d",
        value: "0 0 0 * * ?"
    }], a.interpreterSettings = [], a.interpreterBindings = [], a.isNoteDirty = null, a.saveTimer = null;
    var r = !1;
    a.suggestions = [], a.selectIndex = -1;
    var s = "",
        t = 0,
        u = [],
        v = [],
        w = [],
        x = [],
        y = [];
    a.role = "", a.$on("setConnectedStatus", function(a, b) {
        r && b && z(), r = !0
    }), a.getCronOptionNameFromValue = function(b) {
        if (!b) return "";
        for (var c in a.cronOption)
            if (a.cronOption[c].value === b) return a.cronOption[c].name;
        return b
    };
    var z = function() {
        h.getNotebook(c.noteId);
        var d = b.current;
        d && setTimeout(function() {
            var b = d.params,
                c = $("#" + b.paragraph + "_container");
            if (c.length > 0) {
                var e = c.offset().top - 103;
                $("html, body").scrollTo({
                    top: e,
                    left: 0
                })
            }
            a.$on("setNoteMenu", function(a, b) {
                z()
            })
        }, 1e3)
    };
    z(), a.focusParagraphOnClick = function(b) {
        if (a.note)
            for (var c = 0; c < a.note.paragraphs.length; c++) {
                var d = a.note.paragraphs[c].id;
                if (jQuery.contains(angular.element("#" + d + "_container")[0], b.target)) {
                    a.$broadcast("focusParagraph", d, 0, !0);
                    break
                }
            }
    }, document.addEventListener("click", a.focusParagraphOnClick), a.keyboardShortcut = function(b) {
        a.viewOnly || a.$broadcast("keyEvent", b)
    }, document.addEventListener("keydown", a.keyboardShortcut), a.removeNote = function(a) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this notebook?",
            callback: function(b) {
                b && (h.deleteNotebook(a), d.path("/#"))
            }
        })
    }, a.exportNotebook = function() {
        var b = JSON.stringify(a.note);
        k.SaveAs(b, a.note.name, "json")
    }, a.cloneNote = function(a) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to clone this notebook?",
            callback: function(b) {
                b && (h.cloneNotebook(a), d.path("/#"))
            }
        })
    }, a.checkpointNotebook = function(a) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Commit notebook to current repository?",
            callback: function(b) {
                b && h.checkpointNotebook(c.noteId, a)
            }
        }), document.getElementById("note.checkpoint.message").value = ""
    }, a.runNote = function() {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Run all paragraphs?",
            callback: function(b) {
                b && _.forEach(a.note.paragraphs, function(a, b) {
                    angular.element("#" + a.id + "_paragraphColumn_main").scope().runParagraph(a.text)
                })
            }
        })
    }, a.saveNote = function() {
        a.note && a.note.paragraphs && (_.forEach(a.note.paragraphs, function(a, b) {
            angular.element("#" + a.id + "_paragraphColumn_main").scope().saveParagraph()
        }), a.isNoteDirty = null)
    }, a.clearAllParagraphOutput = function() {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to clear all output?",
            callback: function(b) {
                b && _.forEach(a.note.paragraphs, function(a, b) {
                    angular.element("#" + a.id + "_paragraphColumn_main").scope().clearParagraphOutput()
                })
            }
        })
    }, a.toggleAllEditor = function() {
        a.editorToggled ? a.$broadcast("openEditor") : a.$broadcast("closeEditor"), a.editorToggled = !a.editorToggled
    }, a.showAllEditor = function() {
        a.$broadcast("openEditor")
    }, a.hideAllEditor = function() {
        a.$broadcast("closeEditor")
    }, a.toggleAllTable = function() {
        a.tableToggled ? a.$broadcast("openTable") : a.$broadcast("closeTable"), a.tableToggled = !a.tableToggled
    }, a.showAllTable = function() {
        a.$broadcast("openTable")
    }, a.hideAllTable = function() {
        a.$broadcast("closeTable")
    }, a.isNoteRunning = function() {
        var b = !1;
        if (!a.note) return !1;
        for (var c = 0; c < a.note.paragraphs.length; c++)
            if ("PENDING" === a.note.paragraphs[c].status || "RUNNING" === a.note.paragraphs[c].status) {
                b = !0;
                break
            }
        return b
    }, a.killSaveTimer = function() {
        a.saveTimer && (j.cancel(a.saveTimer), a.saveTimer = null)
    }, a.startSaveTimer = function() {
        a.killSaveTimer(), a.isNoteDirty = !0, a.saveTimer = j(function() {
            a.saveNote()
        }, 1e4)
    }, angular.element(window).on("beforeunload", function(b) {
        a.killSaveTimer(), a.saveNote()
    }), a.$on("$destroy", function() {
        angular.element(window).off("beforeunload"), a.killSaveTimer(), a.saveNote(), document.removeEventListener("click", a.focusParagraphOnClick), document.removeEventListener("keydown", a.keyboardShortcut)
    }), a.setLookAndFeel = function(b) {
        a.note.config.looknfeel = b, a.setConfig()
    }, a.setCronScheduler = function(b) {
        a.note.config.cron = b, a.setConfig()
    }, a.setCronExecutingUser = function(b) {
        a.note.config.cronExecutingUser = b, a.setConfig()
    }, a.setReleaseResource = function(b) {
        a.note.config.releaseresource = b, a.setConfig()
    }, a.setConfig = function(b) {
        b && (a.note.config = b), h.updateNotebook(a.note.id, a.note.name, a.note.config)
    }, a.sendNewName = function() {
        a.note.name && h.updateNotebook(a.note.id, a.note.name, a.note.config)
    }, a.$on("setNoteContent", function(b, d) {
        a.paragraphUrl = c.paragraphId, a.asIframe = c.asIframe, a.paragraphUrl && (d = B(a.paragraphUrl, d), e.$broadcast("setIframe", a.asIframe)), null === a.note ? a.note = d : C(d), A(), D(E)
    });
    var A = function() {
            a.note.config.looknfeel ? a.viewOnly = "report" === a.note.config.looknfeel : a.note.config.looknfeel = "default", e.$broadcast("setLookAndFeel", a.note.config.looknfeel)
        },
        B = function(a, b) {
            var c = {};
            c.id = b.id, c.name = b.name, c.config = b.config, c.info = b.info, c.paragraphs = [];
            for (var d = 0; d < b.paragraphs.length; d++)
                if (b.paragraphs[d].id === a) {
                    c.paragraphs[0] = b.paragraphs[d], c.paragraphs[0].config || (c.paragraphs[0].config = {}), c.paragraphs[0].config.editorHide = !0, c.paragraphs[0].config.tableHide = !1;
                    break
                }
            return c
        };
    a.$on("insertParagraph", function(b, c, d) {
        for (var e = -1, f = 0; f < a.note.paragraphs.length; f++)
            if (a.note.paragraphs[f].id === c) {
                e = "above" === d ? f : f + 1;
                break
            }
        e < 0 || e > a.note.paragraphs.length || h.insertParagraph(e)
    }), a.$on("moveParagraphUp", function(b, c) {
        for (var d = -1, e = 0; e < a.note.paragraphs.length; e++)
            if (a.note.paragraphs[e].id === c) {
                d = e - 1;
                break
            }
        if (!(d < 0 || d >= a.note.paragraphs.length)) {
            var f = a.note.paragraphs[d].id;
            angular.element("#" + c + "_paragraphColumn_main").scope().saveParagraph(), angular.element("#" + f + "_paragraphColumn_main").scope().saveParagraph(), h.moveParagraph(c, d)
        }
    }), a.$on("moveParagraphDown", function(b, c) {
        for (var d = -1, e = 0; e < a.note.paragraphs.length; e++)
            if (a.note.paragraphs[e].id === c) {
                d = e + 1;
                break
            }
        if (!(d < 0 || d >= a.note.paragraphs.length)) {
            var f = a.note.paragraphs[d].id;
            angular.element("#" + c + "_paragraphColumn_main").scope().saveParagraph(), angular.element("#" + f + "_paragraphColumn_main").scope().saveParagraph(), h.moveParagraph(c, d)
        }
    }), a.$on("moveFocusToPreviousParagraph", function(b, c) {
        for (var d = !1, e = a.note.paragraphs.length - 1; e >= 0; e--) {
            if (d !== !1) {
                a.$broadcast("focusParagraph", a.note.paragraphs[e].id, -1);
                break
            }
            a.note.paragraphs[e].id !== c || (d = !0)
        }
    }), a.$on("moveFocusToNextParagraph", function(b, c) {
        for (var d = !1, e = 0; e < a.note.paragraphs.length; e++) {
            if (d !== !1) {
                a.$broadcast("focusParagraph", a.note.paragraphs[e].id, 0);
                break
            }
            a.note.paragraphs[e].id !== c || (d = !0)
        }
    });
    var C = function(b) {
            b.name !== a.note.name && (a.note.name = b.name), a.note.config = b.config, a.note.info = b.info;
            for (var c, d, e = b.paragraphs.map(function(a) {
                    return a.id
                }), f = a.note.paragraphs.map(function(a) {
                    return a.id
                }), g = e.length, h = f.length, i = 0; i < a.note.paragraphs.length; i++) {
                var j = a.note.paragraphs[i].id;
                if (angular.element("#" + j + "_paragraphColumn_main").scope().paragraphFocused) {
                    d = j;
                    break
                }
            }
            if (g > h)
                for (var k in e) {
                    if (f[k] !== e[k]) {
                        a.note.paragraphs.splice(k, 0, b.paragraphs[k]), c = b.paragraphs[k].id;
                        break
                    }
                    a.$broadcast("updateParagraph", {
                        note: a.note,
                        paragraph: b.paragraphs[k]
                    })
                }
            if (g === h)
                for (var l in e) {
                    var m = b.paragraphs[l];
                    if (f[l] === e[l]) a.$broadcast("updateParagraph", {
                        note: a.note,
                        paragraph: m
                    });
                    else {
                        var n = f.indexOf(e[l]);
                        a.note.paragraphs.splice(n, 1), a.note.paragraphs.splice(l, 0, m), f = a.note.paragraphs.map(function(a) {
                            return a.id
                        })
                    }
                    d === e[l] && (c = d)
                }
            if (g < h)
                for (var o in f)
                    if (f[o] !== e[o]) {
                        a.note.paragraphs.splice(o, 1);
                        break
                    }
            for (var p = 0; p < a.note.paragraphs.length; p++) c === a.note.paragraphs[p].id && (a.note.paragraphs[p].focus = !0)
        },
        D = function(b) {
            f.get(i.getRestApiBase() + "/notebook/interpreter/bind/" + a.note.id).success(function(c, d, e, f) {
                a.interpreterBindings = c.body, a.interpreterBindingsOrig = angular.copy(a.interpreterBindings), b && b()
            }).error(function(a, b, c, d) {})
        },
        E = function() {
            var b, c, d = !1;
            for (b in a.interpreterBindings)
                if (c = a.interpreterBindings[b], c.selected) {
                    d = !0;
                    break
                }
            if (!d) {
                var e = {};
                for (b in a.interpreterBindings) c = a.interpreterBindings[b], e[c.group] || (c.selected = !0, e[c.group] = !0);
                a.showSetting = !0
            }
        };
    a.interpreterSelectionListeners = {
        accept: function(a, b) {
            return !0
        },
        itemMoved: function(a) {},
        orderChanged: function(a) {}
    }, a.openSetting = function() {
        a.showSetting = !0, D()
    }, a.closeSetting = function() {
        G() ? BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Interpreter setting changes will be discarded.",
            callback: function(b) {
                b && a.$apply(function() {
                    a.showSetting = !1
                })
            }
        }) : a.showSetting = !1
    }, a.saveSetting = function() {
        var b = [];
        for (var c in a.interpreterBindings) {
            var d = a.interpreterBindings[c];
            d.selected && b.push(d.id)
        }
        f.put(i.getRestApiBase() + "/notebook/interpreter/bind/" + a.note.id, b).success(function(b, c, d, e) {
            a.showSetting = !1
        }).error(function(a, b, c, d) {})
    }, a.toggleSetting = function() {
        a.showSetting ? a.closeSetting() : (a.openSetting(), a.closePermissions())
    };
    var F = function(b) {
        f.get(i.getRestApiBase() + "/notebook/" + a.note.id + "/permissions").success(function(c, d, e, f) {
            a.permissions = c.body, a.permissionsOrig = angular.copy(a.permissions), b && b()
        }).error(function(a, b, c, d) {})
    };
    a.openPermissions = function() {
        a.showPermissions = !0, F()
    }, a.closePermissions = function() {
        H() ? BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Changes will be discarded.",
            callback: function(b) {
                b && a.$apply(function() {
                    a.showPermissions = !1
                })
            }
        }) : a.showPermissions = !1
    }, a.savePermissions = function() {
        l(), f.put(i.getRestApiBase() + "/notebook/" + a.note.id + "/permissions", a.permissions, {
            withCredentials: !0
        }).success(function(b, c, d, e) {
            F(function() {
                BootstrapDialog.alert({
                    closable: !0,
                    title: "Permissions Saved Successfully!!!",
                    message: "Owners : " + a.permissions.owners + "\n\nReaders : " + a.permissions.readers + "\n\nWriters  : " + a.permissions.writers
                }), a.showPermissions = !1
            })
        }).error(function(a, b, c, d) {
            BootstrapDialog.show({
                closable: !1,
                closeByBackdrop: !1,
                closeByKeyboard: !1,
                title: "Insufficient privileges",
                message: a.message,
                buttons: [{
                    label: "Login",
                    action: function(a) {
                        a.close(), angular.element("#loginModal").modal({
                            show: "true"
                        })
                    }
                }, {
                    label: "Cancel",
                    action: function(a) {
                        a.close(), g.location.replace("/")
                    }
                }]
            })
        })
    }, a.togglePermissions = function() {
        a.showPermissions ? a.closePermissions() : (a.openPermissions(), a.closeSetting())
    };
    var G = function() {
            return !angular.equals(a.interpreterBindings, a.interpreterBindingsOrig)
        },
        H = function() {
            return !angular.equals(a.permissions, a.permissionsOrig)
        },
        I = function() {
            if (0 === u.length) t = y.length - 1;
            else
                for (var a = 0; a < y.length; a++)
                    if (u[a] !== y[a]) {
                        t = a, u = [];
                        break
                    }
            q()
        };
    a.$watch("permissions.owners", _.debounce(function(b) {
        a.$apply(function() {
            a.search("owners")
        })
    }, 350)), a.$watch("permissions.readers", _.debounce(function(b) {
        a.$apply(function() {
            a.search("readers")
        })
    }, 350)), a.$watch("permissions.writers", _.debounce(function(b) {
        a.$apply(function() {
            a.search("writers")
        })
    }, 350)), a.search = function(b) {
        n(b), m(b), I(), a.selectIndex = -1, a.suggestions = [], s = y[t], "" !== s ? p(s) : a.suggestions = []
    };
    var J = function() {
        return (0 === a.suggestions.length && (a.selectIndex < 0 || a.selectIndex >= a.suggestions.length) || 0 !== a.suggestions.length && (a.selectIndex < 0 || a.selectIndex >= a.suggestions.length)) && (y[t] = s, a.suggestions = [], !0)
    };
    a.checkKeyDown = function(b, c) {
        40 === b.keyCode ? (b.preventDefault(), a.selectIndex + 1 !== a.suggestions.length && a.selectIndex++) : 38 === b.keyCode ? (b.preventDefault(), a.selectIndex - 1 !== -1 && a.selectIndex--) : 13 === b.keyCode && (b.preventDefault(), J() || (s = a.suggestions[a.selectIndex], y[t] = a.suggestions[a.selectIndex], q(), o(c), a.suggestions = []))
    }, a.checkKeyUp = function(b) {
        8 === b.keyCode && 46 === b.keyCode || "" === y[t] && (a.suggestions = [])
    }, a.assignValueAndHide = function(b, c) {
        y[t] = a.suggestions[b], q(), o(c), a.suggestions = []
    }, angular.element(document).click(function() {
        angular.element(".userlist").hide(), angular.element(".ace_autocomplete").hide()
    })
}]), angular.module("zeppelinWebApp").controller("InterpreterCtrl", ["$scope", "$route", "$routeParams", "$location", "$rootScope", "$http", "baseUrlSrv", "ngToast", function(a, b, c, d, e, f, g, h) {
    var i = [];
    a.interpreterSettings = [], a.availableInterpreters = {}, a.showAddNewSetting = !1, a.showRepositoryInfo = !1, a._ = _;
    var j = function() {
            f.get(g.getRestApiBase() + "/interpreter/setting").success(function(b, c, d, e) {
                a.interpreterSettings = b.body
            }).error(function(a, b, c, d) {})
        },
        k = function() {
            f.get(g.getRestApiBase() + "/interpreter").success(function(b, c, d, e) {
                a.availableInterpreters = b.body
            }).error(function(a, b, c, d) {})
        },
        l = function(a) {
            angular.extend(a, {
                propertyValue: "",
                propertyKey: ""
            })
        },
        m = function(a) {
            angular.extend(a, {
                depArtifact: "",
                depExclude: ""
            })
        },
        n = function(a) {
            i.splice(a, 1)
        };
    a.copyOriginInterpreterSettingProperties = function(b) {
        var c = _.findIndex(a.interpreterSettings, {
            id: b
        });
        i[c] = angular.copy(a.interpreterSettings[c])
    }, a.setSessionOption = function(b, c) {
        var d;
        if (void 0 === b) d = a.newInterpreterSetting.option;
        else {
            var e = _.findIndex(a.interpreterSettings, {
                    id: b
                }),
                f = a.interpreterSettings[e];
            d = f.option
        }
        "isolated" === c ? (d.perNoteSession = !1, d.perNoteProcess = !0) : "scoped" === c ? (d.perNoteSession = !0, d.perNoteProcess = !1) : (d.perNoteSession = !1, d.perNoteProcess = !1)
    }, a.getSessionOption = function(b) {
        var c;
        if (void 0 === b) c = a.newInterpreterSetting.option;
        else {
            var d = _.findIndex(a.interpreterSettings, {
                    id: b
                }),
                e = a.interpreterSettings[d];
            c = e.option
        }
        return c.perNoteSession ? "scoped" : c.perNoteProcess ? "isolated" : "shared"
    }, a.updateInterpreterSetting = function(b, c) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to update this interpreter and restart with new settings?",
            callback: function(d) {
                if (d) {
                    var e = _.findIndex(a.interpreterSettings, {
                            id: c
                        }),
                        i = a.interpreterSettings[e];
                    ("" !== i.propertyKey || i.propertyKey) && a.addNewInterpreterProperty(c), ("" !== i.depArtifact || i.depArtifact) && a.addNewInterpreterDependency(c), i.option || (i.option = {}), void 0 === i.option.isExistingProcess && (i.option.isExistingProcess = !1), void 0 === i.option.remote && (i.option.remote = !0);
                    var j = {
                        option: angular.copy(i.option),
                        properties: angular.copy(i.properties),
                        dependencies: angular.copy(i.dependencies)
                    };
                    f.put(g.getRestApiBase() + "/interpreter/setting/" + c, j).success(function(b, c, d, f) {
                        a.interpreterSettings[e] = b.body, n(e)
                    }).error(function(a, c, d, e) {
                        h.danger({
                            content: a.message,
                            verticalPosition: "bottom"
                        }), b.$show()
                    })
                }
            }
        })
    }, a.resetInterpreterSetting = function(b) {
        var c = _.findIndex(a.interpreterSettings, {
            id: b
        });
        a.interpreterSettings[c] = angular.copy(i[c]), n(c)
    }, a.removeInterpreterSetting = function(b) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this interpreter setting?",
            callback: function(c) {
                c && f.delete(g.getRestApiBase() + "/interpreter/setting/" + b).success(function(c, d, e, f) {
                    var g = _.findIndex(a.interpreterSettings, {
                        id: b
                    });
                    a.interpreterSettings.splice(g, 1)
                }).error(function(a, b, c, d) {})
            }
        })
    }, a.newInterpreterGroupChange = function() {
        for (var b = _.pluck(_.filter(a.availableInterpreters, {
                group: a.newInterpreterSetting.group
            }), "properties"), c = {}, d = 0; d < b.length; d++) {
            var e = b[d];
            for (var f in e) c[f] = {
                value: e[f].defaultValue,
                description: e[f].description
            }
        }
        a.newInterpreterSetting.properties = c
    }, a.restartInterpreterSetting = function(b) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to restart this interpreter?",
            callback: function(c) {
                c && f.put(g.getRestApiBase() + "/interpreter/setting/restart/" + b).success(function(c, d, e, f) {
                    var g = _.findIndex(a.interpreterSettings, {
                        id: b
                    });
                    a.interpreterSettings[g] = c.body
                }).error(function(a, b, c, d) {})
            }
        })
    }, a.addNewInterpreterSetting = function() {
        if (!a.newInterpreterSetting.name.trim() || !a.newInterpreterSetting.group) return void BootstrapDialog.alert({
            closable: !0,
            title: "Add interpreter",
            message: "Please fill in interpreter name and choose a group"
        });
        if (_.findIndex(a.interpreterSettings, {
                name: a.newInterpreterSetting.name
            }) >= 0) return void BootstrapDialog.alert({
            closable: !0,
            title: "Add interpreter",
            message: "Name " + a.newInterpreterSetting.name + " already exists"
        });
        var b = a.newInterpreterSetting;
        ("" !== b.propertyKey || b.propertyKey) && a.addNewInterpreterProperty(), ("" !== b.depArtifact || b.depArtifact) && a.addNewInterpreterDependency();
        var c = angular.copy(a.newInterpreterSetting),
            d = {};
        for (var e in b.properties) d[e] = b.properties[e].value;
        c.properties = d, f.post(g.getRestApiBase() + "/interpreter/setting", c).success(function(b, c, d, e) {
            a.resetNewInterpreterSetting(), j(), a.showAddNewSetting = !1
        }).error(function(a, b, c, d) {
            h.danger({
                content: a.message,
                verticalPosition: "bottom"
            })
        })
    }, a.cancelInterpreterSetting = function() {
        a.showAddNewSetting = !1, a.resetNewInterpreterSetting()
    }, a.resetNewInterpreterSetting = function() {
        a.newInterpreterSetting = {
            name: void 0,
            group: void 0,
            properties: {},
            dependencies: [],
            option: {
                remote: !0,
                isExistingProcess: !1,
                perNoteSession: !1,
                perNoteProcess: !1
            }
        }, l(a.newInterpreterSetting)
    }, a.removeInterpreterProperty = function(b, c) {
        if (void 0 === c) delete a.newInterpreterSetting.properties[b];
        else {
            var d = _.findIndex(a.interpreterSettings, {
                id: c
            });
            delete a.interpreterSettings[d].properties[b]
        }
    }, a.removeInterpreterDependency = function(b, c) {
        if (void 0 === c) a.newInterpreterSetting.dependencies = _.reject(a.newInterpreterSetting.dependencies, function(a) {
            return a.groupArtifactVersion === b
        });
        else {
            var d = _.findIndex(a.interpreterSettings, {
                id: c
            });
            a.interpreterSettings[d].dependencies = _.reject(a.interpreterSettings[d].dependencies, function(a) {
                return a.groupArtifactVersion === b
            })
        }
    }, a.addNewInterpreterProperty = function(b) {
        if (void 0 === b) {
            if (!a.newInterpreterSetting.propertyKey || "" === a.newInterpreterSetting.propertyKey) return;
            a.newInterpreterSetting.properties[a.newInterpreterSetting.propertyKey] = {
                value: a.newInterpreterSetting.propertyValue
            }, l(a.newInterpreterSetting)
        } else {
            var c = _.findIndex(a.interpreterSettings, {
                    id: b
                }),
                d = a.interpreterSettings[c];
            if (!d.propertyKey || "" === d.propertyKey) return;
            d.properties[d.propertyKey] = d.propertyValue, l(d)
        }
    }, a.addNewInterpreterDependency = function(b) {
        if (void 0 === b) {
            if (!a.newInterpreterSetting.depArtifact || "" === a.newInterpreterSetting.depArtifact) return;
            var c = a.newInterpreterSetting;
            for (var d in c.dependencies) c.dependencies[d].groupArtifactVersion === c.depArtifact && (c.dependencies[d] = {
                groupArtifactVersion: c.depArtifact,
                exclusions: c.depExclude
            }, c.dependencies.splice(d, 1));
            c.dependencies.push({
                groupArtifactVersion: c.depArtifact,
                exclusions: "" === c.depExclude ? [] : c.depExclude
            }), m(c)
        } else {
            var e = _.findIndex(a.interpreterSettings, {
                    id: b
                }),
                f = a.interpreterSettings[e];
            if (!f.depArtifact || "" === f.depArtifact) return;
            for (var g in f.dependencies) f.dependencies[g].groupArtifactVersion === f.depArtifact && (f.dependencies[g] = {
                groupArtifactVersion: f.depArtifact,
                exclusions: f.depExclude
            }, f.dependencies.splice(g, 1));
            f.dependencies.push({
                groupArtifactVersion: f.depArtifact,
                exclusions: "" === f.depExclude ? [] : f.depExclude
            }), m(f)
        }
    }, a.resetNewRepositorySetting = function() {
        a.newRepoSetting = {
            id: "",
            url: "",
            snapshot: !1,
            username: "",
            password: ""
        }
    };
    var o = function() {
        f.get(g.getRestApiBase() + "/interpreter/repository").success(function(b, c, d, e) {
            a.repositories = b.body
        }).error(function(a, b, c, d) {})
    };
    a.addNewRepository = function() {
        var b = angular.copy(a.newRepoSetting);
        f.post(g.getRestApiBase() + "/interpreter/repository", b).success(function(b, c, d, e) {
            o(), a.resetNewRepositorySetting(), angular.element("#repoModal").modal("hide")
        }).error(function(a, b, c, d) {})
    }, a.removeRepository = function(b) {
        BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this repository?",
            callback: function(c) {
                c && f.delete(g.getRestApiBase() + "/interpreter/repository/" + b).success(function(c, d, e, f) {
                    var g = _.findIndex(a.repositories, {
                        id: b
                    });
                    a.repositories.splice(g, 1)
                }).error(function(a, b, c, d) {})
            }
        })
    }, a.isDefaultRepository = function(a) {
        return "central" === a || "local" === a
    };
    var p = function() {
        a.resetNewInterpreterSetting(), a.resetNewRepositorySetting(), j(), k(), o()
    };
    p()
}]), angular.module("zeppelinWebApp").filter("sortByKey", function() {
    return function(a) {
        var b = a ? Object.keys(a) : [];
        return b.sort()
    }
}), angular.module("zeppelinWebApp").controller("CredentialCtrl", ["$scope", "$route", "$routeParams", "$location", "$rootScope", "$http", "baseUrlSrv", function(a, b, c, d, e, f, g) {
    a._ = _, a.credentialEntity = "", a.credentialUsername = "", a.credentialPassword = "", a.updateCredentials = function() {
        return _.isEmpty(a.credentialEntity.trim()) || _.isEmpty(a.credentialUsername.trim()) ? void BootstrapDialog.alert({
            closable: !0,
            message: "Username \\ Entity can not be empty."
        }) : void f.put(g.getRestApiBase() + "/credential", {
            entity: a.credentialEntity,
            username: a.credentialUsername,
            password: a.credentialPassword
        }).success(function(b, c, d, e) {
            BootstrapDialog.alert({
                closable: !0,
                message: "Successfully saved credentials."
            }), a.credentialEntity = "", a.credentialUsername = "", a.credentialPassword = ""
        }).error(function(a, b, c, d) {
            alert("Error saving credentials")
        })
    }
}]), angular.module("zeppelinWebApp").controller("ConfigurationCtrl", ["$scope", "$route", "$routeParams", "$location", "$rootScope", "$http", "baseUrlSrv", function(a, b, c, d, e, f, g) {
    a.configrations = [], a._ = _;
    var h = function() {
            f.get(g.getRestApiBase() + "/configurations/all").success(function(b, c, d, e) {
                a.configurations = b.body
            }).error(function(a, b, c, d) {})
        },
        i = function() {
            h()
        };
    i()
}]), angular.module("zeppelinWebApp").controller("ParagraphCtrl", ["$scope", "$rootScope", "$route", "$window", "$element", "$routeParams", "$location", "$timeout", "$compile", "websocketMsgSrv", "ngToast", "SaveAsService", function(a, b, c, d, e, f, g, h, i, j, k, l) {
    var m = "_Z_ANGULAR_FUNC_";
    a.parentNote = null, a.paragraph = null, a.originalText = "", a.editor = null;
    var n = b.$new(!0, b);
    a.compiledScope = n, n.z = {
        runParagraph: function(b) {
            if (b) {
                var c = a.parentNote.paragraphs.filter(function(a) {
                    return a.id === b
                });
                if (1 === c.length) {
                    var d = c[0];
                    j.runParagraph(d.id, d.title, d.text, d.config, d.settings.params)
                } else k.danger({
                    content: "Cannot find a paragraph with id '" + b + "'",
                    verticalPosition: "top",
                    dismissOnTimeout: !1
                })
            } else k.danger({
                content: "Please provide a 'paragraphId' when calling z.runParagraph(paragraphId)",
                verticalPosition: "top",
                dismissOnTimeout: !1
            })
        },
        angularBind: function(a, b, c) {
            c ? j.clientBindAngularObject(f.noteId, a, b, c) : k.danger({
                content: "Please provide a 'paragraphId' when calling z.angularBind(varName, value, 'PUT_HERE_PARAGRAPH_ID')",
                verticalPosition: "top",
                dismissOnTimeout: !1
            })
        },
        angularUnbind: function(a, b) {
            b ? j.clientUnbindAngularObject(f.noteId, a, b) : k.danger({
                content: "Please provide a 'paragraphId' when calling z.angularUnbind(varName, 'PUT_HERE_PARAGRAPH_ID')",
                verticalPosition: "top",
                dismissOnTimeout: !1
            })
        }
    };
    var o = {},
        p = {
            "ace/mode/python": /^%(\w*\.)?(pyspark|python)\s*$/,
            "ace/mode/scala": /^%(\w*\.)?spark\s*$/,
            "ace/mode/r": /^%(\w*\.)?(r|sparkr|knitr)\s*$/,
            "ace/mode/sql": /^%(\w*\.)?\wql/,
            "ace/mode/markdown": /^%md/,
            "ace/mode/sh": /^%sh/
        };
    a.init = function(b, c) {
        a.paragraph = b, a.parentNote = c, a.originalText = angular.copy(b.text), a.chart = {}, a.colWidthOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], a.showTitleEditor = !1, a.paragraphFocused = !1, b.focus && (a.paragraphFocused = !0), a.paragraph.config || (a.paragraph.config = {}), q(), "TABLE" === a.getResultType() ? (a.loadTableData(a.paragraph.result), a.setGraphMode(a.getGraphMode(), !1, !1)) : "HTML" === a.getResultType() ? a.renderHtml() : "ANGULAR" === a.getResultType() ? a.renderAngular() : "TEXT" === a.getResultType() && a.renderText()
    }, a.renderHtml = function() {
        var b = function() {
            if (angular.element("#p" + a.paragraph.id + "_html").length) try {
                angular.element("#p" + a.paragraph.id + "_html").html(a.paragraph.result.msg), angular.element("#p" + a.paragraph.id + "_html").find("pre code").each(function(a, b) {
                    hljs.highlightBlock(b)
                })
            } catch (a) {} else h(b, 10)
        };
        h(b)
    }, a.renderAngular = function() {
        var b = function() {
            if (angular.element("#p" + a.paragraph.id + "_angular").length) try {
                angular.element("#p" + a.paragraph.id + "_angular").html(a.paragraph.result.msg), i(angular.element("#p" + a.paragraph.id + "_angular").contents())(n)
            } catch (a) {} else h(b, 10)
        };
        h(b)
    }, a.renderText = function() {
        var b = function() {
            var c = angular.element("#p" + a.paragraph.id + "_text");
            c.length ? (a.clearTextOutput(), a.paragraph.result && a.paragraph.result.msg && a.appendTextOutput(a.paragraph.result.msg), angular.element("#p" + a.paragraph.id + "_text").bind("mousewheel", function(b) {
                a.keepScrollDown = !1
            }), a.flushStreamingOutput = !0) : h(b, 10)
        };
        h(b)
    }, a.clearTextOutput = function() {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        b.length && b.children().remove()
    }, a.appendTextOutput = function(b) {
        var c = angular.element("#p" + a.paragraph.id + "_text");
        if (c.length)
            for (var d = b.split("\n"), e = 0; e < d.length; e++) c.append(angular.element("<div></div>").text(d[e]));
        if (a.keepScrollDown) {
            var f = angular.element("#p" + a.paragraph.id + "_text");
            f[0].scrollTop = f[0].scrollHeight
        }
    }, a.$on("angularObjectUpdate", function(b, d) {
        var e = c.current.pathParams.noteId;
        if (!d.noteId || d.noteId === e && (!d.paragraphId || d.paragraphId === a.paragraph.id)) {
            var f = n,
                g = d.angularObject.name;
            if (angular.equals(d.angularObject.object, f[g])) return;
            if (o[g] ? (o[g].noteId = o[g].noteId || d.noteId, o[g].paragraphId = o[g].paragraphId || d.paragraphId) : o[g] = {
                    interpreterGroupId: d.interpreterGroupId,
                    noteId: d.noteId,
                    paragraphId: d.paragraphId
                }, o[g].skipEmit = !0, o[g].clearWatcher || (o[g].clearWatcher = f.$watch(g, function(a, b) {
                    return o[g].skipEmit ? void(o[g].skipEmit = !1) : void j.updateAngularObject(o[g].noteId, o[g].paragraphId, g, a, o[g].interpreterGroupId)
                })), f[g] = d.angularObject.object, g.startsWith(m)) {
                var h = g.substring(m.length);
                f[h] = function() {
                    f[g] = arguments
                }
            }
        }
    }), a.$on("angularObjectRemove", function(b, d) {
        var e = c.current.pathParams.noteId;
        if (!d.noteId || d.noteId === e && (!d.paragraphId || d.paragraphId === a.paragraph.id)) {
            var f = n,
                g = d.name;
            if (o[g] && (o[g].clearWatcher(), o[g] = void 0), f[g] = void 0, g.startsWith(m)) {
                var h = g.substring(m.length);
                f[h] = void 0
            }
        }
    });
    var q = function() {
        var b = a.paragraph.config;
        b.colWidth || (b.colWidth = 12), b.graph || (b.graph = {}), b.graph.mode || (b.graph.mode = "table"), b.graph.height || (b.graph.height = 300), b.graph.optionOpen || (b.graph.optionOpen = !1), b.graph.keys || (b.graph.keys = []), b.graph.values || (b.graph.values = []), b.graph.groups || (b.graph.groups = []), b.graph.scatter || (b.graph.scatter = {}), void 0 === b.enabled && (b.enabled = !0)
    };
    a.getIframeDimensions = function() {
        if (a.asIframe) {
            var b = "#" + f.paragraphId + "_container",
                c = angular.element(b).height();
            return c
        }
        return 0
    }, a.$watch(a.getIframeDimensions, function(b, c) {
        if (a.asIframe && b) {
            var e = {};
            e.height = b, e.url = g.$$absUrl, d.parent.postMessage(angular.toJson(e), "*")
        }
    });
    var r = function(a) {
        return !a
    };
    a.$on("updateParagraph", function(c, d) {
        if (!(d.paragraph.id !== a.paragraph.id || d.paragraph.dateCreated === a.paragraph.dateCreated && d.paragraph.dateFinished === a.paragraph.dateFinished && d.paragraph.dateStarted === a.paragraph.dateStarted && d.paragraph.dateUpdated === a.paragraph.dateUpdated && d.paragraph.status === a.paragraph.status && d.paragraph.jobName === a.paragraph.jobName && d.paragraph.title === a.paragraph.title && r(d.paragraph.result) === r(a.paragraph.result) && d.paragraph.errorMessage === a.paragraph.errorMessage && angular.equals(d.paragraph.settings, a.paragraph.settings) && angular.equals(d.paragraph.config, a.paragraph.config))) {
            var e = a.getResultType(),
                f = a.getResultType(d.paragraph),
                g = a.getGraphMode(),
                h = a.getGraphMode(d.paragraph),
                i = d.paragraph.status !== a.paragraph.status,
                j = d.paragraph.dateFinished !== a.paragraph.dateFinished || r(d.paragraph.result) !== r(a.paragraph.result) || "ERROR" === d.paragraph.status || "FINISHED" === d.paragraph.status && i;
            if (a.paragraph.text !== d.paragraph.text && (a.dirtyText ? a.dirtyText === d.paragraph.text ? (a.paragraph.text = d.paragraph.text, a.dirtyText = void 0, a.originalText = angular.copy(d.paragraph.text)) : a.paragraph.text = a.dirtyText : (a.paragraph.text = d.paragraph.text, a.originalText = angular.copy(d.paragraph.text))),
                a.paragraph.aborted = d.paragraph.aborted, a.paragraph.user = d.paragraph.user, a.paragraph.dateUpdated = d.paragraph.dateUpdated, a.paragraph.dateCreated = d.paragraph.dateCreated, a.paragraph.dateFinished = d.paragraph.dateFinished, a.paragraph.dateStarted = d.paragraph.dateStarted, a.paragraph.errorMessage = d.paragraph.errorMessage, a.paragraph.jobName = d.paragraph.jobName, a.paragraph.title = d.paragraph.title, a.paragraph.lineNumbers = d.paragraph.lineNumbers, a.paragraph.status = d.paragraph.status, a.paragraph.result = d.paragraph.result, a.paragraph.settings = d.paragraph.settings, a.asIframe ? (d.paragraph.config.editorHide = !0, d.paragraph.config.tableHide = !1, a.paragraph.config = d.paragraph.config) : (a.paragraph.config = d.paragraph.config, q()), "TABLE" === f ? (a.loadTableData(a.paragraph.result), ("TABLE" !== e || j) && (B(), C()), g !== h ? a.setGraphMode(h, !1, !1) : a.setGraphMode(h, !1, !0)) : "HTML" === f && j ? a.renderHtml() : "ANGULAR" === f && j ? a.renderAngular() : "TEXT" === f && j && a.renderText(), i || j) {
                var k = angular.element('div[id$="_paragraphColumn_main"]');
                k.length >= 2 && k[k.length - 2].id.startsWith(a.paragraph.id) && setTimeout(function() {
                    b.$broadcast("scrollToCursor")
                }, 500)
            }
        }
    }), a.$on("appendParagraphOutput", function(b, c) {
        a.paragraph.id === c.paragraphId && (a.flushStreamingOutput && (a.clearTextOutput(), a.flushStreamingOutput = !1), a.appendTextOutput(c.data))
    }), a.$on("updateParagraphOutput", function(b, c) {
        a.paragraph.id === c.paragraphId && (a.clearTextOutput(), a.appendTextOutput(c.data))
    }), a.isRunning = function() {
        return "RUNNING" === a.paragraph.status || "PENDING" === a.paragraph.status
    }, a.cancelParagraph = function() {
        j.cancelParagraphRun(a.paragraph.id)
    }, a.runParagraph = function(b) {
        j.runParagraph(a.paragraph.id, a.paragraph.title, b, a.paragraph.config, a.paragraph.settings.params), a.originalText = angular.copy(b), a.dirtyText = void 0
    }, a.saveParagraph = function() {
        void 0 !== a.dirtyText && a.dirtyText !== a.originalText && (u(a.paragraph.title, a.dirtyText, a.paragraph.config, a.paragraph.settings.params), a.originalText = angular.copy(a.dirtyText), a.dirtyText = void 0)
    }, a.toggleEnableDisable = function() {
        a.paragraph.config.enabled = !a.paragraph.config.enabled;
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.run = function() {
        var b = a.editor.getValue();
        b && "RUNNING" !== a.paragraph.status && "PENDING" !== a.paragraph.status && a.runParagraph(b)
    }, a.moveUp = function() {
        a.$emit("moveParagraphUp", a.paragraph.id)
    }, a.moveDown = function() {
        a.$emit("moveParagraphDown", a.paragraph.id)
    }, a.insertNew = function(b) {
        a.$emit("insertParagraph", a.paragraph.id, b || "below")
    }, a.removeParagraph = function() {
        var b = angular.element('div[id$="_paragraphColumn_main"]');
        b[b.length - 1].id.startsWith(a.paragraph.id) ? BootstrapDialog.alert({
            closable: !0,
            message: "The last paragraph can't be deleted."
        }) : BootstrapDialog.confirm({
            closable: !0,
            title: "",
            message: "Do you want to delete this paragraph?",
            callback: function(b) {
                b && j.removeParagraph(a.paragraph.id)
            }
        })
    }, a.clearParagraphOutput = function() {
        j.clearParagraphOutput(a.paragraph.id)
    }, a.toggleEditor = function() {
        a.paragraph.config.editorHide ? a.openEditor() : a.closeEditor()
    }, a.closeEditor = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.editorHide = !0, u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.openEditor = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.editorHide = !1, u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.closeTable = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.tableHide = !0, u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.openTable = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.tableHide = !1, u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.showTitle = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.title = !0, u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.hideTitle = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.title = !1, u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.setTitle = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.showLineNumbers = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.lineNumbers = !0, a.editor.renderer.setShowGutter(!0), u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.hideLineNumbers = function() {
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        c.lineNumbers = !1, a.editor.renderer.setShowGutter(!1), u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.columnWidthClass = function(b) {
        return a.asIframe ? "col-md-12" : "col-md-" + b
    }, a.changeColWidth = function() {
        angular.element(".navbar-right.open").removeClass("open");
        var b = angular.copy(a.paragraph.settings.params),
            c = angular.copy(a.paragraph.config);
        u(a.paragraph.title, a.paragraph.text, c, b)
    }, a.toggleGraphOption = function() {
        var b = angular.copy(a.paragraph.config);
        b.graph.optionOpen ? b.graph.optionOpen = !1 : b.graph.optionOpen = !0;
        var c = angular.copy(a.paragraph.settings.params);
        u(a.paragraph.title, a.paragraph.text, b, c)
    }, a.toggleOutput = function() {
        var b = angular.copy(a.paragraph.config);
        b.tableHide = !b.tableHide;
        var c = angular.copy(a.paragraph.settings.params);
        u(a.paragraph.title, a.paragraph.text, b, c)
    }, a.toggleLineWithFocus = function() {
        var b = a.getGraphMode();
        return "lineWithFocusChart" === b ? (a.setGraphMode("lineChart", !0), !0) : "lineChart" === b && (a.setGraphMode("lineWithFocusChart", !0), !0)
    }, a.loadForm = function(b, c) {
        var d = b.defaultValue;
        c[b.name] && (d = c[b.name]), a.paragraph.settings.params[b.name] = d
    }, a.toggleCheckbox = function(b, c) {
        var d = a.paragraph.settings.params[b.name].indexOf(c.value);
        d > -1 ? a.paragraph.settings.params[b.name].splice(d, 1) : a.paragraph.settings.params[b.name].push(c.value)
    }, a.aceChanged = function() {
        a.dirtyText = a.editor.getSession().getValue(), a.startSaveTimer(), a.setParagraphMode(a.editor.getSession(), a.dirtyText, a.editor.getCursorPosition())
    }, a.aceLoaded = function(c) {
        var d = ace.require("ace/ext/language_tools"),
            e = ace.require("ace/range").Range;
        if (c.$blockScrolling = 1 / 0, a.editor = c, a.editor.on("input", a.aceChanged), "{{paragraph.id}}_editor" !== c.container.id) {
            a.editor.renderer.setShowGutter(a.paragraph.config.lineNumbers), a.editor.setShowFoldWidgets(!1), a.editor.setHighlightActiveLine(!1), a.editor.setHighlightGutterLine(!1), a.editor.getSession().setUseWrapMode(!0), a.editor.setTheme("ace/theme/chrome"), a.paragraphFocused && a.editor.focus(), s(c.container.id), angular.element(window).resize(function() {
                s(c.container.id)
            }), navigator.appVersion.indexOf("Mac") !== -1 ? (a.editor.setKeyboardHandler("ace/keyboard/emacs"), b.isMac = !0) : navigator.appVersion.indexOf("Win") === -1 && navigator.appVersion.indexOf("X11") === -1 && navigator.appVersion.indexOf("Linux") === -1 || (b.isMac = !1), a.setParagraphMode = function(b, c, d) {
                if ("undefined" == typeof d || 0 === d.row && d.column < 30)
                    if ("undefined" == typeof d && a.paragraph.config.editorMode) b.setMode(a.paragraph.config.editorMode);
                    else {
                        var e = "ace/mode/scala",
                            f = b.getMode().$id;
                        if (!p[f] || !p[f].test(c)) {
                            for (var g in p)
                                if (g !== f && p[g].test(c)) return a.paragraph.config.editorMode = g, b.setMode(g), !0;
                            a.paragraph.config.editorMode = e, b.setMode(e)
                        }
                    }
            };
            var f = {
                getCompletions: function(b, c, d, f, g) {
                    if (a.editor.isFocused()) {
                        d = c.getTextRange(new e(0, 0, d.row, d.column)).length;
                        var h = c.getValue();
                        j.completion(a.paragraph.id, h, d), a.$on("completionList", function(a, b) {
                            if (b.completions) {
                                var c = [];
                                for (var d in b.completions) {
                                    var e = b.completions[d];
                                    c.push({
                                        name: e.name,
                                        value: e.value,
                                        score: 300
                                    })
                                }
                                g(null, c)
                            }
                        })
                    }
                }
            };
            d.setCompleters([f, d.keyWordCompleter, d.snippetCompleter, d.textCompleter]), a.editor.setOptions({
                enableBasicAutocompletion: !0,
                enableSnippets: !1,
                enableLiveAutocompletion: !1
            }), a.handleFocus = function(b, c) {
                a.paragraphFocused = b, c !== !1 && void 0 !== c || h(function() {
                    a.$digest()
                })
            }, a.editor.on("focus", function() {
                a.handleFocus(!0)
            }), a.editor.on("blur", function() {
                a.handleFocus(!1)
            }), a.editor.getSession().on("change", function(a, b) {
                s(c.container.id)
            }), a.setParagraphMode(a.editor.getSession(), a.editor.getSession().getValue()), a.editor.commands.bindKey("ctrl-alt-n.", null), a.editor.commands.removeCommand("showSettingsMenu"), a.editor.commands.bindKey("ctrl-.", "startAutocomplete"), a.editor.commands.bindKey("ctrl-space", null);
            var g = function(b) {
                var c = a.editor.getSession().getLength(),
                    d = a.editor.getCursorPosition().row;
                0 === d && b <= 0 ? a.$emit("moveFocusToPreviousParagraph", a.paragraph.id) : d === c - 1 && b >= 0 ? a.$emit("moveFocusToNextParagraph", a.paragraph.id) : a.scrollToCursor(a.paragraph.id, b)
            };
            a.editor.keyBinding.origOnCommandKey = a.editor.keyBinding.onCommandKey, a.editor.keyBinding.onCommandKey = function(b, c, d) {
                if (a.editor.completer && a.editor.completer.activated);
                else {
                    if (parseInt(angular.element("#" + a.paragraph.id + "_editor > textarea").css("top").replace("px", "")) < 0) {
                        var e = a.editor.getCursorPosition(),
                            f = a.editor.renderer.$cursorLayer.getPixelPosition(e, !0);
                        angular.element("#" + a.paragraph.id + "_editor > textarea").css("top", f.top)
                    }
                    var h = -1,
                        i = 1;
                    switch (d) {
                        case 38:
                            g(h);
                            break;
                        case 80:
                            b.ctrlKey && !b.altKey && g(h);
                            break;
                        case 40:
                            g(i);
                            break;
                        case 78:
                            b.ctrlKey && !b.altKey && g(i)
                    }
                }
                this.origOnCommandKey(b, c, d)
            }
        }
    };
    var s = function(b) {
        var c = a.editor,
            d = c.getSession().getScreenLength() * c.renderer.lineHeight + c.renderer.scrollBar.getWidth();
        angular.element("#" + b).height(d.toString() + "px"), c.resize()
    };
    b.$on("scrollToCursor", function(b) {
        var c = angular.element('div[id$="_paragraphColumn_main"]');
        c[c.length - 1].id.startsWith(a.paragraph.id) && a.scrollToCursor(a.paragraph.id, 0)
    }), a.scrollToCursor = function(b, c) {
        if (a.editor.isFocused()) {
            var d, e = a.editor.renderer.lineHeight,
                f = 103,
                g = 50,
                h = angular.element(document).height(),
                i = angular.element(window).height(),
                j = angular.element(document).scrollTop(),
                k = angular.element("#" + b + "_editor").offset(),
                l = a.editor.getCursorPosition(),
                m = a.editor.renderer.$cursorLayer.getPixelPosition(l, !0),
                n = k.top + m.top + e * c;
            n < j + f + g ? (d = n - f - (i - f) / 3, d < 0 && (d = 0)) : n > j + g + i - f && (d = n - f - 2 * (i - f) / 3, d > h && (d = h));
            var o = angular.element("body");
            o.stop(), o.finish(), o.scrollTo(d, {
                axis: "y",
                interrupt: !0,
                duration: 100
            })
        }
    };
    a.getEditorValue = function() {
        return a.editor.getValue()
    }, a.getProgress = function() {
        return a.currentProgress ? a.currentProgress : 0
    }, a.getExecutionTime = function() {
        var b = a.paragraph,
            c = Date.parse(b.dateFinished) - Date.parse(b.dateStarted);
        if (isNaN(c) || c < 0) return a.isResultOutdated() ? "outdated" : "";
        var d = void 0 === b.user || null === b.user ? "anonymous" : b.user,
            e = "Took " + moment.duration(c / 1e3, "seconds").format("h [hrs] m [min] s [sec]") + ". Last updated by " + d + " at " + moment(b.dateFinished).format("MMMM DD YYYY, h:mm:ss A") + ".";
        return a.isResultOutdated() && (e += " (outdated)"), e
    }, a.getElapsedTime = function() {
        return "Started " + moment(a.paragraph.dateStarted).fromNow() + "."
    }, a.isResultOutdated = function() {
        var b = a.paragraph;
        return void 0 !== b.dateUpdated && Date.parse(b.dateUpdated) > Date.parse(b.dateStarted)
    }, a.$on("updateProgress", function(b, c) {
        c.id === a.paragraph.id && (a.currentProgress = c.progress)
    }), a.$on("keyEvent", function(b, c) {
        if (a.paragraphFocused) {
            var d = a.paragraph.id,
                e = c.keyCode,
                f = !1,
                g = a.paragraph.config.editorHide;
            g && (38 === e || 80 === e && c.ctrlKey && !c.altKey) ? a.$emit("moveFocusToPreviousParagraph", d) : g && (40 === e || 78 === e && c.ctrlKey && !c.altKey) ? a.$emit("moveFocusToNextParagraph", d) : c.shiftKey && 13 === e ? a.run() : c.ctrlKey && c.altKey && 67 === e ? a.cancelParagraph() : c.ctrlKey && c.altKey && 68 === e ? a.removeParagraph() : c.ctrlKey && c.altKey && 75 === e ? a.moveUp() : c.ctrlKey && c.altKey && 74 === e ? a.moveDown() : c.ctrlKey && c.altKey && 65 === e ? a.insertNew("above") : c.ctrlKey && c.altKey && 66 === e ? a.insertNew("below") : c.ctrlKey && c.altKey && 79 === e ? a.toggleOutput() : c.ctrlKey && c.altKey && 82 === e ? a.toggleEnableDisable() : c.ctrlKey && c.altKey && 69 === e ? a.toggleEditor() : c.ctrlKey && c.altKey && 77 === e ? a.paragraph.config.lineNumbers ? a.hideLineNumbers() : a.showLineNumbers() : c.ctrlKey && c.shiftKey && 189 === e ? (a.paragraph.config.colWidth = Math.max(1, a.paragraph.config.colWidth - 1), a.changeColWidth()) : c.ctrlKey && c.shiftKey && 187 === e ? (a.paragraph.config.colWidth = Math.min(12, a.paragraph.config.colWidth + 1), a.changeColWidth()) : c.ctrlKey && c.altKey && 84 === e ? a.paragraph.config.title ? a.hideTitle() : a.showTitle() : f = !0, f || c.preventDefault()
        }
    }), a.$on("focusParagraph", function(b, c, d, e) {
        if (a.paragraph.id === c) {
            if (!a.paragraph.config.editorHide && !e) {
                a.editor.focus();
                var f;
                d >= 0 ? (f = d, a.editor.gotoLine(f, 0)) : (f = a.editor.session.getLength(), a.editor.gotoLine(f, 0)), a.scrollToCursor(a.paragraph.id, 0)
            }
            a.handleFocus(!0)
        } else {
            a.editor.blur();
            var g = !0;
            a.handleFocus(!1, g)
        }
    }), a.$on("runParagraph", function(b) {
        a.runParagraph(a.editor.getValue())
    }), a.$on("openEditor", function(b) {
        a.openEditor()
    }), a.$on("closeEditor", function(b) {
        a.closeEditor()
    }), a.$on("openTable", function(b) {
        a.openTable()
    }), a.$on("closeTable", function(b) {
        a.closeTable()
    }), a.getResultType = function(b) {
        var c = b ? b : a.paragraph;
        return c.result && c.result.type ? c.result.type : "TEXT"
    }, a.getBase64ImageSrc = function(a) {
        return "data:image/png;base64," + a
    }, a.getGraphMode = function(b) {
        var c = b ? b : a.paragraph;
        return c.config.graph && c.config.graph.mode ? c.config.graph.mode : "table"
    }, a.loadTableData = function(a) {
        if (a && "TABLE" === a.type) {
            var b = [],
                c = [],
                d = [],
                e = a.msg.split("\n");
            a.comment = "";
            for (var f = !1, g = 0; g < e.length; g++) {
                var h = e[g];
                if (f) a.comment += h;
                else if ("" !== h) {
                    for (var i = h.split("\t"), j = [], k = [], l = 0; l < i.length; l++) {
                        var m = i[l];
                        0 === g ? b.push({
                            name: m,
                            index: l,
                            aggr: "sum"
                        }) : (j.push(m), k.push({
                            key: b[g] ? b[g].name : void 0,
                            value: m
                        }))
                    }
                    0 !== g && (c.push(j), d.push(k))
                } else c.length > 0 && (f = !0)
            }
            a.msgTable = d, a.columnNames = b, a.rows = c
        }
    }, a.setGraphMode = function(b, c, d) {
        if (c) t(b);
        else {
            B();
            var e = a.paragraph.config.graph.height;
            angular.element("#p" + a.paragraph.id + "_graph").height(e), b && "table" !== b ? A(b, a.paragraph.result, d) : v(a.paragraph.result, d)
        }
    };
    var t = function(b) {
            var c = angular.copy(a.paragraph.config),
                d = angular.copy(a.paragraph.settings.params);
            c.graph.mode = b, u(a.paragraph.title, a.paragraph.text, c, d)
        },
        u = function(b, c, d, e) {
            j.commitParagraph(a.paragraph.id, b, c, d, e)
        },
        v = function(b, c) {
            var d = function() {
                    var c = a.paragraph.config.graph.height,
                        d = angular.element("#p" + a.paragraph.id + "_table").css("height", c).get(0),
                        e = b.rows,
                        f = _.pluck(b.columnNames, "name");
                    a.hot && a.hot.destroy(), a.hot = new Handsontable(d, {
                        colHeaders: f,
                        data: e,
                        rowHeaders: !1,
                        stretchH: "all",
                        sortIndicator: !0,
                        columnSorting: !0,
                        contextMenu: !1,
                        manualColumnResize: !0,
                        manualRowResize: !0,
                        readOnly: !0,
                        readOnlyCellClassName: "",
                        fillHandle: !1,
                        fragmentSelection: !0,
                        disableVisualSelection: !0,
                        cells: function(a, b, c) {
                            var d = {};
                            return d.renderer = function(a, b, c, d, e, f, g) {
                                isNaN(f) ? f.length > "%html".length && "%html " === f.substring(0, "%html ".length) ? b.innerHTML = f.substring("%html".length) : Handsontable.renderers.TextRenderer.apply(this, arguments) : (g.format = "0,0.[00000]", b.style.textAlign = "left", Handsontable.renderers.NumericRenderer.apply(this, arguments))
                            }, d
                        }
                    })
                },
                e = function() {
                    if (angular.element("#p" + a.paragraph.id + "_table").length) try {
                        d()
                    } catch (a) {} else h(e, 10)
                };
            h(e)
        },
        w = function(a) {
            return d3.format(",")(d3.round(a, 3))
        },
        x = function(a) {
            var b = d3.format(".3s")(a);
            switch (b[b.length - 1]) {
                case "G":
                    return b.slice(0, -1) + "B"
            }
            return b
        },
        y = function(a, b) {
            return !b[a] || !isNaN(parseFloat(b[a])) && isFinite(b[a]) ? a : b[a]
        },
        z = function(a) {
            return Math.abs(a) >= Math.pow(10, 6) ? x(a) : w(a)
        },
        A = function(b, c, d) {
            if (!a.chart[b]) {
                var e = nv.models[b]();
                a.chart[b] = e
            }
            var f, g, i = [];
            if ("scatterChart" === b) {
                var j = G(c, d);
                f = j.xLabels, g = j.yLabels, i = j.d3g, a.chart[b].xAxis.tickFormat(function(a) {
                    return y(a, f)
                }), a.chart[b].yAxis.tickFormat(function(a) {
                    return z(a, g)
                }), a.chart[b].tooltipContent(function(b, c, d, e, f) {
                    var g = "<h3>" + b + "</h3>";
                    return a.paragraph.config.graph.scatter.size && a.isValidSizeOption(a.paragraph.config.graph.scatter, a.paragraph.result.rows) && (g += "<p>" + f.point.size + "</p>"), g
                }), a.chart[b].showDistX(!0).showDistY(!0)
            } else {
                var k = D(c);
                if ("pieChart" === b) {
                    var l = E(k, !0).d3g;
                    if (a.chart[b].x(function(a) {
                            return a.label
                        }).y(function(a) {
                            return a.value
                        }), l.length > 0)
                        for (var m = 0; m < l[0].values.length; m++) {
                            var n = l[0].values[m];
                            i.push({
                                label: n.x,
                                value: n.y
                            })
                        }
                } else if ("multiBarChart" === b) i = E(k, !0, !1, b).d3g, a.chart[b].yAxis.axisLabelDistance(50), a.chart[b].yAxis.tickFormat(function(a) {
                    return z(a)
                });
                else if ("lineChart" === b || "stackedAreaChart" === b || "lineWithFocusChart" === b) {
                    var o = E(k, !1, !0);
                    f = o.xLabels, i = o.d3g, a.chart[b].xAxis.tickFormat(function(a) {
                        return y(a, f)
                    }), "stackedAreaChart" === b ? a.chart[b].yAxisTickFormat(function(a) {
                        return z(a)
                    }) : a.chart[b].yAxis.tickFormat(function(a) {
                        return z(a, f)
                    }), a.chart[b].yAxis.axisLabelDistance(50), a.chart[b].useInteractiveGuideline && a.chart[b].useInteractiveGuideline(!0), a.paragraph.config.graph.forceY ? a.chart[b].forceY([0]) : a.chart[b].forceY([])
                }
            }
            var p = function() {
                    var c = a.paragraph.config.graph.height,
                        d = 300,
                        e = 150;
                    try {
                        i[0].values.length > e && (d = 0)
                    } catch (a) {}
                    d3.select("#p" + a.paragraph.id + "_" + b + " svg").attr("height", a.paragraph.config.graph.height).datum(i).transition().duration(d).call(a.chart[b]);
                    d3.select("#p" + a.paragraph.id + "_" + b + " svg").style.height = c + "px", nv.utils.windowResize(a.chart[b].update)
                },
                q = function() {
                    if (0 !== angular.element("#p" + a.paragraph.id + "_" + b + " svg").length) try {
                        p()
                    } catch (a) {} else h(q, 10)
                };
            h(q)
        };
    a.isGraphMode = function(b) {
        return "TABLE" === a.getResultType() && a.getGraphMode() === b
    }, a.onGraphOptionChange = function() {
        B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeGraphOptionKeys = function(b) {
        a.paragraph.config.graph.keys.splice(b, 1), B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeGraphOptionValues = function(b) {
        a.paragraph.config.graph.values.splice(b, 1), B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeGraphOptionGroups = function(b) {
        a.paragraph.config.graph.groups.splice(b, 1), B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.setGraphOptionValueAggr = function(b, c) {
        a.paragraph.config.graph.values[b].aggr = c, B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionXaxis = function(b) {
        a.paragraph.config.graph.scatter.xAxis = null, B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionYaxis = function(b) {
        a.paragraph.config.graph.scatter.yAxis = null, B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionGroup = function(b) {
        a.paragraph.config.graph.scatter.group = null, B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    }, a.removeScatterOptionSize = function(b) {
        a.paragraph.config.graph.scatter.size = null, B(), a.setGraphMode(a.paragraph.config.graph.mode, !0, !1)
    };
    var B = function() {
            var b = function(a) {
                    for (var b = 0; b < a.length; b++)
                        for (var c = b + 1; c < a.length; c++) angular.equals(a[b], a[c]) && a.splice(c, 1)
                },
                c = function(b) {
                    for (var c = 0; c < b.length; c++) {
                        for (var d = !1, e = 0; e < a.paragraph.result.columnNames.length; e++) {
                            var f = b[c],
                                g = a.paragraph.result.columnNames[e];
                            if (f.index === g.index && f.name === g.name) {
                                d = !0;
                                break
                            }
                        }
                        d || b.splice(c, 1)
                    }
                },
                d = function(b) {
                    for (var c in b)
                        if (b[c]) {
                            for (var d = !1, e = 0; e < a.paragraph.result.columnNames.length; e++) {
                                var f = b[c],
                                    g = a.paragraph.result.columnNames[e];
                                if (f.index === g.index && f.name === g.name) {
                                    d = !0;
                                    break
                                }
                            }
                            d || (b[c] = null)
                        }
                };
            b(a.paragraph.config.graph.keys), c(a.paragraph.config.graph.keys), c(a.paragraph.config.graph.values), b(a.paragraph.config.graph.groups), c(a.paragraph.config.graph.groups), d(a.paragraph.config.graph.scatter)
        },
        C = function() {
            0 === a.paragraph.config.graph.keys.length && a.paragraph.result.columnNames.length > 0 && a.paragraph.config.graph.keys.push(a.paragraph.result.columnNames[0]), 0 === a.paragraph.config.graph.values.length && a.paragraph.result.columnNames.length > 1 && a.paragraph.config.graph.values.push(a.paragraph.result.columnNames[1]), a.paragraph.config.graph.scatter.xAxis || a.paragraph.config.graph.scatter.yAxis || (a.paragraph.result.columnNames.length > 1 ? (a.paragraph.config.graph.scatter.xAxis = a.paragraph.result.columnNames[0], a.paragraph.config.graph.scatter.yAxis = a.paragraph.result.columnNames[1]) : 1 === a.paragraph.result.columnNames.length && (a.paragraph.config.graph.scatter.xAxis = a.paragraph.result.columnNames[0]))
        },
        D = function(b) {
            for (var c = a.paragraph.config.graph.keys, d = a.paragraph.config.graph.groups, e = a.paragraph.config.graph.values, f = {
                    sum: function(a, b) {
                        var c = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                            d = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                        return c + d
                    },
                    count: function(a, b) {
                        var c = void 0 !== a ? parseInt(a) : 0,
                            d = void 0 !== b ? 1 : 0;
                        return c + d
                    },
                    min: function(a, b) {
                        var c = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                            d = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                        return Math.min(c, d)
                    },
                    max: function(a, b) {
                        var c = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                            d = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                        return Math.max(c, d)
                    },
                    avg: function(a, b, c) {
                        var d = void 0 !== a ? isNaN(a) ? 1 : parseFloat(a) : 0,
                            e = void 0 !== b ? isNaN(b) ? 1 : parseFloat(b) : 0;
                        return d + e
                    }
                }, g = {
                    sum: !1,
                    count: !1,
                    min: !1,
                    max: !1,
                    avg: !0
                }, h = {}, i = {}, j = 0; j < b.rows.length; j++) {
                for (var k = b.rows[j], l = h, m = i, n = 0; n < c.length; n++) {
                    var o = c[n];
                    l[o.name] || (l[o.name] = {
                        order: n,
                        index: o.index,
                        type: "key",
                        children: {}
                    }), l = l[o.name].children;
                    var p = k[o.index];
                    m[p] || (m[p] = {}), m = m[p]
                }
                for (var q = 0; q < d.length; q++) {
                    var r = d[q],
                        s = k[r.index];
                    l[s] || (l[s] = {
                        order: q,
                        index: r.index,
                        type: "group",
                        children: {}
                    }), l = l[s].children, m[s] || (m[s] = {}), m = m[s]
                }
                for (var t = 0; t < e.length; t++) {
                    var u = e[t],
                        v = u.name + "(" + u.aggr + ")";
                    l[v] || (l[v] = {
                        type: "value",
                        order: t,
                        index: u.index
                    }), m[v] ? m[v] = {
                        value: f[u.aggr](m[v].value, k[u.index], m[v].count + 1),
                        count: g[u.aggr] ? m[v].count + 1 : m[v].count
                    } : m[v] = {
                        value: "count" !== u.aggr ? k[u.index] : 1,
                        count: 1
                    }
                }
            }
            return {
                schema: h,
                rows: i
            }
        },
        E = function(b, c, d, e) {
            var f = [],
                g = b.schema,
                h = b.rows,
                i = a.paragraph.config.graph.values,
                j = function(a, b) {
                    return a ? a + "." + b : b
                },
                k = function(a, b) {
                    for (var c in a.children) b[c] = {}, k(a.children[c], b[c])
                },
                l = function(a, b, c, e, f, g, h, i) {
                    "key" === b.type ? (g = j(g, a), h = j(h, c)) : "group" === b.type ? i = j(i, c) : ("value" === b.type && a === c || o) && (i = j(i, c), f(g, h, i, e));
                    for (var m in b.children)
                        if (d && "group" === b.children[m].type && void 0 === e[m]) {
                            var n = {};
                            k(b.children[m], n), l(m, b.children[m], m, n, f, g, h, i)
                        } else
                            for (var p in e) "key" !== b.children[m].type && m !== p || l(m, b.children[m], p, e[p], f, g, h, i)
                },
                m = a.paragraph.config.graph.keys,
                n = a.paragraph.config.graph.groups;
            i = a.paragraph.config.graph.values;
            var o = 0 === m.length && 0 === n.length && i.length > 0,
                p = 0 === m.length,
                q = "multiBarChart" === e,
                r = Object.keys(g)[0],
                s = {},
                t = 0,
                u = {},
                v = 0,
                w = {};
            for (var x in h) l(r, g[r], x, h[x], function(a, b, d, e) {
                void 0 === s[b] && (w[t] = b, s[b] = t++), void 0 === u[d] && (u[d] = v++);
                var g = u[d];
                p && q && (g = 0), f[g] || (f[g] = {
                    values: [],
                    key: p && q ? "values" : d
                });
                var h = isNaN(b) ? c ? b : s[b] : parseFloat(b),
                    i = 0;
                void 0 === h && (h = d), void 0 !== e && (i = isNaN(e.value) ? 0 : parseFloat(e.value) / parseFloat(e.count)), f[g].values.push({
                    x: h,
                    y: i
                })
            });
            var y, z, A = {};
            for (y in u) z = y.substring(0, y.lastIndexOf("(")), A[z] ? A[z]++ : A[z] = 1;
            if (o)
                for (var B = 0; B < f[0].values.length; B++) y = f[0].values[B].x, y && (z = y.substring(0, y.lastIndexOf("(")), A[z] <= 1 && (f[0].values[B].x = z));
            else {
                for (var C = 0; C < f.length; C++) y = f[C].key, z = y.substring(0, y.lastIndexOf("(")), A[z] <= 1 && (f[C].key = z);
                if (1 === n.length && 1 === i.length)
                    for (C = 0; C < f.length; C++) y = f[C].key, y = y.split(".").slice(0, -1).join("."), f[C].key = y
            }
            return {
                xLabels: w,
                d3g: f
            }
        },
        F = function(b) {
            for (var c, d, e, f = a.paragraph.config.graph.scatter.xAxis, g = a.paragraph.config.graph.scatter.yAxis, h = a.paragraph.config.graph.scatter.group, i = {}, j = 0; j < b.rows.length; j++) {
                var k = b.rows[j];
                f && (c = k[f.index]), g && (d = k[g.index]), h && (e = k[h.index]);
                var l = c + "," + d + "," + e;
                i[l] ? i[l].size++ : i[l] = {
                    x: c,
                    y: d,
                    group: e,
                    size: 1
                }
            }
            var m = [];
            for (var n in i) {
                var o = [];
                f && (o[f.index] = i[n].x), g && (o[g.index] = i[n].y), h && (o[h.index] = i[n].group), o[b.rows[0].length] = i[n].size, m.push(o)
            }
            return m
        },
        G = function(b, c) {
            var d, e, f, g = a.paragraph.config.graph.scatter.xAxis,
                h = a.paragraph.config.graph.scatter.yAxis,
                i = a.paragraph.config.graph.scatter.group,
                j = a.paragraph.config.graph.scatter.size,
                k = [],
                l = [],
                m = {},
                n = [],
                o = {},
                p = {},
                q = {},
                r = {},
                s = {},
                t = {},
                u = 0,
                v = 0,
                w = 0,
                x = "";
            if (!g && !h) return {
                d3g: []
            };
            for (var y = 0; y < b.rows.length; y++) f = b.rows[y], g && (d = f[g.index], k[y] = d), h && (e = f[h.index], l[y] = e);
            var z = g && h && H(k) && H(l) || !g && H(l) || !h && H(k);
            for (m = z ? F(b) : b.rows, !i && z ? x = "count" : i || j ? !i && j && (x = j.name) : g && h ? x = "(" + g.name + ", " + h.name + ")" : g && !h ? x = g.name : !g && h && (x = h.name), y = 0; y < m.length; y++) {
                f = m[y], g && (d = f[g.index]), h && (e = f[h.index]), i && (x = f[i.index]);
                var A = z ? f[f.length - 1] : j ? f[j.index] : 1;
                void 0 === q[x] && (t[w] = x, q[x] = w++), g && void 0 === o[d] && (r[u] = d, o[d] = u++), h && void 0 === p[e] && (s[v] = e, p[e] = v++), n[q[x]] || (n[q[x]] = {
                    key: x,
                    values: []
                }), n[q[x]].values.push({
                    x: g ? isNaN(d) ? o[d] : parseFloat(d) : 0,
                    y: h ? isNaN(e) ? p[e] : parseFloat(e) : 0,
                    size: isNaN(parseFloat(A)) ? 1 : parseFloat(A)
                })
            }
            return {
                xLabels: r,
                yLabels: s,
                d3g: n
            }
        },
        H = function(a) {
            for (var b = function(a) {
                    for (var b = {}, c = [], d = 0, e = 0; e < a.length; e++) {
                        var f = a[e];
                        1 !== b[f] && (b[f] = 1, c[d++] = f)
                    }
                    return c
                }, c = 0; c < a.length; c++)
                if (isNaN(parseFloat(a[c])) && ("string" == typeof a[c] || a[c] instanceof String)) return !0;
            var d = .05,
                e = b(a);
            return e.length / a.length < d
        };
    a.isValidSizeOption = function(a, b) {
        for (var c = [], d = [], e = 0; e < b.length; e++) {
            var f = b[e],
                g = f[a.size.index];
            if (isNaN(parseFloat(g)) || !isFinite(g)) return !1;
            if (a.xAxis) {
                var h = f[a.xAxis.index];
                c[e] = h
            }
            if (a.yAxis) {
                var i = f[a.yAxis.index];
                d[e] = i
            }
        }
        var j = a.xAxis && a.yAxis && H(c) && H(d) || !a.xAxis && H(d) || !a.yAxis && H(c);
        return !j
    }, a.resizeParagraph = function(b, c) {
        a.paragraph.config.colWidth !== b ? (a.paragraph.config.colWidth = b, a.changeColWidth(), h(function() {
            s(a.paragraph.id + "_editor"), a.changeHeight(c)
        }, 200)) : a.changeHeight(c)
    }, a.changeHeight = function(b) {
        var c = angular.copy(a.paragraph.settings.params),
            d = angular.copy(a.paragraph.config);
        d.graph.height = b, u(a.paragraph.title, a.paragraph.text, d, c)
    }, "function" != typeof String.prototype.startsWith && (String.prototype.startsWith = function(a) {
        return this.slice(0, a.length) === a
    }), a.goToSingleParagraph = function() {
        var b = c.current.pathParams.noteId,
            e = location.protocol + "//" + location.host + location.pathname + "#/notebook/" + b + "/paragraph/" + a.paragraph.id + "?asIframe";
        d.open(e)
    }, a.showScrollDownIcon = function() {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        return !!b[0] && b[0].scrollHeight > b.innerHeight()
    }, a.scrollParagraphDown = function() {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        b.animate({
            scrollTop: b[0].scrollHeight
        }, 500), a.keepScrollDown = !0
    }, a.showScrollUpIcon = function() {
        return !!angular.element("#p" + a.paragraph.id + "_text")[0] && 0 !== angular.element("#p" + a.paragraph.id + "_text")[0].scrollTop
    }, a.scrollParagraphUp = function() {
        var b = angular.element("#p" + a.paragraph.id + "_text");
        b.animate({
            scrollTop: 0
        }, 500), a.keepScrollDown = !1
    }, a.exportToDSV = function(b) {
        var c = (a.paragraph.result, "");
        for (var d in a.paragraph.result.columnNames) c += a.paragraph.result.columnNames[d].name + b;
        c = c.substring(0, c.length - 1) + "\n";
        for (var e in a.paragraph.result.msgTable) {
            var f = a.paragraph.result.msgTable[e],
                g = "";
            for (var h in f) {
                var i = f[h].value.toString();
                g += i.contains(b) ? '"' + i + '"' + b : f[h].value + b
            }
            c += g.substring(0, g.length - 1) + "\n"
        }
        var j = "";
        "\t" === b ? j = "tsv" : "," === b && (j = "csv"), l.SaveAs(c, "data", j)
    }
}]), angular.module("zeppelinWebApp").controller("SearchResultCtrl", ["$scope", "$routeParams", "searchService", function(a, b, c) {
    a.isResult = !0, a.searchTerm = b.searchTerm;
    var d = c.search({
        q: b.searchTerm
    }).query();
    d.$promise.then(function(d) {
        a.notes = d.body.map(function(a) {
            return /\/paragraph\//.test(a.id) ? (a.id = a.id.replace("paragraph/", "?paragraph=") + "&term=" + b.searchTerm, a) : a
        }), 0 === a.notes.length ? a.isResult = !1 : a.isResult = !0, a.$on("$routeChangeStart", function(a, b, d) {
            "/search/:searchTerm" !== b.originalPath && (c.searchTerm = "")
        })
    }), a.page = 0, a.allResults = !1, a.highlightSearchResults = function(a) {
        return function(b) {
            function c(a) {
                var b = {
                    "ace/mode/scala": /^%(\w*\.)?spark/,
                    "ace/mode/python": /^%(\w*\.)?(pyspark|python)/,
                    "ace/mode/r": /^%(\w*\.)?(r|sparkr|knitr)/,
                    "ace/mode/sql": /^%(\w*\.)?\wql/,
                    "ace/mode/markdown": /^%md/,
                    "ace/mode/sh": /^%sh/
                };
                return Object.keys(b).reduce(function(c, d) {
                    return b[d].test(a) ? d : c
                }, "ace/mode/scala")
            }

            function d(a) {
                return function(b) {
                    for (var c = [], d = -1;
                        (d = b.indexOf(a, d + 1)) >= 0;) c.push(d);
                    return c
                }
            }
            var e = ace.require("ace/range").Range;
            b.setOption("highlightActiveLine", !1), b.$blockScrolling = 1 / 0, b.setReadOnly(!0), b.renderer.setShowGutter(!1), b.setTheme("ace/theme/chrome"), b.getSession().setMode(c(a.text));
            var f = "";
            f = "" !== a.header ? a.header + "\n\n" + a.snippet : a.snippet;
            var g = f.split("\n").map(function(c, f) {
                var g = c.match(/<B>(.+?)<\/B>/);
                if (!g) return c;
                var h = g[1],
                    i = c.replace(/<B>/g, "").replace(/<\/B>/g, ""),
                    j = d(h)(i);
                return j.forEach(function(d) {
                    var g = d + h.length;
                    "" !== a.header && 0 === f ? (b.getSession().addMarker(new e(f, 0, f, c.length), "search-results-highlight-header", "background"), b.getSession().addMarker(new e(f, d, f, g), "search-results-highlight", "line")) : b.getSession().addMarker(new e(f, d, f, g), "search-results-highlight", "line")
                }), i
            });
            b.setOption("maxLines", g.reduce(function(a, b) {
                return a + b.length
            }, 0)), b.getSession().setValue(g.join("\n"))
        }
    }
}]), angular.module("zeppelinWebApp").service("arrayOrderingSrv", function() {
    var a = this;
    this.notebookListOrdering = function(b) {
        return a.getNoteName(b)
    }, this.getNoteName = function(a) {
        return void 0 === a.name || "" === a.name.trim() ? "Note " + a.id : a.name
    }
}), angular.module("zeppelinWebApp").controller("NavCtrl", ["$scope", "$rootScope", "$http", "$routeParams", "$location", "notebookListDataFactory", "baseUrlSrv", "websocketMsgSrv", "arrayOrderingSrv", "searchService", function(a, b, c, d, e, f, g, h, i, j) {
    function k() {
        h.getNotebookList()
    }

    function l(a) {
        return d.noteId === a
    }

    function m() {
        c.get(g.getRestApiBase() + "/version").success(function(a, c, d, e) {
            b.zeppelinVersion = a.body
        }).error(function(a, b, c, d) {})
    }
    a.query = {
        q: ""
    }, a.showLoginWindow = function() {
        setTimeout(function() {
            angular.element("#userName").focus()
        }, 500)
    };
    var n = this;
    n.notes = f, n.connected = h.isConnected(), n.websocketMsgSrv = h, n.arrayOrderingSrv = i, a.searchForm = j, angular.element("#notebook-list").perfectScrollbar({
        suppressScrollX: !0
    }), angular.element(document).click(function() {
        a.query.q = ""
    }), a.$on("setNoteMenu", function(a, b) {
        f.setNotes(b)
    }), a.$on("setConnectedStatus", function(a, b) {
        n.connected = b
    }), a.$on("loginSuccess", function(a, b) {
        k()
    }), a.logout = function() {
        var a = g.getRestApiBase() + "/login/logout";
        a = a.replace("//", "//false:false@"), c.post(a).error(function() {
            c.post(a).error(function() {
                b.userName = "", b.ticket.principal = "", b.ticket.ticket = "", b.ticket.roles = "", BootstrapDialog.show({
                    message: "Logout Success"
                }), setTimeout(function() {
                    window.location.replace("/")
                }, 1e3)
            })
        })
    }, a.search = function(a) {
        e.url(/search/ + a)
    }, b.noteName = function(a) {
        if (!_.isEmpty(a)) return i.getNoteName(a)
    }, n.loadNotes = k, n.isActive = l, m(), n.loadNotes()
}]), angular.module("zeppelinWebApp").directive("ngEscape", function() {
    return function(a, b, c) {
        b.bind("keydown keyup", function(b) {
            27 === b.which && (a.$apply(function() {
                a.$eval(c.ngEscape)
            }), b.preventDefault())
        })
    }
}), angular.module("zeppelinWebApp").directive("expandCollapse", function() {
    return {
        restrict: "EA",
        link: function(a, b, c) {
            angular.element(b).click(function(a) {
                angular.element(b).find(".expandable:visible").length > 1 ? (angular.element(b).find(".expandable:visible").slideUp("slow"), angular.element(b).find("i.icon-folder-alt").toggleClass("icon-folder icon-folder-alt")) : angular.element(b).find(".expandable").first().slideToggle("200", function() {
                    angular.element(b).find("i").first().toggleClass("icon-folder icon-folder-alt")
                }), a.stopPropagation()
            })
        }
    }
}), angular.module("zeppelinWebApp").controller("NotenameCtrl", ["$scope", "notebookListDataFactory", "$rootScope", "$routeParams", "websocketMsgSrv", function(a, b, c, d, e) {
    var f = this;
    f.clone = !1, f.notes = b, f.websocketMsgSrv = e, a.note = {}, f.createNote = function() {
        if (f.clone) {
            var b = d.noteId;
            f.websocketMsgSrv.cloneNotebook(b, a.note.notename)
        } else f.websocketMsgSrv.createNotebook(a.note.notename)
    }, f.handleNameEnter = function() {
        angular.element("#noteNameModal").modal("toggle"), f.createNote()
    }, f.preVisible = function(b, c) {
        f.clone = b, f.sourceNoteName = c, a.note.notename = f.clone ? f.cloneNoteName() : f.newNoteName(), a.$apply()
    }, f.newNoteName = function() {
        var a = 1;
        return angular.forEach(f.notes.flatList, function(b) {
            if (b = b.name, b.match(/^Untitled Note [0-9]*$/)) {
                var c = 1 * b.substr(14);
                a <= c && (a = c + 1)
            }
        }), "Untitled Note " + a
    }, f.cloneNoteName = function() {
        var a = 1,
            b = "",
            c = f.sourceNoteName.lastIndexOf(" "),
            d = !!f.sourceNoteName.match("^.+?\\s\\d$"),
            e = d ? f.sourceNoteName.substr(0, c) : f.sourceNoteName,
            g = new RegExp("^" + e + " .+");
        return angular.forEach(f.notes.flatList, function(d) {
            if (d = d.name, d.match(g)) {
                var f = d.substr(c).trim();
                b = e, f = parseInt(f), a <= f && (a = f + 1)
            }
        }), b || (b = f.sourceNoteName), b + " " + a
    }
}]), angular.module("zeppelinWebApp").controller("NoteImportCtrl", ["$scope", "$timeout", "websocketMsgSrv", function(a, b, c) {
    var d = this;
    a.note = {}, a.note.step1 = !0, a.note.step2 = !1, a.maxLimit = "";
    var e = 0;
    c.listConfigurations(), a.$on("configurationsInfo", function(b, c) {
        e = c.configurations["zeppelin.websocket.max.text.message.size"], a.maxLimit = Math.round(e / 1048576)
    }), d.resetFlags = function() {
        a.note = {}, a.note.step1 = !0, a.note.step2 = !1, angular.element("#noteImportFile").val("")
    }, a.uploadFile = function() {
        angular.element("#noteImportFile").click()
    }, a.importFile = function(b) {
        a.note.errorText = "", a.note.importFile = b.files[0];
        var c = a.note.importFile,
            f = new FileReader;
        return c.size > e ? (a.note.errorText = "File size limit Exceeded!", void a.$apply()) : (f.onloadend = function() {
            d.processImportJson(f.result)
        }, void(c && f.readAsText(c)))
    }, a.uploadURL = function() {
        a.note.errorText = "", a.note.step1 = !1, b(function() {
            a.note.step2 = !0
        }, 400)
    }, d.importBack = function() {
        a.note.errorText = "", b(function() {
            a.note.step1 = !0
        }, 400), a.note.step2 = !1
    }, d.importNote = function() {
        a.note.errorText = "", a.note.importUrl ? jQuery.getJSON(a.note.importUrl, function(a) {
            d.processImportJson(a)
        }).fail(function() {
            a.note.errorText = "Unable to Fetch URL", a.$apply()
        }) : (a.note.errorText = "Enter URL", a.$apply())
    }, d.processImportJson = function(b) {
        if ("object" != typeof b) try {
            b = JSON.parse(b)
        } catch (b) {
            return a.note.errorText = "JSON parse exception", void a.$apply()
        }
        b.paragraphs && b.paragraphs.length > 0 ? (a.note.noteImportName ? b.name = a.note.noteImportName : a.note.noteImportName = b.name, c.importNotebook(b)) : a.note.errorText = "Invalid JSON", a.$apply()
    }, a.$on("setNoteMenu", function(a, b) {
        d.resetFlags(), angular.element("#noteImportModal").modal("hide")
    })
}]), angular.module("zeppelinWebApp").directive("popoverHtmlUnsafePopup", function() {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            title: "@",
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "components/popover-html-unsafe/popover-html-unsafe-popup.html"
    }
}).directive("popoverHtmlUnsafe", ["$tooltip", function(a) {
    return a("popoverHtmlUnsafe", "popover", "click")
}]), angular.module("zeppelinWebApp").directive("ngEnter", function() {
    return function(a, b, c) {
        b.bind("keydown keypress", function(b) {
            13 === b.which && (b.shiftKey || a.$apply(function() {
                a.$eval(c.ngEnter)
            }), b.preventDefault())
        })
    }
}), angular.module("zeppelinWebApp").directive("dropdownInput", function() {
    return {
        restrict: "A",
        link: function(a, b) {
            b.bind("click", function(a) {
                a.stopPropagation()
            })
        }
    }
}), angular.module("zeppelinWebApp").directive("resizable", function() {
    var a = {
        autoHide: !0,
        handles: "se",
        helper: "resizable-helper",
        stop: function() {
            angular.element(this).css({
                width: "100%",
                height: "100%"
            })
        }
    };
    return {
        restrict: "A",
        scope: {
            callback: "&onResize"
        },
        link: function(b, c, d) {
            d.$observe("resize", function(d) {
                var e = function(c, d) {
                    var e = window.innerWidth / 12;
                    c.off("resizestop");
                    var f = angular.copy(a);
                    "TABLE" === d.graphType || "TEXT" === d.graphType ? (f.grid = [e, 10], f.minHeight = 100) : (f.grid = [e, 1e4], f.minHeight = 0), f.maxWidth = window.innerWidth, c.resizable(f), c.on("resizestop", function() {
                        if (b.callback) {
                            var a = c.height();
                            a < 50 && (a = 300), b.callback({
                                width: Math.ceil(c.width() / e),
                                height: a
                            })
                        }
                    })
                };
                d = JSON.parse(d), "true" === d.allowresize && (e(c, d), angular.element(window).resize(function() {
                    e(c, d)
                }))
            })
        }
    }
}), angular.module("zeppelinWebApp").directive("modalvisible", function() {
    return {
        restrict: "A",
        scope: {
            preVisibleCallback: "&previsiblecallback",
            postVisibleCallback: "&postvisiblecallback",
            targetinput: "@targetinput"
        },
        link: function(a, b, c) {
            var d = a.preVisibleCallback,
                e = a.postVisibleCallback;
            b.on("show.bs.modal", function(a) {
                var b = angular.element(a.relatedTarget),
                    c = b.data("clone"),
                    e = b.data("source-note-name"),
                    f = !!c;
                d()(f, e)
            }), b.on("shown.bs.modal", function(b) {
                a.targetinput && angular.element(b.target).find("input#" + a.targetinput).select(), e()
            })
        }
    }
}), angular.module("zeppelinWebApp").service("websocketMsgSrv", ["$rootScope", "websocketEvents", function(a, b) {
    return {
        getHomeNotebook: function() {
            b.sendNewEvent({
                op: "GET_HOME_NOTE"
            })
        },
        createNotebook: function(a) {
            b.sendNewEvent({
                op: "NEW_NOTE",
                data: {
                    name: a
                }
            })
        },
        deleteNotebook: function(a) {
            b.sendNewEvent({
                op: "DEL_NOTE",
                data: {
                    id: a
                }
            })
        },
        cloneNotebook: function(a, c) {
            b.sendNewEvent({
                op: "CLONE_NOTE",
                data: {
                    id: a,
                    name: c
                }
            })
        },
        getNotebookList: function() {
            b.sendNewEvent({
                op: "LIST_NOTES"
            })
        },
        reloadAllNotesFromRepo: function() {
            b.sendNewEvent({
                op: "RELOAD_NOTES_FROM_REPO"
            })
        },
        getNotebook: function(a) {
            b.sendNewEvent({
                op: "GET_NOTE",
                data: {
                    id: a
                }
            })
        },
        updateNotebook: function(a, c, d) {
            b.sendNewEvent({
                op: "NOTE_UPDATE",
                data: {
                    id: a,
                    name: c,
                    config: d
                }
            })
        },
        moveParagraph: function(a, c) {
            b.sendNewEvent({
                op: "MOVE_PARAGRAPH",
                data: {
                    id: a,
                    index: c
                }
            })
        },
        insertParagraph: function(a) {
            b.sendNewEvent({
                op: "INSERT_PARAGRAPH",
                data: {
                    index: a
                }
            })
        },
        updateAngularObject: function(a, c, d, e, f) {
            b.sendNewEvent({
                op: "ANGULAR_OBJECT_UPDATED",
                data: {
                    noteId: a,
                    paragraphId: c,
                    name: d,
                    value: e,
                    interpreterGroupId: f
                }
            })
        },
        clientBindAngularObject: function(a, c, d, e) {
            b.sendNewEvent({
                op: "ANGULAR_OBJECT_CLIENT_BIND",
                data: {
                    noteId: a,
                    name: c,
                    value: d,
                    paragraphId: e
                }
            })
        },
        clientUnbindAngularObject: function(a, c, d) {
            b.sendNewEvent({
                op: "ANGULAR_OBJECT_CLIENT_UNBIND",
                data: {
                    noteId: a,
                    name: c,
                    paragraphId: d
                }
            })
        },
        cancelParagraphRun: function(a) {
            b.sendNewEvent({
                op: "CANCEL_PARAGRAPH",
                data: {
                    id: a
                }
            })
        },
        runParagraph: function(a, c, d, e, f) {
            b.sendNewEvent({
                op: "RUN_PARAGRAPH",
                data: {
                    id: a,
                    title: c,
                    paragraph: d,
                    config: e,
                    params: f
                }
            })
        },
        removeParagraph: function(a) {
            b.sendNewEvent({
                op: "PARAGRAPH_REMOVE",
                data: {
                    id: a
                }
            })
        },
        clearParagraphOutput: function(a) {
            b.sendNewEvent({
                op: "PARAGRAPH_CLEAR_OUTPUT",
                data: {
                    id: a
                }
            })
        },
        completion: function(a, c, d) {
            b.sendNewEvent({
                op: "COMPLETION",
                data: {
                    id: a,
                    buf: c,
                    cursor: d
                }
            })
        },
        commitParagraph: function(a, c, d, e, f) {
            b.sendNewEvent({
                op: "COMMIT_PARAGRAPH",
                data: {
                    id: a,
                    title: c,
                    paragraph: d,
                    config: e,
                    params: f
                }
            })
        },
        importNotebook: function(a) {
            b.sendNewEvent({
                op: "IMPORT_NOTE",
                data: {
                    notebook: a
                }
            })
        },
        checkpointNotebook: function(a, c) {
            b.sendNewEvent({
                op: "CHECKPOINT_NOTEBOOK",
                data: {
                    noteId: a,
                    commitMessage: c
                }
            })
        },
        isConnected: function() {
            return b.isConnected()
        },
        listConfigurations: function() {
            b.sendNewEvent({
                op: "LIST_CONFIGURATIONS"
            })
        }
    }
}]), angular.module("zeppelinWebApp").factory("websocketEvents", ["$rootScope", "$websocket", "$location", "$window", "baseUrlSrv", function(a, b, c, d, e) {
    var f = {};
    return f.ws = b(e.getWebsocketUrl()), f.ws.reconnectIfNotNormalClose = !0, f.ws.onOpen(function() {
        a.$broadcast("setConnectedStatus", !0), setInterval(function() {
            f.sendNewEvent({
                op: "PING"
            })
        }, 1e4)
    }), f.sendNewEvent = function(b) {
        void 0 !== a.ticket ? (b.principal = a.ticket.principal, b.ticket = a.ticket.ticket, b.roles = a.ticket.roles) : (b.principal = "", b.ticket = "", b.roles = ""), f.ws.send(JSON.stringify(b))
    }, f.isConnected = function() {
        return 1 === f.ws.socket.readyState
    }, f.ws.onMessage(function(b) {
        var e;
        b.data && (e = angular.fromJson(b.data));
        var f = e.op,
            g = e.data;
        "NOTE" === f ? a.$broadcast("setNoteContent", g.note) : "NEW_NOTE" === f ? c.path("notebook/" + g.note.id) : "NOTES_INFO" === f ? a.$broadcast("setNoteMenu", g.notes) : "AUTH_INFO" === f ? BootstrapDialog.show({
            closable: !1,
            closeByBackdrop: !1,
            closeByKeyboard: !1,
            title: "Insufficient privileges",
            message: g.info.toString(),
            buttons: [{
                label: "Login",
                action: function(a) {
                    a.close(), angular.element("#loginModal").modal({
                        show: "true"
                    })
                }
            }, {
                label: "Cancel",
                action: function(a) {
                    a.close(), d.location.replace("/")
                }
            }]
        }) : "PARAGRAPH" === f ? a.$broadcast("updateParagraph", g) : "PARAGRAPH_APPEND_OUTPUT" === f ? a.$broadcast("appendParagraphOutput", g) : "PARAGRAPH_UPDATE_OUTPUT" === f ? a.$broadcast("updateParagraphOutput", g) : "PROGRESS" === f ? a.$broadcast("updateProgress", g) : "COMPLETION_LIST" === f ? a.$broadcast("completionList", g) : "ANGULAR_OBJECT_UPDATE" === f ? a.$broadcast("angularObjectUpdate", g) : "ANGULAR_OBJECT_REMOVE" === f ? a.$broadcast("angularObjectRemove", g) : "CONFIGURATIONS_INFO" === f && a.$broadcast("configurationsInfo", g)
    }), f.ws.onError(function(b) {
        a.$broadcast("setConnectedStatus", !1)
    }), f.ws.onClose(function(b) {
        a.$broadcast("setConnectedStatus", !1)
    }), f
}]), angular.module("zeppelinWebApp").factory("notebookListDataFactory", function() {
    var a = {
            root: {
                children: []
            },
            flatList: [],
            setNotes: function(c) {
                a.flatList = angular.copy(c), a.root = {
                    children: []
                }, _.reduce(c, function(a, c) {
                    var d = c.name || c.id,
                        e = d.match(/([^\/][^\/]*)/g);
                    return b(a, e, c.id), a
                }, a.root)
            }
        },
        b = function(a, c, d) {
            if (1 === c.length) a.children.push({
                name: c[0],
                id: d
            });
            else {
                var e = c.shift(),
                    f = _.find(a.children, function(a) {
                        return a.name === e && void 0 !== a.children
                    });
                if (void 0 !== f) b(f, c, d);
                else {
                    var g = {
                        name: e,
                        hidden: !0,
                        children: []
                    };
                    a.children.push(g), b(g, c, d)
                }
            }
        };
    return a
}), angular.module("zeppelinWebApp").service("baseUrlSrv", function() {
    this.getPort = function() {
        var a = Number(location.port);
        return a || (a = 80, "https:" === location.protocol && (a = 443)), 3333 !== a && 9e3 !== a || (a = 8080), a
    }, this.getWebsocketUrl = function() {
        var b = "https:" === location.protocol ? "wss:" : "ws:";
        return b + "//" + location.hostname + ":" + this.getPort() + a(location.pathname) + "/ws"
    }, this.getRestApiBase = function() {
        return location.protocol + "//" + location.hostname + ":" + this.getPort() + a(location.pathname) + "/api"
    };
    var a = function(a) {
        return a.replace(/\/$/, "")
    }
}), angular.module("zeppelinWebApp").service("browserDetectService", function() {
    this.detectIE = function() {
        var a = window.navigator.userAgent,
            b = a.indexOf("MSIE ");
        if (b > 0) return parseInt(a.substring(b + 5, a.indexOf(".", b)), 10);
        var c = a.indexOf("Trident/");
        if (c > 0) {
            var d = a.indexOf("rv:");
            return parseInt(a.substring(d + 3, a.indexOf(".", d)), 10)
        }
        var e = a.indexOf("Edge/");
        return e > 0 && parseInt(a.substring(e + 5, a.indexOf(".", e)), 10)
    }
}), angular.module("zeppelinWebApp").service("SaveAsService", ["browserDetectService", function(a) {
    this.SaveAs = function(b, c, d) {
        var e = "\ufeff";
        if (a.detectIE()) {
            angular.element("body").append('<iframe id="SaveAsId" style="display: none"></iframe>');
            var f = angular.element("body > iframe#SaveAsId")[0].contentWindow;
            b = e + b, f.document.open("text/json", "replace"), f.document.write(b), f.document.close(), f.focus();
            var g = Date.now();
            f.document.execCommand("SaveAs", !1, c + "." + d);
            var h = Date.now();
            g === h && f.document.execCommand("SaveAs", !0, c + ".txt"), angular.element("body > iframe#SaveAsId").remove()
        } else {
            b = "data:image/svg;charset=utf-8," + e + encodeURIComponent(b), angular.element("body").append('<a id="SaveAsId"></a>');
            var i = angular.element("body > a#SaveAsId");
            i.attr("href", b), i.attr("download", c + "." + d), i.attr("target", "_blank"), i[0].click(), i.remove()
        }
    }
}]), angular.module("zeppelinWebApp").service("searchService", ["$resource", "baseUrlSrv", function(a, b) {
    this.search = function(c) {
        if (this.searchTerm = c.q, c.q) {
            var d = window.encodeURIComponent(c.q);
            return a(b.getRestApiBase() + "/notebook/search?q=" + d, {}, {
                query: {
                    method: "GET"
                }
            })
        }
    }, this.searchTerm = ""
}]), angular.module("zeppelinWebApp").controller("LoginCtrl", ["$scope", "$rootScope", "$http", "$httpParamSerializer", "baseUrlSrv", function(a, b, c, d, e) {
    a.loginParams = {}, a.login = function() {
        c({
            method: "POST",
            url: e.getRestApiBase() + "/login",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: d({
                userName: a.loginParams.userName,
                password: a.loginParams.password
            })
        }).then(function(c) {
            b.ticket = c.data.body, angular.element("#loginModal").modal("toggle"), b.$broadcast("loginSuccess", !0), b.userName = a.loginParams.userName
        }, function(b) {
            a.loginParams.errorText = "The username and password that you entered don't match."
        })
    }, a.$on("initLoginValues", function() {
        f()
    });
    var f = function() {
        a.loginParams = {
            userName: "",
            password: ""
        }
    }
}]);
