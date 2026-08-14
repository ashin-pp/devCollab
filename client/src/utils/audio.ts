export const playNotificationSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        audio.volume = 1.0;
        
        audio.play().catch(e => {
            console.warn("Browser blocked audio play (requires user to click on the screen first)", e);
        });
    } catch (e) {
        console.error("Could not play notification sound:", e);
    }
};

type WindowWithAudio = Window & {
    webkitAudioContext?: typeof AudioContext;
};

let ringtoneCtx: AudioContext | null = null;
let ringtoneTimer: ReturnType<typeof setInterval> | null = null;

const chime = (ctx: AudioContext, dest: AudioNode, freq: number, when: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.28, when + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(when);
    osc.stop(when + duration + 0.02);
};

export const startIncomingCallRingtone = (): (() => void) => {
    stopIncomingCallRingtone();

    try {
        const Ctor = window.AudioContext || (window as WindowWithAudio).webkitAudioContext;
        if (!Ctor) return () => undefined;

        const ctx = new Ctor();
        ringtoneCtx = ctx;
        const master = ctx.createGain();
        master.gain.value = 0.45;
        master.connect(ctx.destination);

        const playCycle = () => {
            const t = ctx.currentTime + 0.02;
            chime(ctx, master, 1046.5, t, 0.42);
            chime(ctx, master, 1318.5, t, 0.42);
            chime(ctx, master, 1568.0, t + 0.04, 0.36);
            chime(ctx, master, 1046.5, t + 0.5, 0.42);
            chime(ctx, master, 1318.5, t + 0.5, 0.42);
            chime(ctx, master, 784.0, t + 0.54, 0.38);
        };

        void ctx.resume().then(playCycle).catch(() => undefined);
        ringtoneTimer = setInterval(playCycle, 2000);
    } catch (e) {
        console.error('Could not start ringtone', e);
    }

    return stopIncomingCallRingtone;
};

export const stopIncomingCallRingtone = () => {
    if (ringtoneTimer) {
        clearInterval(ringtoneTimer);
        ringtoneTimer = null;
    }
    if (ringtoneCtx) {
        const ctx = ringtoneCtx;
        ringtoneCtx = null;
        void ctx.close().catch(() => undefined);
    }
};
