import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { useLocationStore } from "@/store/location.store";
import { useFriendsStore } from "@/store/friends.store";
import { defaultRegion } from "@/constants/mapStyle";
import { colors, spacing } from "@/constants/theme";
import BottomBar from "@/components/ui/BottomBar";
import FriendAvatar from "@/components/map/FriendAvatar";
import AppLogo from "@/components/branding/AppLogo";

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(defaultRegion);

  const userLocation = useLocationStore((state) => state.currentLocation);
  const startTracking = useLocationStore((state) => state.startTracking);
  const stopTracking = useLocationStore((state) => state.stopTracking);

  const fetchFriendsLocations = useFriendsStore(
    (state) => state.fetchFriendsLocations,
  );
  const friendsLocations = useFriendsStore((state) => state.friendsLocations);

  useEffect(() => {
    initializeLocation();

    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFriendsLocations();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchFriendsLocations]);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      const region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(region);
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [userLocation]);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied");
        setIsLoading(false);
        return;
      }

      await startTracking();

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setMapRegion(initialRegion);
      setIsLoading(false);
    } catch (err) {
      console.error("Location initialization error:", err);
      setError("Failed to get location");
      setIsLoading(false);
    }
  };

  const handleCenterPress = () => {
    if (userLocation && mapRef.current) {
      const region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.current.animateToRegion(region, 500);
    }
  };

  const handleChatPress = () => {
    console.log("Navigate to chat");
  };

  const handleFriendsPress = () => {
    console.log("Navigate to friends");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.doraemonBlue} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          Please enable location permissions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        rotateEnabled={true}
        pitchEnabled={true}
        onRegionChangeComplete={setMapRegion}
      >
        {friendsLocations.map((friend) => (
          <FriendAvatar
            key={String(friend.userId)}
            userId={String(friend.userId)}
            userName={`User ${friend.userId}`}
            latitude={friend.latitude}
            longitude={friend.longitude}
            speed={friend.speed}
            heading={friend.heading}
            status={friend.status}
          />
        ))}
      </MapView>

      <View style={styles.logoContainer}>
        <AppLogo variant="compact" size="large" showText={false} />
      </View>

      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Friends: {friendsLocations.length}</Text>
        <Text style={styles.debugText}>
          Location: {userLocation ? "✓" : "✗"}
        </Text>
      </View>

      <BottomBar
        onCenterPress={handleCenterPress}
        onLeftPress={handleChatPress}
        onRightPress={handleFriendsPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cream,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: 16,
    color: colors.gray[700],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cream,
    padding: spacing[6],
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.error,
    marginBottom: spacing[2],
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
  },
  logoContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 50,
    left: 16,
    zIndex: 10,
  },
  debugInfo: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 50,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  debugText: {
    color: "white",
    fontSize: 12,
    marginBottom: 4,
  },
});
