import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import InfoTooltip from './infotooltip';
import { isEmpty } from '../helpers/isEmpty';

const Wrapper = styled.div`
  margin-bottom: 10px;
  align-content: center;
  background-color: #efefef;
  border: none;
  border-radius: 18px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 36px;
  outline: none;
  transition: all 0.4s;
  user-select: none;
  &:hover {
    box-shadow: 2px 0px 20px 0px rgba(0, 0, 0, 0.25);
  }
  width: 250px;
`;

const Options = styled.div`
  align-content: center;
  align-self: center;
  background: #efefef;
  border-radius: 14px;
  box-shadow: inset 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
  height: 28px;
  margin: 0 4px;
  width: 100%;
`;

const OptionItem = styled.div`
  border-radius: 14px 4px 4px 14px;
  font-size: 14px;
  line-height: 28px;
  padding: 0 12px;
  transition: all 0.4s;
  z-index: 9;
  font-family: 'Euclid Triangle', 'Open Sans', sans-serif;

  text-align: center;
  width: 100%;
  ${(props) =>
    props.active &&
    css`
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.15);
      height: 28px;
      z-index: 8;
    `}
`;

const InfoButton = styled.div`
  align-content: center;
  align-self: center;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  font-weight: bold;
  height: 28px;
  justify-content: center;
  line-height: 28px;
  margin: 0 4px;
  transition: all 0.4s;
  min-width: 28px;
  user-select: none;
  &:hover {
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
  }
`;

export default ({ infoHTML, onChange, options, value, tooltipStyle }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <Wrapper>
      <Options>
        {options.map((o) => (
          <OptionItem key={o.value} active={o.value === value} onClick={() => onChange(o.value)}>
            {o.label}
          </OptionItem>
        ))}
      </Options>
      {!isEmpty(infoHTML) && (
        <React.Fragment>
          <InfoButton onClick={() => setTooltipVisible(!tooltipVisible)}>i</InfoButton>
          <InfoTooltip htmlContent={infoHTML} style={tooltipStyle} visible={tooltipVisible} />
        </React.Fragment>
      )}
    </Wrapper>
  );
};
