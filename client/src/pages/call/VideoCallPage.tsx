import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { AiService } from '../../api/ai/ai.service';
import { useSocket } from '../../hooks/useSocket';
import type { RootState } from '../../store';
import type { VideoCallMember, VideoJoinCredentials } from '../../types/ai.types';
import {
  acceptAnswer,
  acceptOfferAndCreateAnswer,
  addIceCandidate,
  createOfferSdp,
  createPeerConnection,
} from '../../webrtc/createPeerConnection';

type RemoteTile = {
  socketId: string;
  userId: string;
  stream: MediaStream | null;
  hasVideo: boolean;
};

type PeerRecord = {
  pc: RTCPeerConnection;
  userId: string;
  pendingIce: RTCIceCandidateInit[];
};

export const VideoCallPage = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const socket = useSocket();

  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoElRef = useRef<HTMLVideoElement | null>(null);
  const peersRef = useRef<Map<string, PeerRecord>>(new Map());
  const remoteVideoEls = useRef<Map<string, HTMLVideoElement>>(new Map());

  const [title, setTitle] = useState('Video call');
  const [organizerName, setOrganizerName] = useState('');
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remotes, setRemotes] = useState<RemoteTile[]>([]);
  const [members, setMembers] = useState<VideoCallMember[]>([]);
  const [showMembers, setShowMembers] = useState(true);

  const closePeer = useCallback((socketId: string) => {
    const record = peersRef.current.get(socketId);
    if (record) {
      record.pc.close();
      peersRef.current.delete(socketId);
    }
    setRemotes((prev) => prev.filter((r) => r.socketId !== socketId));
  }, []);

  const leaveCall = useCallback(async () => {
    if (scheduleId && socket?.connected) {
      socket.emit('webrtc_leave', { scheduleId });
    }
    for (const socketId of [...peersRef.current.keys()]) {
      closePeer(socketId);
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  }, [closePeer, scheduleId, socket]);

  const goBack = useCallback(async () => {
    await leaveCall();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [leaveCall, navigate]);

  const ensurePeer = useCallback(
    (peerSocketId: string, peerUserId: string) => {
      const existing = peersRef.current.get(peerSocketId);
      if (existing) return existing;

      const localStream = localStreamRef.current;
      if (!localStream || !socket) {
        throw new Error('Local media or signaling socket is not ready.');
      }

      const pc = createPeerConnection(localStream, {
        onIceCandidate: (candidate) => {
          socket.emit('webrtc_ice', {
            toSocketId: peerSocketId,
            candidate: candidate.toJSON(),
          });
        },
        onTrack: (stream) => {
          setRemotes((prev) => {
            const next: RemoteTile = {
              socketId: peerSocketId,
              userId: peerUserId,
              stream,
              hasVideo: stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live'),
            };
            const idx = prev.findIndex((r) => r.socketId === peerSocketId);
            if (idx === -1) return [...prev, next];
            const copy = [...prev];
            copy[idx] = next;
            return copy;
          });
        },
      });

      const record: PeerRecord = { pc, userId: peerUserId, pendingIce: [] };
      peersRef.current.set(peerSocketId, record);
      setRemotes((prev) =>
        prev.some((r) => r.socketId === peerSocketId)
          ? prev
          : [...prev, { socketId: peerSocketId, userId: peerUserId, stream: null, hasVideo: false }]
      );
      return record;
    },
    [socket]
  );

  const flushIce = useCallback(async (record: PeerRecord) => {
    if (!record.pc.remoteDescription) return;
    const queued = record.pendingIce.splice(0, record.pendingIce.length);
    for (const candidate of queued) {
      await addIceCandidate(record.pc, candidate);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const join = async () => {
      if (!scheduleId) {
        setStatus('error');
        setErrorMessage('Missing meeting id.');
        return;
      }
      if (!socket) return;

      try {
        const res = await AiService.getVideoJoinToken(scheduleId);
        const creds = (res.data?.data ?? res.data) as VideoJoinCredentials;
        if (cancelled) return;

        setTitle(creds.title || 'Video call');
        setOrganizerName(
          creds.organizerName ||
            creds.members?.find((m) => m.role === 'organizer')?.name ||
            ''
        );
        setMembers(creds.members ?? []);

        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user' },
        });
        if (cancelled) {
          localStream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = localStream;
        if (localVideoElRef.current) {
          localVideoElRef.current.srcObject = localStream;
        }

        const maybeOffer = async (peerSocketId: string, peerUserId: string) => {
          if (!socket.id || peerSocketId === socket.id) return;
          const record = ensurePeer(peerSocketId, peerUserId);
          if (socket.id < peerSocketId) return;
          const sdp = await createOfferSdp(record.pc);
          socket.emit('webrtc_offer', { toSocketId: peerSocketId, sdp });
        };

        const onExisting = async (payload: {
          peers: Array<{ socketId: string; userId: string }>;
        }) => {
          for (const peer of payload.peers) {
            if (!peer.socketId) continue;
            await maybeOffer(peer.socketId, peer.userId);
          }
        };

        const onJoined = (payload: { socketId: string; userId: string }) => {
          if (!payload.socketId || payload.socketId === socket.id) return;
          void maybeOffer(payload.socketId, payload.userId);
        };

        const onOffer = async (payload: {
          fromSocketId: string;
          fromUserId: string;
          sdp: RTCSessionDescriptionInit;
        }) => {
          const record = ensurePeer(payload.fromSocketId, payload.fromUserId);
          const sdp = await acceptOfferAndCreateAnswer(record.pc, payload.sdp);
          await flushIce(record);
          socket.emit('webrtc_answer', { toSocketId: payload.fromSocketId, sdp });
        };

        const onAnswer = async (payload: {
          fromSocketId: string;
          sdp: RTCSessionDescriptionInit;
        }) => {
          const record = peersRef.current.get(payload.fromSocketId);
          if (!record) return;
          await acceptAnswer(record.pc, payload.sdp);
          await flushIce(record);
        };

        const onIce = async (payload: {
          fromSocketId: string;
          fromUserId: string;
          candidate: RTCIceCandidateInit;
        }) => {
          const record =
            peersRef.current.get(payload.fromSocketId) ??
            ensurePeer(payload.fromSocketId, payload.fromUserId);
          if (!record.pc.remoteDescription) {
            record.pendingIce.push(payload.candidate);
            return;
          }
          await addIceCandidate(record.pc, payload.candidate);
        };

        const onLeft = (payload: { socketId: string }) => {
          closePeer(payload.socketId);
        };

        socket.on('webrtc_existing_peers', onExisting);
        socket.on('webrtc_peer_joined', onJoined);
        socket.on('webrtc_offer', onOffer);
        socket.on('webrtc_answer', onAnswer);
        socket.on('webrtc_ice', onIce);
        socket.on('webrtc_peer_left', onLeft);

        const joinRoom = () => socket.emit('webrtc_join', { scheduleId });
        if (socket.connected) {
          joinRoom();
        } else {
          socket.once('connect', joinRoom);
        }

        setStatus('live');

        return () => {
          socket.off('webrtc_existing_peers', onExisting);
          socket.off('webrtc_peer_joined', onJoined);
          socket.off('webrtc_offer', onOffer);
          socket.off('webrtc_answer', onAnswer);
          socket.off('webrtc_ice', onIce);
          socket.off('webrtc_peer_left', onLeft);
          socket.off('connect', joinRoom);
        };
      } catch (err) {
        if (cancelled) return;
        const msg = isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message || err.message
          : err instanceof Error
            ? err.message
            : 'Could not join the call';
        setErrorMessage(msg);
        setStatus('error');
        toast.error(msg);
        return undefined;
      }
    };

    let cleanupListeners: (() => void) | undefined;
    void join().then((cleanup) => {
      cleanupListeners = cleanup;
    });

    return () => {
      cancelled = true;
      cleanupListeners?.();
      void leaveCall();
    };
  }, [scheduleId, socket, ensurePeer, flushIce, closePeer, leaveCall]);

  useEffect(() => {
    if (status === 'live' && localVideoElRef.current && localStreamRef.current) {
      localVideoElRef.current.srcObject = localStreamRef.current;
    }
  }, [status]);

  useEffect(() => {
    for (const remote of remotes) {
      const el = remoteVideoEls.current.get(remote.socketId);
      if (el && remote.stream && el.srcObject !== remote.stream) {
        el.srcObject = remote.stream;
      }
    }
  }, [remotes]);

  const connectedUserIds = useMemo(() => {
    const set = new Set<string>();
    if (currentUser?.id) set.add(currentUser.id);
    for (const r of remotes) {
      if (r.userId) set.add(r.userId);
    }
    return set;
  }, [currentUser?.id, remotes]);

  const nameForUser = useCallback(
    (userId: string) => {
      if (userId === currentUser?.id) return 'You';
      return members.find((m) => m.userId === userId)?.name ?? 'Guest';
    },
    [members, currentUser?.id]
  );

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  };

  const tileCount = 1 + remotes.length;
  const gridClass =
    tileCount === 1
      ? 'grid-cols-1 grid-rows-1'
      : tileCount === 2
        ? 'grid-cols-1 grid-rows-2 sm:grid-cols-2 sm:grid-rows-1'
        : tileCount === 3
          ? 'grid-cols-2 grid-rows-2'
          : 'grid-cols-2 grid-rows-2 lg:grid-cols-3';

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-slate-950 text-white">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => void goBack()}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
            <p className="truncate text-xs text-slate-400">
              {organizerName ? `Created by ${organizerName}` : 'Video call'}
              {status === 'live' ? ` · ${1 + remotes.length} in call` : ''}
              {status === 'loading' ? ' · Connecting…' : ''}
            </p>
          </div>
        </div>
        {status === 'live' ? (
          <button
            type="button"
            onClick={() => setShowMembers((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              showMembers ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users className="h-4 w-4" />
            Members
          </button>
        ) : null}
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="relative flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          {status === 'loading' && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-slate-300">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-sm">Starting camera…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="max-w-md text-sm text-rose-300">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void goBack()}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Go back
              </button>
            </div>
          )}

          {status === 'live' && (
            <>
              <div className={`grid min-h-0 flex-1 gap-3 ${gridClass}`}>
                <div className="relative min-h-0 overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10">
                  <video
                    ref={localVideoElRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium">
                    You {!camOn ? '(camera off)' : ''}
                  </span>
                </div>

                {remotes.map((remote) => (
                  <div
                    key={remote.socketId}
                    className="relative min-h-0 overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10"
                  >
                    <video
                      ref={(el) => {
                        if (el) remoteVideoEls.current.set(remote.socketId, el);
                        else remoteVideoEls.current.delete(remote.socketId);
                      }}
                      autoPlay
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium">
                      {nameForUser(remote.userId)}
                      {!remote.hasVideo ? ' (connecting)' : ''}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex shrink-0 items-center justify-center gap-3 pb-1">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`rounded-full p-3.5 transition ${
                    micOn ? 'bg-white/10 hover:bg-white/15' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                  aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={toggleCam}
                  className={`rounded-full p-3.5 transition ${
                    camOn ? 'bg-white/10 hover:bg-white/15' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                  aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
                >
                  {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => void goBack()}
                  className="rounded-full bg-rose-600 p-3.5 transition hover:bg-rose-500"
                  aria-label="Leave call"
                >
                  <PhoneOff className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {status === 'live' && showMembers ? (
          <aside className="max-h-[32vh] shrink-0 overflow-y-auto border-t border-white/10 bg-slate-900/80 p-4 lg:max-h-none lg:h-full lg:w-72 lg:border-l lg:border-t-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Meeting members
            </p>
            <ul className="space-y-2">
              {(members.length > 0
                ? members
                : [{ userId: currentUser?.id ?? 'you', name: 'You', role: 'invitee' as const }]
              ).map((member) => {
                const inCall = connectedUserIds.has(member.userId);
                const isYou = member.userId === currentUser?.id;
                return (
                  <li
                    key={member.userId}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold uppercase">
                      {(member.name || '?').slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {isYou ? `${member.name} (you)` : member.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {member.role === 'organizer' ? 'Organizer · ' : ''}
                        {inCall ? 'In call' : 'Not joined'}
                      </p>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full ${inCall ? 'bg-emerald-400' : 'bg-slate-600'}`}
                      aria-hidden
                    />
                  </li>
                );
              })}
            </ul>
          </aside>
        ) : null}
      </main>
    </div>
  );
};
