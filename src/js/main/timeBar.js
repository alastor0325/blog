(function () {
    'use strict';

    // --- Pure helpers (unit-tested in tests/timeBar.test.js) ---

    function clamp01(value) {
        if (value < 0) {
            return 0;
        }
        if (value > 1) {
            return 1;
        }
        return value;
    }

    // Reading progress through an article as a fraction in [0, 1].
    // 0 = article top resting at the viewport top; 1 = article bottom resting at
    // the viewport bottom (i.e. the end of the article is fully in view). All
    // values are document-space pixels, so the article's offset from the top of
    // the page is taken into account and the viewport height is subtracted.
    function computeProgress(scrollTop, articleTop, articleHeight, viewportHeight) {
        var scrollable = articleHeight - viewportHeight;
        if (scrollable <= 0) {
            // Article fits within the viewport: nothing to scroll, so it is read.
            return 1;
        }
        return clamp01((scrollTop - articleTop) / scrollable);
    }

    function pad(value) {
        return (value < 10) ? '0' + value : '' + value;
    }

    function formatTime(seconds) {
        var minutes = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return pad(minutes) + ':' + pad(secs);
    }

    // Expose the pure helpers to the Node test runner. `module` is undefined in
    // the browser, so this is a no-op in the concatenated bundle.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            clamp01: clamp01,
            computeProgress: computeProgress,
            formatTime: formatTime
        };
    }

    // No DOM (e.g. running under the test runner) — stop after exporting.
    if (typeof document === 'undefined') {
        return;
    }

    // --- Browser wiring ---

    var post = document.querySelector('.post-content');
    var timeBar = document.querySelector('.time-bar');

    if (!post || !timeBar) {
        return;
    }

    var completed = timeBar.querySelector('.completed');
    var remaining = timeBar.querySelector('.remaining');
    var timeCompleted = timeBar.querySelector('.time-completed');
    var timeRemaining = timeBar.querySelector('.time-remaining');
    var totalSeconds = parseInt(timeBar.getAttribute('data-minutes'), 10) * 60;

    var ticking = false;
    var wasFinished = false;

    function render() {
        ticking = false;

        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // Geometry is read live so the bar stays accurate after late layout
        // shifts (images, web fonts) rather than relying on a cached height.
        var rect = post.getBoundingClientRect();
        var articleTop = rect.top + scrollTop;
        var progress = computeProgress(scrollTop, articleTop, rect.height, window.innerHeight);
        var finished = progress >= 1;

        // Slide the bar in while reading; hide it at the very top and once the
        // reader has reached the end of the article.
        if (scrollTop > 0 && !finished) {
            timeBar.style.bottom = '0%';
        } else {
            timeBar.style.bottom = '-100%';
        }

        var completedVal = (progress * 100).toFixed(2);
        completed.style.width = completedVal + '%';
        remaining.style.width = (100 - parseFloat(completedVal)) + '%';

        var completedSeconds = Math.round(progress * totalSeconds);
        timeCompleted.innerText = formatTime(completedSeconds);
        timeRemaining.innerText = formatTime(totalSeconds - completedSeconds);

        if (finished && !wasFinished) {
            triggerFinishedReading();
        } else if (!finished) {
            triggerStillReading();
        }
        wasFinished = finished;
    }

    function requestRender() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(render);
        }
    }

    document.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender);
    render();

    function triggerStillReading() {
        var readEvent = document.createEvent('CustomEvent');
        readEvent.initCustomEvent('stillReading');
        document.dispatchEvent(readEvent);
    }

    function triggerFinishedReading() {
        var readEvent = document.createEvent('CustomEvent');
        readEvent.initCustomEvent('finishedReading');
        document.dispatchEvent(readEvent);
    }
})();
