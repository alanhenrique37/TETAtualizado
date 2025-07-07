
import { Text, View, TextProps, StyleSheet } from "react-native"

export function Texto({...rest}:TextProps){
    return (
        <View style={styles.container}>
            <Text style={styles.text} {...rest}/>   
        </View> 
    );
}

const styles = StyleSheet.create({
    container:{
        width: "100%",
    },
    text:{
        fontSize: 40,
        alignItems: "center",
        textAlign: "center",
        padding: 50,
        color: "#4343aa",
        fontWeight: "800",
    },
});
