import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeedbackCard from 'components/app-survey/FeedbackCard';
import { I18nextProvider } from 'react-i18next';
import i18n from 'translation/i18n';

function postSurveyResponse() {}

describe('FeedbackCard', () => {
  beforeEach(() => {
    const queryClient = new QueryClient();
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <FeedbackCard
            postSurveyResponse={postSurveyResponse}
            primaryQuestion={i18n.t('feedback-card.estimations.primary-question')}
            secondaryQuestionHigh={i18n.t('feedback-card.estimations.secondary-question')}
            secondaryQuestionLow={i18n.t('feedback-card.estimations.secondary-question')}
            subtitle={i18n.t('feedback-card.estimations.subtitle')}
            surveyReference="Map Survey"
          />
        </I18nextProvider>
      </QueryClientProvider>
    );
  });

  it('renders correctly', () => {
    cy.get('[data-test-id=feedback-card]').should('be.visible');
    cy.get('[data-test-id=title]').should('contain.text', 'Help us improve!');
    cy.get('[data-test-id=subtitle]').should(
      'contain.text',
      'Please rate the following statement.'
    );
    cy.get('[data-test-id=feedback-question]').should(
      'contain.text',
      'The description of the data estimation was easy to understand:'
    );
    cy.get('[data-test-id=feedback-pill-1]').should('contain.text', '1');
    cy.get('[data-test-id=feedback-pill-5]').should('contain.text', '5');
    cy.get('[data-test-id=agree-text]').should('contain.text', 'Strongly agree');
    cy.get('[data-test-id=disagree-text]').should('contain.text', 'Strongly disagree');
  });

  it('closes when the close button is clicked', () => {
    cy.get('[data-test-id=close-button]').click();
    cy.get('[data-test-id=feedback-card]').should('not.exist');
  });

  it('changes state when pill is clicked', () => {
    cy.get('[data-test-id=feedback-pill-4]').click();
    cy.get('[data-test-id=input-title]').should(
      'contain.text',
      'Anything we can do to improve it?'
    );
  });

  it('changes state when the submit button is clicked', () => {
    cy.get('[data-test-id=feedback-pill-1]').click();
    cy.get('[data-test-id=feedback-input]').type('Test comment');
    cy.get('[data-test-id=pill]').click();
    cy.get('[data-test-id=title]').should('contain.text', 'Thank you for your feedback!');
  });
});
