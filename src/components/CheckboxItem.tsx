import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TextInput } from './AppText';
import { Check } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../services/hapticsService';

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
  const { theme } = useTheme();

  const handleToggle = () => {
    hapticFeedback.success();
    onToggle();
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.linedPaper }]}>
      <Pressable
        onPress={handleToggle}
        style={[
          styles.checkbox,
          {
            borderColor: completed ? theme.colors.checkboxChecked : theme.colors.checkboxBorder,
            backgroundColor: completed ? theme.colors.checkboxChecked : theme.colors.cardBackground,
          },
        ]}
        hitSlop={8}
      >
        {completed && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
      </Pressable>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textLight}
        style={[
          styles.input,
          {
            color: completed ? theme.colors.textLight : theme.colors.textDark,
            fontFamily: theme.typography.fontFamilySans,
          },
          completed && styles.inputCompleted,
        ]}
        multiline={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 2,
    textAlignVertical: 'top',
  },
  inputCompleted: {
    textDecorationLine: 'line-through',
  },
});
