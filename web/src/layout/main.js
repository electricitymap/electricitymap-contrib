/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
// TODO(olc): re-enable this rule

import React from 'react';

// Layout
import Header from './header';
import LayerButtons from './layerbuttons';
import LeftPanel from './leftpanel';
import Legend from './legend';
import ProdConsToggle from './prodconstoggle';
import Tabs from './tabs';
import Tooltips from './tooltips';

// Modules
import { __ } from '../helpers/translation';

export default () => (
  <React.Fragment>
    <div
      style={{
        position: 'fixed', /* This is done in order to ensure that dragging will not affect the body */
        width: '100vw',
        height: 'inherit',
        display: 'flex',
        flexDirection: 'column', /* children will be stacked vertically */
        alignItems: 'stretch', /* force children to take 100% width */
      }}
    >
      <Header />
      <div id="inner">
        <div id="loading" className="loading overlay" />

        <div id="embedded-error" className="overlay" style={{ backgroundColor: 'grey', display: 'none' }}>
          Embedding of the ElectricityMap has been deactivated. You can still access it at <a href="http://www.electricitymap.org" target="_blank">https://www.electricitymap.org</a>.<br />
          Please contact us at <a href="mailto:hello@tmrow.com">hello@tmrow.com</a> for more information.
        </div>

        <LeftPanel />

        <div id="map-container">
          <div id="zones" className="map-layer" />
          <canvas id="wind" className="map-layer" />
          <canvas id="solar" className="map-layer" />
          <div id="watermark" className="watermark small-screen-hidden brightmode">
            <a href="http://www.tmrow.com/mission?utm_source=electricitymap.org&utm_medium=referral&utm_campaign=watermark" target="_blank">
              <div id="built-by-tomorrow" />
            </a>
          </div>
          <Legend />
          <ProdConsToggle />
          <LayerButtons />
        </div>

        <div id="connection-warning" className="flash-message">
          <div className="inner">
            {__('misc.oops')}
            {' '}
            <a
              href=""
              onClick={(e) => {
                window.retryFetch();
                e.preventDefault();
              }}
            >
              {__('misc.retrynow')}
            </a>
            .
          </div>
        </div>
        <div id="new-version" className="flash-message">
          <div className="inner">{__('misc.newversion')}</div>
        </div>

        <div id="left-panel-collapse-button" className="small-screen-hidden" role="button" tabIndex="0">
          <i className="material-icons">arrow_drop_down</i>
        </div>

        { /* end #inner */}
      </div>
      <Tabs />
    </div>
    <Tooltips />
  </React.Fragment>
);
