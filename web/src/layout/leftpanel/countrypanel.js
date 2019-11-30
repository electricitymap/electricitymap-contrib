/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
// TODO: re-enable rules

import React from 'react';
import { connect } from 'react-redux';

// Components
import CircularGauge from '../../components/circulargauge';
import Tooltip from '../../components/tooltip';

// Modules
import { getCurrentZoneData } from '../../helpers/redux';
import { __ } from '../../helpers/translation';

const { co2Sub } = require('../../helpers/formatting');
const tooltipHelper = require('../../helpers/tooltip');

const CountryLowCarbonGauge = connect((state) => {
  const d = getCurrentZoneData(state);
  if (!d) {
    return { percentage: null };
  }
  const fossilFuelRatio = state.application.electricityMixMode === 'consumption'
    ? d.fossilFuelRatio
    : d.fossilFuelRatioProduction;
  const countryLowCarbonPercentage = fossilFuelRatio != null
    ? 100 - (fossilFuelRatio * 100)
    : null;
  return {
    percentage: countryLowCarbonPercentage,
  };
})(CircularGauge);
const CountryRenewableGauge = connect((state) => {
  const d = getCurrentZoneData(state);
  if (!d) {
    return { percentage: null };
  }
  const renewableRatio = state.application.electricityMixMode === 'consumption'
    ? d.renewableRatio
    : d.renewableRatioProduction;
  const countryRenewablePercentage = renewableRatio != null
    ? renewableRatio * 100 : null;
  return {
    percentage: countryRenewablePercentage,
  };
})(CircularGauge);

// TODO: Move to a proper React component
const lowcarbInfoTooltip = new Tooltip('#lowcarb-info-tooltip');

export default () => (
  <div className="country-panel">
    <div id="country-table-header">
      <div className="left-panel-zone-details-toolbar">
        <span className="left-panel-back-button">
          <i className="material-icons" aria-hidden="true">arrow_back</i>
        </span>
        <div className="country-name-time">
          <div className="country-name-time-table">
            <div style={{ display: 'table-cell' }}>
              <img id="country-flag" className="flag" alt="" />
            </div>

            <div style={{ display: 'table-cell' }}>
              <div className="country-name" />
              <div className="country-time">?</div>
            </div>
          </div>
        </div>
      </div>
      <div className="country-table-header-inner">
        <div className="country-col country-emission-intensity-wrap">
          <div id="country-emission-rect" className="country-col-box emission-rect emission-rect-overview">
            <div>
              <span className="country-emission-intensity" />
              g
            </div>
          </div>
          <div className="country-col-headline">{co2Sub(__('country-panel.carbonintensity'))}</div>
          <div className="country-col-subtext">(gCO<span className="sub">2</span>eq/kWh)</div>
        </div>
        <div className="country-col country-lowcarbon-wrap">
          <div id="country-lowcarbon-gauge" className="country-gauge-wrap">
            <CountryLowCarbonGauge
              onMouseOver={() => tooltipHelper.showLowCarbonDescription(lowcarbInfoTooltip)}
              onMouseMove={(clientX, clientY) => lowcarbInfoTooltip.update(clientX, clientY)}
              onMouseOut={() => lowcarbInfoTooltip.hide()}
            />
          </div>
          <div className="country-col-headline">{co2Sub(__('country-panel.lowcarbon'))}</div>
          <div className="country-col-subtext" />
        </div>
        <div className="country-col country-renewable-wrap">
          <div id="country-renewable-gauge" className="country-gauge-wrap">
            <CountryRenewableGauge />
          </div>
          <div className="country-col-headline">{__('country-panel.renewable')}</div>
        </div>
      </div>
      <div className="country-show-emissions-wrap">
        <div className="menu">
          <a id="production" href={() => window.toggleSource(false)} />
          |
          <a id="emissions" href={() => window.toggleSource(true)}>
            {co2Sub(__('country-panel.emissions'))}
          </a>
        </div>
      </div>
    </div>
    <div className="country-panel-wrap">
      <div className="referral-link" />
      <div className="bysource">
        {__('country-panel.bysource')}
      </div>
      <div className="country-table-container" />
      <div className="zone-details-no-parser-message">
        {__('country-panel.noParserInfo', 'https://github.com/tmrowco/electricitymap-contrib#adding-a-new-country')}
      </div>

      <hr />
      <div className="country-history">
        <div className="loading overlay" />
        <span className="country-history-title">
          {co2Sub(__('country-history.carbonintensity24h'))}
        </span>
        <br />
        <small className="small-screen-hidden">
          <i className="material-icons" aria-hidden="true">file_download</i> <a href="https://data.electricitymap.org/?utm_source=electricitymap.org&utm_medium=referral&utm_campaign=country_panel" target="_blank">{__('country-history.Getdata')}</a>
          <span className="pro"><i className="material-icons" aria-hidden="true">lock</i> pro</span>
        </small>
        <svg id="country-history-carbon" />

        <div className="loading overlay" />
        <span className="country-history-title" id="country-history-electricity-carbonintensity" />
        <br />
        <small className="small-screen-hidden">
          <i className="material-icons" aria-hidden="true">file_download</i> <a href="https://data.electricitymap.org/?utm_source=electricitymap.org&utm_medium=referral&utm_campaign=country_panel" target="_blank">{__('country-history.Getdata')}</a>
          <span className="pro"><i className="material-icons" aria-hidden="true">lock</i> pro</span>
        </small>
        <svg id="country-history-mix" />

        <div className="loading overlay" />
        <span className="country-history-title">
          {__('country-history.electricityprices24h')}
        </span>
        <svg id="country-history-prices" />
      </div>
      <hr />
      <div>
        {__('country-panel.source')}
        {': '}
        <a href="https://github.com/tmrowco/electricitymap-contrib#real-time-electricity-data-sources" target="_blank">
          <span className="country-data-source" />
        </a>
        <small>
          {' ('}
          <span
            dangerouslySetInnerHTML={{
              __html: __(
                'country-panel.addeditsource',
                'https://github.com/tmrowco/electricitymap-contrib/tree/master/parsers'
              ),
            }}
          />
          {')'}
        </small>
        {' '}
        {__('country-panel.helpfrom')}
        <div className="contributors" />
      </div>
      <div className="social-buttons large-screen-hidden">
        <div>
          { /* Facebook share */}
          <div
            className="fb-share-button"
            data-href="https://www.electricitymap.org/"
            data-layout="button_count"
          />
          { /* Twitter share */}
          <a
            className="twitter-share-button"
            data-url="https://www.electricitymap.org"
            data-via="electricitymap"
            data-lang={locale}
          />
          { /* Slack */}
          <span className="slack-button">
            <a href="https://slack.tmrow.co" target="_blank" className="slack-btn">
              <span className="slack-ico" />
              <span className="slack-text">Slack</span>
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
);
