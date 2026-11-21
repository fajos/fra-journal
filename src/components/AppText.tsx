import React, { createContext, useContext, forwardRef } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TextAncestorContext = createContext<boolean>(false);

export interface AppTextProps extends RNTextProps {}
export interface AppTextInputProps extends RNTextInputProps {}

function scaleTextStyle(
  style: any,
  fontScale: number,
  isInsideText: boolean
): TextStyle | undefined {
  if (fontScale === 1.0) {
    return style;
  }

  const flattened = (style ? StyleSheet.flatten(style) : null) as TextStyle | null;

  if (!flattened) {
    if (!isInsideText) {
      return { fontSize: Math.round(14 * fontScale) };
    }
    return undefined;
  }

  const scaled: any = { ...flattened };

  if (typeof flattened.fontSize === 'number') {
    scaled.fontSize = Math.round(flattened.fontSize * fontScale);
  } else if (!isInsideText) {
    // Top-level text without an explicit fontSize scales from React Native default 14
    scaled.fontSize = Math.round(14 * fontScale);
  }

  if (typeof flattened.lineHeight === 'number') {
    scaled.lineHeight = Math.round(flattened.lineHeight * fontScale);
  }

  return scaled as TextStyle;
}

export const Text = forwardRef<any, AppTextProps>((props, ref) => {
  const { fontScale } = useTheme();
  const isInsideText = useContext(TextAncestorContext);

  const scaledStyle = scaleTextStyle(props.style, fontScale, isInsideText);

  return (
    <TextAncestorContext.Provider value={true}>
      <RNText ref={ref} {...props} style={scaledStyle} />
    </TextAncestorContext.Provider>
  );
});

Text.displayName = 'AppText';

export const TextInput = forwardRef<any, AppTextInputProps>((props, ref) => {
  const { fontScale } = useTheme();
  const scaledStyle = scaleTextStyle(props.style, fontScale, false);

  return <RNTextInput ref={ref} {...props} style={scaledStyle} />;
});

TextInput.displayName = 'AppTextInput';

export default Text;
