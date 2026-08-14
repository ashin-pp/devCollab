import { ICE_SERVERS } from './iceServers';

type PeerHandlers = {
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onTrack: (stream: MediaStream) => void;
  onConnectionState?: (state: RTCPeerConnectionState) => void;
};

export function createPeerConnection(
  localStream: MediaStream,
  handlers: PeerHandlers
): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  for (const track of localStream.getTracks()) {
    pc.addTrack(track, localStream);
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      handlers.onIceCandidate(event.candidate);
    }
  };

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      handlers.onTrack(stream);
    }
  };

  pc.onconnectionstatechange = () => {
    handlers.onConnectionState?.(pc.connectionState);
  };

  return pc;
}

export async function createOfferSdp(pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return pc.localDescription ?? offer;
}

export async function acceptOfferAndCreateAnswer(
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return pc.localDescription ?? answer;
}

export async function acceptAnswer(
  pc: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

export async function addIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  if (!candidate.candidate) return;
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
}
