import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface CheckboxItemProps {
  text: string;
  completed: boolean;
  onToggle: () => void;
  onChangeText: (newText: string) => void;
  placeholder?: string;
  onDelete?: () => void;
}

export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  text,
  completed,
  onToggle,
  onChangeText,
  placeholder = 'Write item...',
  onDelete,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onToggle}
        style={[styles.checkbox, completed && styles.checkboxCompleted]}
        hitSlop={8}
      >
        {completed && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
      </Pressable>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.colors.textLight}
        style={[
          styles.input,
          completed && styles.inputCompleted,
        ]}
        multiline={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.linedPaper,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: THEME.colors.checkboxBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: THEME.colors.checkboxChecked,
    borderColor: THEME.colors.checkboxChecked,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textDark,
    fontFamily: THEME.typography.fontFamilySans,
    paddingVertical: 4,
  },
  inputCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textLight,
  },
});
