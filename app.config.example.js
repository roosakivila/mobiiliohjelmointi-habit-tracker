export default {
    expo: {
        name: "habit-tarcker",
        slug: "habit-tarcker",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            "expo-barcode-scanner"
        ],
        extra: {
            API_URL: "YOUR_GIPHY_API_URL_HERE",
            API_KEY: "YOUR_GIPHY_API_KEY_HERE",
        }
    }
};