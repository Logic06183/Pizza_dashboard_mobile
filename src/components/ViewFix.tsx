import React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * A wrapper around React Native's View component that helps prevent
 * "Unexpected text node" errors by ensuring no whitespace is interpreted as text
 */
export const ViewFix: React.FC<ViewProps> = (props) => {
  // Filter out any text nodes from children by ensuring all children are valid React elements
  const children = React.Children.toArray(props.children).filter(
    child => React.isValidElement(child)
  );
  
  return <View {...props}>{children}</View>;
};

export default ViewFix;
