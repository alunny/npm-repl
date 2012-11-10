// class for a Repl, given a CodeMirror editor
function Repl(editor) {
    this.editor = editor;
    this.environment = new Env;

    this.editor.repl = this;
}

Repl.prototype.evaluate = function (input) {
    return this.environment.eval(input);
}

var replKeyMap = CodeMirror.keyMap.repl = {
    'Enter': function (cm) {
        // evaluate current line in env, print output
        var currentLine = cm.getCursor().line,
            outputLine = currentLine + 1,
            nextLine = outputLine + 1,
            contents = cm.getLine(currentLine);

        output = cm.repl.evaluate(contents);
        addLines(cm, 2)

        if (output instanceof Error) {
            cm.setLine(outputLine, output.name + ': ' + output.message);
            cm.setLineClass(outputLine, 'error_output');
        } else {
            cm.setLine(outputLine, output);
            cm.setLineClass(outputLine, 'repl_output');
        }

        cm.setCursor({ line: nextLine, ch: 0 });

        myMirror.setMarker(currentLine, '> ', 'old_cursor');
        myMirror.setMarker(nextLine, '> ', 'active_cursor');
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

    this.eval = function (code) {
        try {
            _ = eval(code);
            return _.toString();
        } catch (e) {
            return e;
        }
    }
}
