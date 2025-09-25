import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Screen1 from "../screens/screen1";
import Screen2 from "../screens/screen2";

import { useAppSelector } from "../store/hooks";

export type RootStackParamList = {
    Screen1: undefined;
    Screen2: undefined;
    NotFound: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
    const auth = useAppSelector((state) => state.auth);
    const initialRoute = auth.email && auth.password ? "Screen1" : "NotFound";
    return (
        <Stack.Navigator>
           <Stack.Screen name="Screen1" component={Screen1} options={{ title: "Login" }} />
            <Stack.Screen name="Screen2" component={Screen2} options={{ title: "Movies" }} />
        </Stack.Navigator>
    );
};

export default RootNavigator;
