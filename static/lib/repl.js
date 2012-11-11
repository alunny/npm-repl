// class for a Repl, given a CodeMirror editor
function Repl(editor) {
    this.editor = editor;
    this.environment = new Env;

    this.editor.repl = this;
    this.history = [];
    this.entryNumber = 0;
    this.historyIndex = -1;
}

Repl.prototype.evaluate = function (input) {
    return this.environment.eval(input);
}

var replKeyMap = CodeMirror.keyMap.repl = {
    'Enter': function (cm) {
        // evaluate current line in env, print output
        var repl = cm.repl,
            currentLine = cm.getCursor().line,
            outputLine = currentLine + 1,
            nextLine = outputLine + 1,
            contents = cm.getLine(currentLine);

        if (repl.entryNumber == (repl.history.length - 1)) {
            repl.history[repl.entryNumber] = contents;
        } else {
            repl.history.push(contents);
        }

        output = repl.evaluate(contents);
        addLines(cm, 2)

        if (output instanceof Error) {
            cm.setLine(outputLine, output.name + ': ' + output.message);
            cm.setLineClass(outputLine, 'error_output');
        } else {
            cm.setLine(outputLine, output);
            cm.setLineClass(outputLine, 'repl_output');
        }

        cm.setCursor({ line: nextLine, ch: 0 });

        cm.setMarker(currentLine, '> ', 'old_cursor');
        cm.setMarker(nextLine, '> ', 'active_cursor');

        repl.entryNumber += 1;
        repl.historyIndex = -1;
    },
    'Up':       historyBack,
    'Ctrl-P':   historyBack,
    'Down':     historyForward,
    'Ctrl-N':   historyForward
}

function historyBack(cm) {
    var currentLine = cm.getCursor().line,
        repl = cm.repl,
        historyIndex;

    if (repl.entryNumber > 0 && repl.historyIndex != 0) {
        if (repl.historyIndex > 0) {
            historyIndex = repl.historyIndex -= 1;
        } else {
            // save contents of current line
            repl.history.push(cm.getLine(currentLine));
            historyIndex = repl.historyIndex = repl.entryNumber - 1;
        }

        cm.setLine(currentLine, repl.history[historyIndex])
    }
}

function historyForward(cm) {
    var currentLine = cm.getCursor().line,
        repl = cm.repl,
        historyIndex;

    if (repl.entryNumber > 0 && repl.historyIndex < repl.history.length - 1) {
        historyIndex = repl.historyIndex += 1;
        cm.setLine(currentLine, repl.history[historyIndex])
    }
}

function addLines(cm, n) {
    var lastLine = cm.lineCount() - 1,
        contents = cm.getLine(lastLine),
        n = n || 1,
        nls = [];

    while (n-- > 0) {
        nls.push('\n');
    }

    cm.setLine(lastLine, contents + nls.join(''));
}

function Env() {
    var _;

    function stringify(thing) {
        if (thing === undefined) {
            return 'undefined';
        } else if (thing === null) {
            return 'null';
        } else if (typeof thing == 'function') {
            return thing.toString();
        } else {
            return JSON.stringify(thing);
        }
    }

    this.eval = function (code) {
        try {
            _ = eval(code);
            return stringify(_);
        } catch (e) {
            return e;
        }
    }
}
