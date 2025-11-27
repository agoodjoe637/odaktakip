import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function ReanimatedText({ rotation, maxMinutes }) {
  const animatedProps = useAnimatedProps(() => {
    let angle = rotation.value % 360;
    
    if (angle < 0) angle += 360;
    
    const mins = (angle / 360) * maxMinutes;
    const totalSeconds = Math.round(mins * 60);

    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    
    return {
      text: `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`, 
    };
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value="00:00"
      style={styles.text}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
    textAlign: 'center',
    width: 140,
  },
});