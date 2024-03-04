import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from 'translation/i18n';

import EstimationCard from './EstimationCard';

const queryClient = new QueryClient();

describe('EstimationCard with FeedbackCard', () => {
  beforeEach(() => {
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <EstimationCard
            cardType="estimated"
            estimationMethod="ESTIMATED_CONSTRUCT_BREAKDOWN"
            outageMessage={undefined}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );
  });

  it('feedback card should only be visible when collapse button has been clicked', () => {
    cy.intercept('/feature-flags', {
      body: { 'feedback-estimation-labels': true },
    });
    cy.get('[data-test-id=feedback-card]').should('not.exist');
    cy.get('[data-test-id=collapse-button]').click();
    cy.get('[data-test-id=feedback-card]').should('exist');
    cy.get('[data-test-id=collapse-button]').click();
    cy.get('[data-test-id=feedback-card]').should('exist');
  });

  it('feedback card should only be visible if feature-flag is enabled', () => {
    cy.intercept('/feature-flags', {
      body: { 'feedback-estimation-labels': false },
    });
    cy.get('[data-test-id=feedback-card]').should('not.exist');
    cy.get('[data-test-id=collapse-button]').click();
    cy.get('[data-test-id=feedback-card]').should('exist');
  });
});

describe('EstimationCard with real estimation method', () => {
  beforeEach(() => {
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <EstimationCard
            cardType="estimated"
            estimationMethod="ESTIMATED_CONSTRUCT_BREAKDOWN"
            outageMessage={undefined}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );
  });

  it('Estimation card contains expected information', () => {
    cy.get('[data-test-id=title]').contains('Data is always estimated');
    cy.get('[data-test-id=badge]').contains('Not realtime');
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('[data-test-id="body-text"]').contains(
      'The data for this zone is not published in realtime and only provides the total production. Both hourly production and production sources are estimated based on historical data for each production source.'
    );
  });

  it('toggles collapse when collapse button is clicked', () => {
    cy.get('[data-test-id="collapse-up"]').should('not.exist');
    cy.get('[data-test-id="collapse-down"]').should('exist');
    cy.get('[data-test-id="body-text"]').should('not.exist');
    cy.get('[data-test-id="methodology-link"]').should('not.exist');
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('[data-test-id="collapse-up"]').should('exist');
    cy.get('[data-test-id="collapse-down"]').should('not.exist');
    cy.get('[data-test-id="body-text"]').should('exist');
    cy.get('[data-test-id="methodology-link"]').should('exist');
  });
});

describe('EstimationCard', () => {
  it('Estimation card with unknown contains expected information', () => {
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <EstimationCard
            cardType="estimated"
            estimationMethod=""
            outageMessage={undefined}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );
    cy.get('[data-test-id=title]').contains('Data is estimated');
    cy.get('[data-test-id=badge]').contains('Imprecise');
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('[data-test-id="body-text"]').contains(
      'The published data for this zone is unavailable or incomplete. The data shown on the map is estimated using our best effort, but might differ from the actual values.'
    );
  });

  it('Estimation card with unknown card should not return an estimation card', () => {
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <EstimationCard cardType="" estimationMethod="" outageMessage={undefined} />
        </QueryClientProvider>
      </I18nextProvider>
    );
    cy.get('[data-test-id=title]').should('not.exist');
  });
});

describe('OutageCard', () => {
  beforeEach(() => {
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <EstimationCard
            cardType="outage"
            estimationMethod="ESTIMATED_CONSTRUCT_BREAKDOWN"
            outageMessage={{ message: 'Outage Message', issue: 'issue' }}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );
  });

  it('Outage message contains expected information', () => {
    cy.get('[data-test-id=title]').contains('Ongoing issues');
    cy.get('[data-test-id=badge]').contains('Unavailable');
  });

  it('For outage start as expanded and toggles collapse when collapse button is clicked', () => {
    cy.get('[data-test-id="collapse-up"]').should('exist');
    cy.get('[data-test-id="collapse-down"]').should('not.exist');
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('[data-test-id="collapse-up"]').should('not.exist');
    cy.get('[data-test-id="collapse-down"]').should('exist');
  });
});

describe('AggregatedCard', () => {
  it('Aggregated message with estimation contains expected information', () => {
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <EstimationCard
            cardType="aggregated"
            estimatedPercentage={50}
            outageMessage={undefined}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );
    cy.get('[data-test-id=title]').contains('Data is aggregated');
    cy.get('[data-test-id=badge]').contains('50% estimated');
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('[data-test-id="body-text"]').contains(
      'The data consists of an aggregation of hourly values. 50% of the production values are estimated.'
    );
  });

  it('Aggregated message contains expected information', () => {
    cy.mount(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <EstimationCard
            cardType="aggregated"
            estimationMethod="ESTIMATED_CONSTRUCT_BREAKDOWN"
            outageMessage={undefined}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );
    cy.get('[data-test-id=title]').contains('Data is aggregated');
    cy.get('[data-test-id=badge]').should('not.exist');
    cy.get('[data-test-id="collapse-button"]').click();
    cy.get('[data-test-id="body-text"]').contains(
      'The data consists of an aggregation of hourly values.'
    );
  });
});
