export const playNotificationSound = () => {
    try {
        // A clean, modern software interface sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        
        // Set volume to max so it can be clearly heard
        audio.volume = 1.0;
        
        audio.play().catch(e => {
            console.warn("Browser blocked audio play (requires user to click on the screen first)", e);
        });
    } catch (e) {
        console.error("Could not play notification sound:", e);
    }
};
