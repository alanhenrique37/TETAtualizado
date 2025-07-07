import { View, Pressable, PressableProps, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"

type Props = PressableProps &{
    data:{
        id: string
        email: string
        senha: string
    }
    onDelete: () => void
    onEditar: () => void
}

export function Cliente({ data, onDelete, onEditar, ...rest}:Props){
    return (
        <View style={styles.container}>
            <Pressable style={styles.fundo} {...rest}>
                <Text style={styles.texto}>
                    {data.id} - {data.email} - {data.senha} 
                </Text>

                <TouchableOpacity onPress={onEditar}>
                    <MaterialIcons name="edit" size={24} color="#3232aa"/>
                </TouchableOpacity>

                <TouchableOpacity onPress={onDelete}>
                    <MaterialIcons name="delete" size={24} color="red"/>
                </TouchableOpacity>
            </Pressable>
    </View>
    );
}//fim do produto

const styles = StyleSheet.create({
    container:{
        justifyContent: "center",  
        marginLeft: 20,  
        marginRight: 20, 
    },    
    fundo: {
        backgroundColor: "#CECECE",
        borderRadius: 10, 
        gap: 10,
        flexDirection: "row",
        padding: 10,        
    },
    texto:{
        flex: 1,
    },
});