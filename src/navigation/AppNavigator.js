import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HabitListScreen from "../screens/HabitListScreen";
import BuddyProgressScreen from "../screens/BuddyProgressScreen";
import AddHabitScreen from "../screens/AddHabitScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // Hide header for auth screens
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HabitList') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'BuddyProgress') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'AddHabit') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#0066cc',
                tabBarInactiveTintColor: 'gray',
                headerShown: true,
            })}
        >
            <Tab.Screen
                name="HabitList"
                component={HabitListScreen}
                options={{ title: 'My Habits' }}
            />
            <Tab.Screen
                name="BuddyProgress"
                component={BuddyProgressScreen}
                options={{ title: 'Buddy Progress' }}
            />
            <Tab.Screen
                name="AddHabit"
                component={AddHabitScreen}
                options={{ title: 'Add Habit' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0066cc" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}
