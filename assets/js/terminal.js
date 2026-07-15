(function () {
  "use strict";

  // ── Virtual Filesystem ──────────────────────────────────────────────
  var files = {};
  (function () {
    var cfg = window.TERMINAL_CONFIG;
    if (cfg && Array.isArray(cfg.lines)) {
      cfg.lines.forEach(function (l) {
        var m = /^cat (.+)$/.exec(l.cmd);
        if (m && l.output !== undefined) {
          files[m[1]] = l.output;
        }
      });
    }
  })();

  window.TerminalVFS = {
    ls: function () {
      return Object.keys(files).join("  ");
    },
    cat: function (name) {
      return files.hasOwnProperty(name) ? files[name] : null;
    },
    exists: function (name) {
      return files.hasOwnProperty(name);
    },
    listFiles: function () {
      return Object.keys(files).sort();
    },
  };

  // ── Boot Sequence + Completion ─────────────────────────────────────
  function runBoot(cfg, commands, onReady) {
    var lines = cfg.lines || [];
    if (lines.length === 0) {
      onReady(null);
      return;
    }

    var promptStr = cfg.prompt || "> ";
    var betweenDelay = cfg.between_lines_delay || 300;
    var startDelay = cfg.start_delay || 400;

    window.terminalCompletion = function (string, callback) {
      var full = (this.get_command && this.get_command()) || "";
      var parts = full.split(/\s+/);
      var cmd = parts[0];
      if (
        full.length > cmd.length &&
        (cmd === "cat" || cmd === "head" || cmd === "tail" || cmd === "wc")
      ) {
        callback(window.TerminalVFS ? window.TerminalVFS.listFiles() : []);
        return;
      }
      callback(Object.keys(window.TerminalCommands || {}));
    };

    $("#terminal-output").terminal(commands, {
      prompt: "",
      greetings: false,
      name: "portfolio_terminal",
      height: 350,
      enabled: false,
      checkArity: false,
      completion: window.terminalCompletion,
    });

    var term = $("#terminal-output").terminal("get");

    var welcomeMsg =
      cfg.interactive && cfg.interactive.welcome
        ? cfg.interactive.welcome
        : "Welcome to terminal. To get help, enter `help`";
    term.echo(welcomeMsg, {
      finalize: function (div) {
        if (div && div.addClass) div.addClass("term-out-line");
      },
    });

    function typeBoot() {
      var i = 0;

      function typeLine() {
        if (i >= lines.length) {
          onReady(term);
          return;
        }

        var line = lines[i];

        term
          .echo(promptStr + line.cmd, {
            typing: true,
            delay: line.speed || 80,
          })
          .then(function () {
            var to = document.querySelector(
              "#terminal-output .terminal-output"
            );
            if (to && to.lastElementChild) {
              to.lastElementChild.classList.add("term-cmd-line");
            }
            if (line.output) {
              term.echo(line.output, {
                finalize: function (div) {
                  if (div && div.addClass) div.addClass("term-out-line");
                },
              });
            }

            i++;
            setTimeout(typeLine, betweenDelay);
          });
      }

      setTimeout(typeLine, startDelay);
    }

    typeBoot();
  }

  window.TerminalBoot = { run: runBoot };

  // ── jQuery Terminal Init ──────────────────────────────────────────
  var pageLoadTime = Date.now();

  function applyScheme(scheme) {
    var el = document.querySelector(".terminal");
    if (!el) return;
    el.style.setProperty("--terminal-bg", scheme.background);
    el.style.setProperty("--terminal-bar-bg", scheme.bar_background);
    el.style.setProperty("--terminal-text", scheme.text);
    el.style.setProperty("--terminal-prompt", scheme.prompt);
    el.style.setProperty("--terminal-output", scheme.output);
    el.style.setProperty("--terminal-cmd", scheme.cmd);
    el.style.setProperty("--terminal-cursor", scheme.cursor);
    el.style.setProperty("--terminal-title", scheme.title);
    el.style.background = scheme.background;
    var outEl = document.getElementById("terminal-output");
    if (outEl) {
      outEl.style.setProperty("--color", scheme.text);
      outEl.style.setProperty("--background", scheme.background);
    }
    var promptEl = document.querySelector("#terminal-output .cmd-prompt");
    if (promptEl) {
      promptEl.style.color = scheme.prompt;
    }
  }

  function loadjQueryTerminal() {
    if ($.fn && $.fn.terminal) {
      return Promise.resolve();
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/jquery.terminal@2.46.1/js/jquery.terminal.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function buildCommands(cfg) {
    var lineByCmd = {};
    (cfg.lines || []).forEach(function (l) {
      lineByCmd[l.cmd] = l.output;
    });

    function vfsCat(file) {
      var key = "cat " + file;
      if (lineByCmd[key] !== undefined) return lineByCmd[key];
      return window.TerminalVFS ? window.TerminalVFS.cat(file) : null;
    }

    var commands = {
      whoami: function () {
        this.echo(lineByCmd["whoami"] || "Alexander Pitkin");
      },
      pwd: function () {
        this.echo("/home/alex");
      },
      echo: function () {
        var args = Array.prototype.slice.call(arguments);
        this.echo(args.join(" "));
      },
      uname: function (flag) {
        if (flag === "-a" || flag === "--all") {
          this.echo(
            "Linux portfolio 5.15.0-peleccom #1 SMP x86_64 GNU/Linux"
          );
        } else {
          this.echo("Linux");
        }
      },
      uptime: function () {
        var now = new Date();
        var hours = String(now.getHours()).padStart(2, "0");
        var mins = String(now.getMinutes()).padStart(2, "0");
        var secs = String(now.getSeconds()).padStart(2, "0");
        var elapsed = Math.floor((Date.now() - pageLoadTime) / 1000);
        var d = Math.floor(elapsed / 86400);
        var h = Math.floor((elapsed % 86400) / 3600);
        var m = Math.floor((elapsed % 3600) / 60);
        var s = elapsed % 60;
        var upStr =
          d > 0
            ? d +
              " days, " +
              String(h).padStart(2, "0") +
              ":" +
              String(m).padStart(2, "0") +
              ":" +
              String(s).padStart(2, "0")
            : String(h).padStart(2, "0") +
              ":" +
              String(m).padStart(2, "0") +
              ":" +
              String(s).padStart(2, "0");
        this.echo(
          hours +
            ":" +
            mins +
            ":" +
            secs +
            " up " +
            upStr +
            ", 1 user, load average: 0.42, 0.31, 0.22"
        );
      },
      cat: function (file) {
        if (!file) {
          this.echo("cat: missing operand");
          this.echo("Usage: cat <filename>");
          return;
        }
        var content = vfsCat(file);
        if (content !== null) {
          this.echo(content);
        } else {
          this.echo("cat: " + file + ": No such file or directory");
        }
      },
      head: function (file) {
        if (!file) {
          this.echo("head: missing operand");
          this.echo("Usage: head <filename>");
          return;
        }
        var content = vfsCat(file);
        if (content !== null) {
          this.echo(content.split("\n")[0]);
        } else {
          this.echo("head: " + file + ": No such file or directory");
        }
      },
      tail: function (file) {
        if (!file) {
          this.echo("tail: missing operand");
          this.echo("Usage: tail <filename>");
          return;
        }
        var content = vfsCat(file);
        if (content !== null) {
          var linesArr = content.split("\n");
          this.echo(linesArr[linesArr.length - 1]);
        } else {
          this.echo("tail: " + file + ": No such file or directory");
        }
      },
      wc: function (file) {
        if (!file) {
          this.echo("wc: missing operand");
          this.echo("Usage: wc <filename>");
          return;
        }
        var content = vfsCat(file);
        if (content !== null) {
          var lines = content.split("\n").length;
          var words = content
            .split(/\s+/)
            .filter(function (w) {
              return w;
            }).length;
          var chars = content.length;
          this.echo("  " + lines + "  " + words + "  " + chars + " " + file);
        } else {
          this.echo("wc: " + file + ": No such file or directory");
        }
      },
      ls: function () {
        this.echo(window.TerminalVFS.ls());
      },
      date: function () {
        var now = new Date();
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        var day = days[now.getDay()];
        var month = months[now.getMonth()];
        var date = String(now.getDate()).padStart(2, "0");
        var hours = String(now.getHours()).padStart(2, "0");
        var mins = String(now.getMinutes()).padStart(2, "0");
        var secs = String(now.getSeconds()).padStart(2, "0");
        var tzParts = new Intl.DateTimeFormat("en", {
          timeZoneName: "short",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).formatToParts(now);
        var tzPart = tzParts.find(function (p) {
          return p.type === "timeZoneName";
        });
        var tz = tzPart ? tzPart.value : "UTC";
        var year = now.getFullYear();
        this.echo(
          day +
            " " +
            month +
            " " +
            date +
            " " +
            hours +
            ":" +
            mins +
            ":" +
            secs +
            " " +
            tz +
            " " +
            year
        );
      },
      history: function () {
        var term = this;
        var hist = term.history().data();
        for (var i = 0; i < hist.length; i++) {
          term.echo("  " + (i + 1) + "  " + hist[i]);
        }
      },
      clear: function () {
        this.clear();
      },
      which: function (cmd) {
        var builtins = [
          "whoami",
          "pwd",
          "echo",
          "uname",
          "uptime",
          "cat",
          "head",
          "tail",
          "wc",
          "ls",
          "date",
          "history",
          "clear",
          "which",
          "man",
          "sudo",
          "neofetch",
          "help",
          "exit",
        ];
        if (builtins.indexOf(cmd) !== -1) {
          this.echo("/usr/bin/" + cmd);
        } else {
          this.echo(
            "which: no " +
              cmd +
              " in (/usr/local/bin:/usr/bin:/bin)"
          );
        }
      },
      man: function (cmd) {
        var manPages = {
          whoami:
            "WHOAMI(1)\n\nNAME\n       whoami - print effective userid\n\nSYNOPSIS\n       whoami\n\nDESCRIPTION\n       Print the username of the current effective user.",
          cat:
            "CAT(1)\n\nNAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [FILE]...\n\nDESCRIPTION\n       Concatenate FILE(s) to standard output.",
          ls:
            "LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls\n\nDESCRIPTION\n       List information about files in the current directory.",
          date:
            "DATE(1)\n\nNAME\n       date - print the system date and time\n\nSYNOPSIS\n       date\n\nDESCRIPTION\n       Display the current date and time.",
          pwd:
            "PWD(1)\n\nNAME\n       pwd - print name of current/working directory\n\nSYNOPSIS\n       pwd\n\nDESCRIPTION\n       Print the full pathname of the current working directory.",
          echo:
            "ECHO(1)\n\nNAME\n       echo - display a line of text\n\nSYNOPSIS\n       echo [STRING]...\n\nDESCRIPTION\n       Display the STRING(s) to standard output.",
          help:
            "HELP(1)\n\nNAME\n       help - show available commands\n\nSYNOPSIS\n       help\n\nDESCRIPTION\n       Display a list of all available commands.",
        };
        if (cmd && manPages[cmd]) {
          this.echo(manPages[cmd]);
        } else if (cmd) {
          this.echo("No manual entry for " + cmd);
        } else {
          this.echo("What manual page do you want?");
          this.echo("For example, try 'man whoami'.");
        }
      },
      sudo: function () {
        this.echo("[sudo] password for alexander: ");
        this.echo(
          "Sorry, user alexander is not in the sudoers file. This incident will be reported."
        );
      },
      neofetch: function () {
        var elapsed = Math.floor((Date.now() - pageLoadTime) / 1000);
        var d = Math.floor(elapsed / 86400);
        var h = Math.floor((elapsed % 86400) / 3600);
        var m = Math.floor((elapsed % 3600) / 60);
        var s = elapsed % 60;
        var upStr =
          d > 0
            ? d +
              " days, " +
              h +
              " hours, " +
              m +
              " mins, " +
              s +
              " secs"
            : h +
              " hours, " +
              m +
              " mins, " +
              s +
              " secs";
        var art = [
          "       _,met$$$$$gg.          alexander@portfolio",
          "    ,g$$$$$$$$$$$$$$$P.       ---------------",
          '  ,g$$P"     """""""Y$$.$.   OS: Linux 5.15.0-peleccom x86_64',
          " ,$$P'              `$$$.    Host: peleccom.github.io",
          "',$$P       ,ggs.     `$$b:  Kernel: 5.15.0-peleccom",
          "`d$$'     ,$P\"'   .    $$$   Uptime: " + upStr,
          " $$P      d$'     ,    $$P   Shell: portfolio-sh 1.0",
          " $$;      Y$b._   _,d$P'    CPU: JavaScript Engine @ 3.6GHz",
          " Y$$.    `.`\"Y$$$$P\"'       Memory: 128MB / 256MB",
          ' `$$b      "-.__             ',
          "  `Y$$                        ",
          "   `Y$$.                      ",
          "     `$$b.                    ",
          "       `Y$$b.                 ",
          '          `"Y$b._             ',
          '              `"""            ',
        ];
        this.echo(art.join("\n"));
      },
      exit: function () {
        this.echo("Goodbye!");
        this.set_prompt("");
        this.disable();
      },
      help: function () {
        this.echo("Available commands:");
        this.echo("  whoami          - Print current user");
        this.echo("  pwd             - Print working directory");
        this.echo("  echo <text>     - Print text");
        this.echo("  uname [-a]      - System information");
        this.echo("  uptime          - System uptime");
        this.echo("  cat <file>      - Display file contents");
        this.echo("  head <file>     - First line of file");
        this.echo("  tail <file>     - Last line of file");
        this.echo("  wc <file>       - Word/line count");
        this.echo("  ls              - List files");
        this.echo("  date            - Current date and time");
        this.echo("  history         - Command history");
        this.echo("  clear           - Clear terminal");
        this.echo("  which <cmd>     - Locate a command");
        this.echo("  man <cmd>       - Manual page");
        this.echo("  sudo <cmd>      - Execute as superuser");
        this.echo("  neofetch        - System info with ASCII art");
        this.echo("  help            - Show this help");
        this.echo("  exit            - Disable terminal");
      },
    };

    return commands;
  }

  function startInteractive(cfg, term, commands) {
    var interactive = cfg.interactive || {};

    var isMobileTerminal =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (term) {
      term.set_prompt(interactive.prompt || "> ");
      term.option("checkArity", false);
      if (!isMobileTerminal) {
        term.option("enabled", true);
        term.focus();
      }

      var _echo = term.echo.bind(term);
      term.echo = function (arg, opts) {
        opts = opts || {};
        if (
          !opts.finalize &&
          (typeof arg === "string" || arg instanceof String)
        ) {
          opts.finalize = function (div) {
            if (div && div.addClass) div.addClass("term-out-line");
          };
        }
        return _echo(arg, opts);
      };
    } else {
      $("#terminal-output").terminal(commands, {
        prompt: interactive.prompt || "> ",
        greetings: false,
        name: "portfolio_terminal",
        height: 350,
        checkArity: false,
        completion: window.terminalCompletion,
        historyFilter: true,
        enabled: !isMobileTerminal,
      });
    }
  }

  function init() {
    var cfg = window.TERMINAL_CONFIG;
    if (!cfg) return;

    loadjQueryTerminal().then(function () {
      var schemes = cfg.schemes || {};
      var savedScheme = localStorage.getItem("terminal-scheme");
      var activeName =
        savedScheme && schemes[savedScheme]
          ? savedScheme
          : cfg.active_scheme || "default";

      applyScheme(schemes[activeName]);

      var select = document.getElementById("schemeSelect");
      if (select) {
        select.value = activeName;
        select.addEventListener("change", function () {
          var name = this.value;
          if (!schemes[name]) return;
          localStorage.setItem("terminal-scheme", name);
          applyScheme(schemes[name]);
        });
      }

      var commands = buildCommands(cfg);
      window.TerminalCommands = commands;

      window.TerminalBoot.run(cfg, commands, function (term) {
        startInteractive(cfg, term, commands);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
