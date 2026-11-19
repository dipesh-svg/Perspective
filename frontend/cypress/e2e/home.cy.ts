/// <reference types="cypress" />

describe("Perspective landing page", () => {
  beforeEach(() => {
    cy.viewport(1280, 900);
    cy.visit("/en");
  });

  it("renders the English landing page", () => {
    cy.get("h1")
      .should("be.visible")
      .and("contain.text", "See the other side of every story");

    cy.get('form input[placeholder="Input Article Link Here..."]:visible').should("have.length", 1);
  });

  it("submits an article URL to mocked APIs and opens the report", () => {
    const articleUrl = "https://example.com/news/story";

    cy.intercept("POST", "**/api/process", {
      statusCode: 200,
      body: {
        facts: [],
        sentiment: "neutral",
        perspective: {
          perspective: "A balanced test perspective.",
          reasoning: "This response is returned by the Cypress test stub.",
        },
        score: 80,
        cleaned_text: "A short test article.",
      },
    }).as("processArticle");

    cy.intercept("POST", "**/api/bias", {
      statusCode: 200,
      body: { bias_score: 28 },
    }).as("analyzeBias");

    cy.get('form input[placeholder="Input Article Link Here..."]:visible')
      .type(`${articleUrl}{enter}`);

    cy.wait("@processArticle")
      .its("request.body")
      .should("deep.equal", { url: articleUrl });

    cy.wait("@analyzeBias")
      .its("request.body")
      .should("deep.equal", { url: articleUrl });

    cy.location("pathname", { timeout: 15000 }).should("eq", "/en/analyze/results");
    cy.get(`a[href="${articleUrl}"]`).should("be.visible");
  });

  it("rejects unsupported URL schemes without calling the analysis APIs", () => {
    cy.intercept("POST", "**/api/process").as("processArticle");
    cy.intercept("POST", "**/api/bias").as("analyzeBias");

    cy.get('form input[placeholder="Input Article Link Here..."]:visible')
      .type("ftp://example.com/article{enter}");

    cy.contains("Please enter a valid web URL (e.g. https://example.com/article)")
      .should("be.visible");

    cy.get("@processArticle.all").should("have.length", 0);
    cy.get("@analyzeBias.all").should("have.length", 0);
  });
});
