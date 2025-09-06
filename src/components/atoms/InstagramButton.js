import React from 'react';
import { View, Button, Linking, StyleSheet } from 'react-native';

const InstagramButton = () => {
    const instagramUsername = 'drubble.game.uk'; // <-- Replace with your Instagram username
    const instagramUrl = `https://www.instagram.com/${instagramUsername}`;

    const handlePress = async () => {
        // Check if the device can open the URL
        const canOpen = await Linking.canOpenURL(instagramUrl);

        if (canOpen) {
            await Linking.openURL(instagramUrl);
        } else {
            console.log(`Cannot open URL: ${instagramUrl}`);
            // Fallback behavior, maybe show an alert to the user
            alert('Cannot open Instagram. Please check your app settings.');
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title="Follow us on Instagram!"
                onPress={handlePress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
});

export default InstagramButton;
