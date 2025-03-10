import { Tabs, usePathname } from "expo-router";
import React from "react";
import { Platform, Image, View, Dimensions } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import Header from "@/components/Header";

const outfitsIcon = require("../../assets/images/outfits.png");
const outfitsIconActive = require("../../assets/images/outfits-filled.png");
const canvasIcon = require("../../assets/images/canvas.png");
const canvasIconActive = require("../../assets/images/canvas-filled.png");
const plannerIcon = require("../../assets/images/calendar.png");
const plannerIconActive = require("../../assets/images/calendar-filled.png");
const accountIcon = require("../../assets/images/account.png");
const accountIconActive = require("../../assets/images/account-filled.png");
const closetIcon = require("../../assets/images/hanger.png");
const closetIconActive = require("../../assets/images/hanger-filled.png");

const { width } = Dimensions.get("window");

export default function TabLayout() {
  const pathname = usePathname();
  const tabName = pathname.split('/').pop() || 'index';
  return (
    <>
    <Header tabName={tabName}/>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: "#545454",
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            bottom: 27,
            left: 16,
            right: 16,
            height: 72,
            borderRadius: 16,
            backgroundColor: "white",
            elevation: 0,
            alignItems: "center",
            justifyContent: "center",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                paddingTop: 10,
                alignItems: "center",
              }}
            >
              <Image
                source={focused ? closetIconActive : closetIcon}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: "Outfits",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                paddingTop: 10,
                alignItems: "center",
              }}
            >
              <Image
                source={focused ? outfitsIconActive : outfitsIcon}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="canvas"
        options={{
          title: "Canvas",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                paddingTop: 10,
                alignItems: "center",
              }}
            >
              <Image
                source={focused ? canvasIconActive : canvasIcon}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                paddingTop: 10,
                alignItems: "center",
              }}
            >
              <Image
                source={focused ? plannerIconActive : plannerIcon}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                paddingTop: 10,
                alignItems: "center",
              }}
            >
              <Image
                source={focused ? accountIconActive : accountIcon}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
    </>
  );
}

