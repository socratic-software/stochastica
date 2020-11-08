window.MathJax = {
    startup: {
        ready() {
            if (MathJax.version === '3.0.5') {
                const SVGWrapper = MathJax._.output.svg.Wrapper.SVGWrapper;
                const CommonWrapper = SVGWrapper.prototype.__proto__;
                SVGWrapper.prototype.unicodeChars = function (text, variant) {
                    if (!variant) variant = this.variant || 'normal';
                    return CommonWrapper.unicodeChars.call(this, text, variant);
                }
            }
            MathJax.startup.defaultReady();
        }
    },
    tex: {
        inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"]
        ],
        displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"]
        ],
        // extensions: ["color.js", "AMSmath.js", "AMSsymbols.js"],
        // processEscapes: true,
        // processEnvironments: true
    },
    svg: {
        fontCache: "none", // possible values "global" (per page), "local" (per equation) or "none"
    },
    // options: {
    //     ignoreHtmlClass: ".*|",
    //     processHtmlClass: "arithmatex"
    // }
};