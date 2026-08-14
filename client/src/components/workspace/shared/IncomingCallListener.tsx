import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../hooks/useSocket';
import { startIncomingCallRingtone, stopIncomingCallRingtone } from '../../../utils/audio';
import type { RootState } from '../../../store';
import { IncomingCallModal, type IncomingCallPayload } from './IncomingCallModal';

export const IncomingCallListener = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [incoming, setIncoming] = useState<IncomingCallPayload | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = (payload: IncomingCallPayload) => {
      if (!payload?.scheduleId || payload.callerId === currentUserId) return;
      if (location.pathname === `/call/${payload.scheduleId}`) return;
      setIncoming(payload);
    };

    socket.on('webrtc_incoming_call', onIncoming);
    return () => {
      socket.off('webrtc_incoming_call', onIncoming);
    };
  }, [socket, currentUserId, location.pathname]);

  useEffect(() => {
    if (!incoming) {
      stopIncomingCallRingtone();
      return;
    }
    const stop = startIncomingCallRingtone();
    return () => stop();
  }, [incoming]);

  if (!incoming) return null;

  return (
    <IncomingCallModal
      call={incoming}
      onDecline={() => {
        stopIncomingCallRingtone();
        setIncoming(null);
      }}
      onAccept={() => {
        const scheduleId = incoming.scheduleId;
        stopIncomingCallRingtone();
        setIncoming(null);
        navigate(`/call/${scheduleId}`);
      }}
    />
  );
};
