import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withDecay,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SIZE = width * 0.85;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 20;

const MAX_MINUTES = 25;
const TICKS_PER_MINUTE = 6; 
const TOTAL_TICKS = MAX_MINUTES * TICKS_PER_MINUTE; 
const DEGREE_PER_TICK = 360 / TOTAL_TICKS;

const AnimatedG = Animated.createAnimatedComponent(G);

const getAngle = (x, y) => {
  'worklet';
  const dx = x - CENTER;
  const dy = y - CENTER;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return angle + 90; 
};

const MemoizedTicks = React.memo(() => {
  const ticks = [];
  for (let i = 0; i < TOTAL_TICKS; i++) {
    const angle = i * DEGREE_PER_TICK;
    const isFiveMinute = i % (5 * TICKS_PER_MINUTE) === 0;
    const isMinute = i % TICKS_PER_MINUTE === 0;
    let len = 10; let strokeWidth = 1; let color = "#bbb"; 
    if (isFiveMinute) { len = 30; strokeWidth = 3; color = "#333"; } 
    else if (isMinute) { len = 20; strokeWidth = 2; color = "#888"; }

    const numberValue = Math.round((i / TOTAL_TICKS) * MAX_MINUTES);

    ticks.push(
      <G key={i} rotation={angle}>
        <Line x1={0} y1={-RADIUS} x2={0} y2={-RADIUS + len} stroke={color} strokeWidth={strokeWidth} strokeCap="round" />
        {isFiveMinute && (
           <G transform={`translate(0, ${-RADIUS + len + 30}) rotate(${-angle})`}>
              <SvgText fill="#555" fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">
                {numberValue}
              </SvgText>
           </G>
        )}
      </G>
    );
  }
  return <>{ticks}</>;
});

export default function CircularTimer({ rotation, isActive, duration, onFinalChange }) {
  const savedOffset = useSharedValue(0);
  const startAngle = useSharedValue(0);
  const [sound, setSound] = useState();

  const isActiveRef = useRef(isActive);
  const isTimerRunningSV = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    isTimerRunningSV.value = isActive ? 1 : 0;
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound: playbackObject } = await Audio.Sound.createAsync(
          require('../../assets/tick.wav'),
          { shouldPlay: false }
        );
        setSound(playbackObject);
      } catch (e) {}
    }
    setupAudio();
    return () => { if (sound) sound.unloadAsync(); };
  }, []);

  const playTick = async () => {
    if (sound) { try { sound.replayAsync(); } catch (e) {} }
  };

  useAnimatedReaction(
    () => {
      let normalized = rotation.value % 360;
      if (normalized < 0) normalized += 360;
      return Math.floor(normalized / DEGREE_PER_TICK);
    },
    (current, previous) => {
      if (isTimerRunningSV.value === 1) return;
      if (current !== previous && previous !== null) {
         runOnJS(playTick)();
      }
    }
  );

  useEffect(() => {
    if (isActive) {
      cancelAnimation(rotation);
      let currentRotation = rotation.value % 360;
      if (currentRotation < 0) currentRotation+= 360;
      rotation.value = currentRotation;
      rotation.value = withTiming(0, {
        duration: duration * 1000,
        easing: Easing.linear,
      });
    } else {
      cancelAnimation(rotation);
    }
  }, [isActive, duration]); 

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart((e) => {
      if (isTimerRunningSV.value === 1) return;
      cancelAnimation(rotation);
      const fingerAngle = getAngle(e.x, e.y);
      startAngle.value = fingerAngle;
      savedOffset.value = rotation.value;
    })
    .onUpdate((e) => {
      if (isTimerRunningSV.value === 1) return;
      const fingerAngle = getAngle(e.x, e.y);
      let delta = fingerAngle - startAngle.value;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      rotation.value = savedOffset.value - delta; 
    })
    .onEnd((e) => {
      if (isTimerRunningSV.value === 1) return;

      const dx = e.x - CENTER;
      const dy = e.y - CENTER;
      const angularVelocity = -1 * (dx * e.velocityY - dy * e.velocityX) / (RADIUS * RADIUS);
      const velocityInDegrees = angularVelocity * (180 / Math.PI) * 10; 

      rotation.value = withDecay({
        velocity: velocityInDegrees,
        deceleration: 0.994,
        clamp: undefined,
      }, (finished) => {
        if (finished && !isActiveRef.current) {
           let angle = rotation.value % 360;
           if (angle < 0) angle += 360;
           const mins = (angle / 360) * MAX_MINUTES;
           const totalSeconds = Math.round(mins * 60);
           runOnJS(onFinalChange)(totalSeconds);
        }
      });
    });

  const animatedGroupProps = useAnimatedProps(() => {
    return {
      transform: [
        { translateX: CENTER },
        { translateY: CENTER },
        { rotate: `${-rotation.value}deg` }
      ]
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="#f0f0f0" strokeWidth="1" fill="none" />
          <AnimatedG animatedProps={animatedGroupProps}>
             <MemoizedTicks />
          </AnimatedG>
          <Polygon points={`${CENTER - 8},5 ${CENTER + 8},5 ${CENTER},25`} fill="tomato" />
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', borderRadius: 200, overflow: 'hidden' },
});