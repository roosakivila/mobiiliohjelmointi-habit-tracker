import { Modal, View } from "react-native";
import { useState } from "react";

export default function CheerMessageScreen({ navigation, buddyId }) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setVisible(true);
    }, []);

    const handleClose = () => {
        setVisible(false);
    };

    return (
        <View>
            <Modal
                visible={true}
                animationType="slide"
                transparent={true}
            >
                <View>
                    <Text>Cheer Message Screen</Text>
                </View>
            </Modal>
        </View>
    );
}