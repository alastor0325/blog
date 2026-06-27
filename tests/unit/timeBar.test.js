'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    clamp01,
    computeProgress,
    scrollTargetForFraction,
    fractionFromX,
    formatTime
} = require('../../src/js/main/timeBar.js');

// A typical tall article: 4000px tall, 800px viewport => 3200px of scroll range.
const ARTICLE_HEIGHT = 4000;
const VIEWPORT = 800;
const SCROLLABLE = ARTICLE_HEIGHT - VIEWPORT; // 3200

test('computeProgress is 0 at the very top of the article', () => {
    assert.equal(computeProgress(0, 0, ARTICLE_HEIGHT, VIEWPORT), 0);
});

test('computeProgress is 0.5 at the midpoint', () => {
    assert.equal(computeProgress(SCROLLABLE / 2, 0, ARTICLE_HEIGHT, VIEWPORT), 0.5);
});

test('computeProgress reaches 1 exactly when the article bottom meets the viewport bottom', () => {
    // This is the core of the bug fix: 100% means the END of the article is on
    // screen, which happens after scrolling (height - viewport), NOT (height).
    assert.equal(computeProgress(SCROLLABLE, 0, ARTICLE_HEIGHT, VIEWPORT), 1);
});

test('computeProgress accounts for the article offset from the top of the document', () => {
    // Header pushes the article 500px down the page. Progress must be measured
    // relative to the article, not the document origin.
    const top = 500;
    assert.equal(computeProgress(top, top, ARTICLE_HEIGHT, VIEWPORT), 0);
    assert.equal(computeProgress(top + SCROLLABLE / 2, top, ARTICLE_HEIGHT, VIEWPORT), 0.5);
    assert.equal(computeProgress(top + SCROLLABLE, top, ARTICLE_HEIGHT, VIEWPORT), 1);
});

test('computeProgress clamps below the article to 0', () => {
    assert.equal(computeProgress(0, 500, ARTICLE_HEIGHT, VIEWPORT), 0);
});

test('computeProgress clamps past the article to 1', () => {
    assert.equal(computeProgress(99999, 0, ARTICLE_HEIGHT, VIEWPORT), 1);
});

test('computeProgress returns 1 when the article is shorter than the viewport', () => {
    // Nothing to scroll, so the whole article is already read.
    assert.equal(computeProgress(0, 0, 600, VIEWPORT), 1);
});

test('scrollTargetForFraction maps 0/0.5/1 to the article top, midpoint, and end', () => {
    assert.equal(scrollTargetForFraction(0, 0, ARTICLE_HEIGHT, VIEWPORT), 0);
    assert.equal(scrollTargetForFraction(0.5, 0, ARTICLE_HEIGHT, VIEWPORT), SCROLLABLE / 2);
    assert.equal(scrollTargetForFraction(1, 0, ARTICLE_HEIGHT, VIEWPORT), SCROLLABLE);
});

test('scrollTargetForFraction accounts for the article offset from the document top', () => {
    const top = 500;
    assert.equal(scrollTargetForFraction(0, top, ARTICLE_HEIGHT, VIEWPORT), top);
    assert.equal(scrollTargetForFraction(1, top, ARTICLE_HEIGHT, VIEWPORT), top + SCROLLABLE);
});

test('scrollTargetForFraction is the inverse of computeProgress (round trip)', () => {
    const top = 500;
    for (const scrollTop of [500, 1200, 2100, 3700]) {
        const f = computeProgress(scrollTop, top, ARTICLE_HEIGHT, VIEWPORT);
        assert.equal(scrollTargetForFraction(f, top, ARTICLE_HEIGHT, VIEWPORT), scrollTop);
    }
});

test('scrollTargetForFraction clamps a short article to the article top', () => {
    // Article shorter than the viewport: there is nowhere to scroll.
    assert.equal(scrollTargetForFraction(0.5, 300, 600, VIEWPORT), 300);
});

test('fractionFromX maps a click position along the track', () => {
    // Track spans clientX 100..900 (width 800).
    assert.equal(fractionFromX(100, 100, 800), 0);
    assert.equal(fractionFromX(500, 100, 800), 0.5);
    assert.equal(fractionFromX(900, 100, 800), 1);
});

test('fractionFromX clamps clicks outside the track', () => {
    assert.equal(fractionFromX(40, 100, 800), 0);
    assert.equal(fractionFromX(9999, 100, 800), 1);
});

test('fractionFromX returns 0 for a zero-width track', () => {
    assert.equal(fractionFromX(50, 100, 0), 0);
});

test('clamp01 bounds values to [0, 1]', () => {
    assert.equal(clamp01(-0.5), 0);
    assert.equal(clamp01(0), 0);
    assert.equal(clamp01(0.42), 0.42);
    assert.equal(clamp01(1), 1);
    assert.equal(clamp01(1.7), 1);
});

test('formatTime renders zero-padded mm:ss', () => {
    assert.equal(formatTime(0), '00:00');
    assert.equal(formatTime(9), '00:09');
    assert.equal(formatTime(65), '01:05');
    assert.equal(formatTime(600), '10:00');
    assert.equal(formatTime(3661), '61:01');
});

test('formatTime floors fractional seconds', () => {
    assert.equal(formatTime(59.9), '00:59');
});
