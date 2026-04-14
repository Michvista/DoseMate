import React from "react";
import {
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

type IconProps = {
  color: string;
  size?: number;
};

export const MedicationIcons = {
  pill: ({ color, size = 24 }: IconProps) => (
    // <MaterialCommunityIcons name="pill" size={size} color={color} />
    <MaterialIcons name="medication" size={size} color={color} />
  ),

  capsule: ({ color, size = 24 }: IconProps) => (
    <FontAwesome6 name="capsules" size={size} color={color} />
  ),

  syrup: ({ color, size = 24 }: IconProps) => (
    <MaterialIcons name="medication-liquid" size={size} color={color} />
  ),

  injection: ({ color, size = 24 }: IconProps) => (
    <Fontisto name="injection-syringe" size={size} color={color} />
  ),

  patch: ({ color, size = 24 }: IconProps) => (
    <FontAwesome6 name="vest-patches" size={size} color={color} />
  ),
};
