// cypress/e2e/home_page.cy.js

describe('Telerik Home Page - Robust Menu Validation', () => {

  // Recommended: move this to cypress/support/e2e.js so it's global:
  // Cypress.on('uncaught:exception', () => false);
  before(() => {

    cy.viewport(1366, 768);
    cy.visit('https://www.telerik.com/', { timeout: 60000 });

    // Ensure page body exists and wait a bit for dynamic content to load
    cy.get('body', { timeout: 60000 }).should('exist');

    // Dismiss cookie/banner if present (try several common selectors)
    cy.get('body').then(($body) => {
      const cookieSelectors = [
        '#onetrust-accept-btn-handler',
        '.onetrust-accept-btn-handler',
        '.onetrust-close-btn-handler',
        'button[aria-label*="accept"]',
        'button[data-consent="accept"]'
      ];

      for (const sel of cookieSelectors) {
        if ($body.find(sel).length) {
          // click with force in case overlaying element blocks it
          cy.get(sel, { timeout: 5000 }).click({ force: true });
          break;
        }
      }
    });
  });

  it('validates top navigation menu items (robust selectors + fallback)', () => {
    // Try multiple possible selectors for top navigation root
    const topNavSelectors = [
      'ul.TK-Context-Menu.TK-Menu',   // from screenshots
      'ul.TK-Menu',
      'nav ul',                       // generic fallback
      '#js-tlrk-nav-drawer ul',       // drawer based structure
      '.TK-Drawer ul'
    ].join(', ');

    // Wait for any of the above to appear and be visible
    cy.get(topNavSelectors, { timeout: 20000 }).first().should('be.visible').then(($root) => {
      const rootEl = $root[0] || $root;

      // Find menu items (preferred class first, fallback to anchors/li)
      const items = rootEl.querySelectorAll('li.TK-Menu-Item, li, a');

      // Assert that we found at least one menu item
      expect(items.length, 'top navigation item count').to.be.greaterThan(0);

      // Wrap the NodeList and iterate safely
      cy.wrap(items).each(($el, index) => {
        // ensure each item is visible and has non-empty text
        cy.wrap($el).should('be.visible').then((el) => {
          const text = el.textContent?.trim() || '';
          expect(text, `Top menu item ${index + 1} text`).to.not.equal('');
          cy.log(`Top Menu Item ${index + 1}: "${text}"`);
        });
      });
    });
  });

  it('validates aside / top-bar items (icons or text) using multiple fallbacks', () => {
    // Try multiple possible selectors for the aside/top-bar region
    const asideSelectors = [
      '.TK-Bar-container',           // screenshot selector
      'ul.TK-Aside-Menu',
      '.TK-Aside',
      '.TK-Drawer .TK-Aside-Menu',
      '#js-tlrk-nav-drawer .TK-Aside-Menu',
      '.TK-Bar'                      // fallback
    ].join(', ');

    // Wait up to 20s for any of the possible aside selectors to appear
    cy.get(asideSelectors, { timeout: 20000 }).first().should('be.visible').then(($root) => {
      const rootEl = $root[0] || $root;

      // Look for likely interactive items: anchor, buttons, or li items
      const items = rootEl.querySelectorAll('li.TK-Aside-Menu-Item, a, button, li');

      expect(items.length, 'aside/top-bar item count').to.be.greaterThan(0);

      cy.wrap(items).each(($el, index) => {
        cy.wrap($el).should('be.visible').then((el) => {
          const text = el.textContent?.trim() || '';
          const hasIcon = Cypress.$(el).find('svg, img').length > 0;

          // either text present or an icon should be present
          expect(hasIcon || text.length > 0, `Aside item ${index + 1} has icon/text`).to.be.true;

          cy.log(`Aside Item ${index + 1}: "${text || '[icon-only]'}"`);
        });
      });
    });
  });

});
