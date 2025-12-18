#!/bin/bash
# Script to manually open Expo Go on WayDroid with a URL
# Usage: ./scripts/open-expo-waydroid.sh exp://192.168.110.244:8081

URL=${1:-"exp://192.168.110.244:8081"}

echo "Opening Expo Go on WayDroid..."
echo "URL: $URL"

# Launch Expo Go using am start (works with WayDroid)
adb shell am start -n host.exp.exponent/.experience.HomeActivity

# Wait a moment for Expo Go to open
sleep 2

# Open the URL in Expo Go
adb shell am start -a android.intent.action.VIEW -d "$URL" host.exp.exponent

echo "Done! Check your WayDroid device."

