// cypress/e2e/login.cy.js

describe('Login Flow', () => {
  const email = 'test@email.com';

  beforeEach(() => {
    cy.visit('https://www.telerik.com/');
  });

  it('should navigate to the login page and complete login steps', () => {
    // Navigate to Login
    cy.get("a[title='Your Account']").click();

    // Step 1: identity.telerik.com (different origin)
    cy.origin('https://identity.telerik.com', { args: { email } }, ({ email }) => {
      cy.url().should('include', '/login');

      // Header
      cy.get('#progress-telerik').should('be.visible');

      // Login container and step 1 assertions
      cy.get('.flow-container.container-floating').should('be.visible').within(() => {
        cy.get('.progress-steps-label')
          .should('be.visible')
          .and('contain.text', 'Step 1 of 2');

        // Progress bar inline checks
        cy.get('progress-bar').should('be.visible').within(() => {
          cy.get('.progress-bar-element').should('be.visible');
          cy.get('.progress-bar-fill').should('be.visible');
        });

        // Form content
        cy.get("form[name='form']").should('be.visible').within(() => {
          cy.get('h4.u-mb30.u-tac')
            .should('be.visible')
            .and('contain.text', 'Enter Your Email to Sign In')
            .and('contain.text', 'Create an Account');
        });

        cy.get("label[for='email']").should('contain.text', 'Work or Telerik Account Email');
        cy.get('#email').should('be.visible').clear().type(email);

        cy.get('.u-mb15').should('be.visible')
          .and('contain.text', 'All fields are required')
          .and('contain.text', 'Form is protected with Cloudflare');

        cy.contains('button', 'Next').click();
      });
    });

    // Step 2: sign-up page confirmation (same origin root but different path)
    cy.origin('https://identity.telerik.com/sign-up', { args: { email } }, ({ email }) => {
      cy.get('.progress-steps-label', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Step 2 of 2');

      // Progress bar inline checks
      cy.get('progress-bar').should('be.visible').within(() => {
        cy.get('.progress-bar-element').should('be.visible');
        cy.get('.progress-bar-fill').should('be.visible');
      });

      // Confirmation header & text
      cy.get('.u-mb20.u-mt20')
        .should('be.visible')
        .and('contain.text', "We've Sent You an Account Activation Email");

      cy.get('.u-mb15').should('be.visible')
        .and('contain.text', 'Please open your email')
        .and('contain.text', email)
        .and('contain.text', 'and click on the verification link to activate your account.');

      // TODO: handle Cloudflare / captcha if necessary
    });
  });
});