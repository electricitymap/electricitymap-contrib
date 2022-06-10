import React from 'react';
import styled from 'styled-components';
import Icon from './icon';

const StyledButton = styled.button`
  background: ${(props) => props.bgColor || '#fff'};
  color: ${(props) => props.textColor || '#000'};
  font-family: 'Open Sans', sans-serif;
  font-size: 0.85rem;
  border-radius: 100px;
  width: ${(props) => (props.hasChildren ? 232 : 45)}px;
  height: 45px;
  box-shadow: 0px 0px 13px rgba(0, 0, 0, 0.12);
  border: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin: 12px 6px;
  transition: all 0.2s ease-in-out;
  &:hover {
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0px 0px 23px rgba(0, 0, 0, 0.2);
  }
  > svg {
    fill: ${(props) => props.textColor || '#000'};
    // Add spacing if there is text
    & + span {
      margin-left: 6px;
    }
  }
`;

export const Button = ({ icon, children, iconSize = 16, ...rest }) => {
  const hasChildren = React.Children.count(children) > 0;
  return (
    <StyledButton hasChildren={hasChildren} as={rest.href ? 'a' : 'button'} {...rest}>
      {icon && <Icon iconName={icon} size={iconSize} />}
      {hasChildren && <span>{children}</span>}
    </StyledButton>
  );
};
