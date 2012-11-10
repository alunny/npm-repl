document.addEventListener('DOMContentLoaded', function () {
    /* fullscreen logic from
     * view-source:http://codemirror.net/demo/fullscreen.html
     */
    function makeFullscreen(cm) {
        var wrap = cm.getWrapperElement(),
            scroll = cm.getScrollerElement();


        wrap.className += " CodeMirror-fullscreen";
        scroll.style.height = winHeight() + "px";
        document.documentElement.style.overflow = "hidden";

        CodeMirror.connect(window, "resize", function() {
            scroll.style.height = winHeight() + "px";
        });
    }

    function winHeight() {
        return window.innerHeight ||
            (document.documentElement || document.body).clientHeight;
    }

    window.npmRepl = {};

    var mirror = window.npmRepl.mirror = CodeMirror(document.body, {
        gutter: true,
        fixedGutter: true,
        mode: 'javascript',
        keyMap: 'repl'
    });

    window.npmRepl.repl = new Repl(mirror);

    mirror.setMarker(0, '> ', 'active_cursor');

    makeFullscreen(mirror);
}, false);
