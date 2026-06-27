'use strict';

// These tests assert on the rendered site, so they require a build first:
//   bundle exec jekyll build
// CI runs them in the `jekyll-build` job right after building.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SITE_DIR = path.join(__dirname, '..', '..', '_site');

function walkHtml(dir, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkHtml(full, out);
        } else if (entry.name.endsWith('.html')) {
            out.push(full);
        }
    }
    return out;
}

// Find the first built page that contains a "See also" block (a post page).
function findSeeAlsoPage() {
    if (!fs.existsSync(SITE_DIR)) {
        return null;
    }
    for (const file of walkHtml(SITE_DIR, [])) {
        const html = fs.readFileSync(file, 'utf8');
        if (html.includes('class="see-also"')) {
            return { file, html };
        }
    }
    return null;
}

const page = findSeeAlsoPage();
const skip = page ? false : 'site not built (run `bundle exec jekyll build`)';

test('a built post page renders a "See also" block', () => {
    assert.ok(page, 'No built page containing .see-also was found under _site/.');
});

test('"See also" sits after the article, not nested inside the post section', { skip }, () => {
    const html = page.html;
    const sectionOpen = html.indexOf('<section class="post');
    const sectionClose = html.indexOf('</section>', sectionOpen);
    const aside = html.indexOf('class="see-also"');

    assert.notEqual(sectionOpen, -1, 'post <section> not found');
    assert.notEqual(sectionClose, -1, 'closing </section> not found');
    // The regression we guard against is "See also" being a column inside the
    // post section. It must appear AFTER the section closes — a sibling at the
    // end of the article.
    assert.ok(
        aside > sectionClose,
        'see-also should be a sibling after </section>, not nested in the post section'
    );
});

test('"See also" renders up to three related-post cards, each linked and titled', { skip }, () => {
    const html = page.html;
    const start = html.indexOf('<aside class="see-also"');
    const end = html.indexOf('</aside>', start);
    const block = html.slice(start, end);

    const cards = (block.match(/<li>/g) || []).length;
    const links = (block.match(/<a\s+href=/g) || []).length;
    const titles = (block.match(/<h3>/g) || []).length;

    assert.ok(cards >= 1 && cards <= 3, `expected 1-3 cards, got ${cards}`);
    assert.equal(links, cards, 'each card should have a link');
    assert.equal(titles, cards, 'each card should have a title');
});
