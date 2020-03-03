context('Sample e2e test', () => {
    beforeEach(() => {
      cy.visit('localhost:8080')
    })

    it('checks for loader visibility', function() {
        cy.get('#loader').should('have.css', 'opacity', '1');
        cy.wait(300);
        cy.get('#loader').should('have.css', 'opacity', '0');
        cy.get('#loader').should('have.css', 'opacity', '0');
    })

    it('checks for search to work', function() {
        cy.get('#search')
            .type('fake@email.com').should('have.value', 'fake@email.com')

        cy.wait(300);
        cy.get('.post').should('be.visible');
    });
  })