import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Image } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';

const outfitsIcon = require('../../assets/images/outfits.png');
const outfitsIconActive = require('../../assets/images/outfits-filled.png');
const canvasIcon = require('../../assets/images/canvas.png');
const canvasIconActive = require('../../assets/images/canvas-filled.png');
const plannerIcon = require('../../assets/images/calendar.png');
const plannerIconActive = require('../../assets/images/calendar-filled.png');
const accountIcon = require('../../assets/images/account.png');
const accountIconActive = require('../../assets/images/account-filled.png');
const closetIcon = require('../../assets/images/hanger.png');
const closetIconActive = require('../../assets/images/hanger-filled.png');

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      {/* <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="closet"
        options={{
          title: 'Closet',
          tabBarIcon: ({ color, focused }) => <Image
          source={focused ? closetIconActive : closetIcon}
          style={{ width: 24, height: 24, tintColor: color }}
        />,
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Outfits',
          tabBarIcon: ({ color, focused }) => <Image
          source={focused ? outfitsIconActive : outfitsIcon}
          style={{ width: 24, height: 24, tintColor: color }}
        />,
        }}
      />
      <Tabs.Screen
        name="canvas"
        options={{
          title: 'Canvas',
          tabBarIcon: ({ color, focused }) => <Image
          source={focused ? canvasIconActive : canvasIcon}
          style={{ width: 24, height: 24, tintColor: color }}
        />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, focused }) =><Image 
          source={focused ? plannerIconActive : plannerIcon}
          style={{ width: 24, height: 24, tintColor: color}}
        />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => <Image
          source={focused ? accountIconActive : accountIcon}
          style={{ width: 24, height: 24, tintColor: color }}
        />,
        }}
      />
      
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) =><IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
