import { TextInput, TextInputProps, StyleSheet } from "react-native"

export function Input({...rest}:TextInputProps){
    return (
        <TextInput style={styles.texInp} {...rest}/>    
    )
}

const styles = StyleSheet.create({
    texInp:{
        height: 54, 
        borderWidth: 1,
        borderRadius: 7,
        borderColor: "#999",
        paddingHorizontal: 16,
        marginBottom: 20,
    },
});