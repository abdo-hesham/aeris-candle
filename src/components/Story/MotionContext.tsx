"use client";
import { createContext, useContext } from "react";

export const MotionContext = createContext({ paused: false, reduced: false });
export const useSceneMotion = () => useContext(MotionContext);
