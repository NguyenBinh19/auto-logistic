import { useState, useEffect, useRef } from "react";
import { Avatar, Input, List, Spin, Empty } from "antd";
import {
    MessageOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../../services/axios.config";
import { useLocation, useNavigate } from "react-router-dom";
import {
    PhoneOutlined,
    VideoCameraOutlined
} from "@ant-design/icons";
import {
    PaperClipOutlined,
    ThunderboltOutlined,
    PictureOutlined
} from "@ant-design/icons";
export default function GlobalChatWidget() {
    const navigate = useNavigate();
    const peerRef = useRef(null);
    const [callState, setCallState] = useState("idle");
    const [isCalling, setIsCalling] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [connected, setConnected] = useState(false);
    const targetUserIdRef = useRef(null);
    const clientRef = useRef(null);
    const bottomRef = useRef(null);
    const selectedChatRef = useRef(null);
    const searchTimeout = useRef(null);
    const [isSearching, setIsSearching] = useState(false);
    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    const currentUserId = currentUser?.userId;
    const [mode, setMode] = useState("user"); // "user" | "ai"
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState("");
    const protocol = window.location.protocol === "https:" ? "https" : "http";
    const conversationIdFromNav = location.state?.conversationId;
    const iceQueueRef = useRef([]);
    const remoteAudioRef = useRef(null);
    const fileInputRef = useRef();
    const imageInputRef = useRef();
    const [previewImage, setPreviewImage] = useState(null);
    const messagesEndRef = useRef(null);

    const createPeer = () => {
        if (peerRef.current) {
            peerRef.current.close();
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            setRemoteStream(stream);

            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = stream;
                remoteAudioRef.current.play().catch(() => { });
            }

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && targetUserIdRef.current) {
                clientRef.current.publish({
                    destination: "/app/call.signal",
                    body: JSON.stringify({
                        type: "ICE",
                        fromUserId: currentUserId,
                        toUserId: targetUserIdRef.current,
                        candidate: event.candidate
                    })
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("🔗 state:", pc.connectionState);

            if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
                cleanupCall();
            }
        };

        return pc;
    };

    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.volume = 1;
        }
    }, [remoteStream]);

    const socketUrl =
        protocol === "https"
            ? `https://www.hmsb2b.site/backend/ws`
            : `http://localhost:8080/ws`;
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    const cleanupCall = () => {
        console.log("🧹 cleanup call");

        if (peerRef.current) {
            peerRef.current.ontrack = null;
            peerRef.current.onicecandidate = null;
            peerRef.current.close();
            peerRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }

        setLocalStream(null);
        setRemoteStream(null);
        setCallState("idle");
    };

    useEffect(() => {
        if (!currentUserId) return;

        api.get("/chat/conversations", {
            params: { userId: currentUserId },
        }).then((res) => {
            setChats(res.data);

            if (conversationIdFromNav) {
                const found = res.data.find(
                    (c) => c.conversationId === conversationIdFromNav
                );
                if (found) setSelectedChat(found);
            } else if (res.data.length > 0) {
                setSelectedChat(res.data[0]);
            }
        });
    }, [currentUserId]);

    const startMedia = async (video = false) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video,
        });

        setLocalStream(stream);
        localStreamRef.current = stream;

        return stream;
    };

    const handleSearch = (value) => {
        setSearchText(value);

        clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            if (!value.trim()) {
                setAllUsers([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            setLoadingUsers(true);

            const res = await api.get("/users");

            const users = res.data.result || [];

            const filtered = users.filter((u) => {
                if (u.id === currentUserId) return false;

                if (!value) return true;

                return (u.username || "")
                    .toLowerCase()
                    .includes(value.toLowerCase());
            });

            setAllUsers(filtered);
            setLoadingUsers(false);
        }, 300);
    };

    useEffect(() => {
        if (!selectedChat?.conversationId) return;

        setMessages([]);

        api.get("/chat/history", {
            params: {
                conversationId: selectedChat.conversationId
            }
        }).then((res) => {
            setMessages(
                res.data.map((m) => ({
                    type: m.senderId === currentUserId ? "right" : "left",
                    content: m.content,
                    fileUrl: m.fileUrl,
                    fileName: m.fileName,
                    msgType: m.type, // 🔥 FIX QUAN TRỌNG
                    time: new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    }),
                }))
            );
        });
    }, [selectedChat]);

    const startChat = async (user) => {
        setMessages([]);

        const res = await api.post("/chat/init-regular", null, {
            params: {
                userId: currentUserId,
                hotelId: user.id
            }
        });

        const conversation = res.data;

        setSelectedChat(conversation);

        setChats((prev) => {
            const exists = prev.find(
                (c) => c.conversationId === conversation.conversationId
            );
            return exists ? prev : [conversation, ...prev];
        });

        setShowSearch(false);
        setSearchText("");
        setAllUsers([]);
    };

    const sendMessage = () => {
        if (
            !message.trim() ||
            !clientRef.current?.connected ||
            !selectedChat?.conversationId
        ) return;

        const text = message;

        setMessage("");

        setMessages((prev) => [
            ...prev,
            {
                type: "right",
                content: text,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
        ]);

        clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
                conversationId: selectedChat.conversationId,
                senderId: currentUserId,
                content: text
            })
        });
    };

    const displayList = chats.filter((item) => {
        if (activeFilter === "ALL") return true;

        if (activeFilter === "UNREAD") {
            return item.unreadCount > 0;
        }

        if (activeFilter === "NEGOTIATION") {
            return item.type === "NEGOTIATION";
        }

        return true;
    });

    const handleCall = async (video) => {
        if (!selectedChat || !clientRef.current?.connected) return;

        targetUserIdRef.current = selectedChat.userId;

        setCallState("calling");
        setIsVideoCall(video);

        const stream = await startMedia(video);

        const pc = createPeer();
        peerRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        clientRef.current.publish({
            destination: "/app/call.signal",
            body: JSON.stringify({
                type: "OFFER",
                fromUserId: currentUserId,
                toUserId: targetUserIdRef.current,
                offer,
                video
            })
        });
    };

    const endCall = () => {
        if (clientRef.current && targetUserIdRef.current) {
            clientRef.current.publish({
                destination: "/app/call.signal",
                body: JSON.stringify({
                    type: "END",
                    fromUserId: currentUserId,
                    toUserId: targetUserIdRef.current
                })
            });
        }

        cleanupCall();
    };

    const acceptCall = async () => {
        const stream = await startMedia(isVideoCall);

        let pc = peerRef.current;

        if (!pc) {
            pc = createPeer();
            peerRef.current = pc;
        }

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        if (!pc.remoteDescription) {
            console.error("❌ No remote offer");
            return;
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        clientRef.current.publish({
            destination: "/app/call.signal",
            body: JSON.stringify({
                type: "ANSWER",
                fromUserId: currentUserId,
                toUserId: targetUserIdRef.current,
                answer
            })
        });

        setCallState("in-call");
    };

    const rejectCall = () => {
        if (clientRef.current && targetUserIdRef.current) {
            clientRef.current.publish({
                destination: "/app/call.signal",
                body: JSON.stringify({
                    type: "REJECT",
                    fromUserId: currentUserId,
                    toUserId: targetUserIdRef.current
                })
            });
        }

        cleanupCall();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/storage/upload-chat", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        const { url, fileName } = res.data;

        sendFileMessage("FILE", url, fileName);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/storage/upload-chat", formData);

        const { url, fileName } = res.data;

        sendFileMessage("IMAGE", url, fileName);
    };

    const sendFileMessage = (type, url, fileName) => {
        if (!clientRef.current?.connected || !selectedChat) return;

        const msg = {
            conversationId: selectedChat.conversationId,
            senderId: currentUserId,
            content: "",
            type,
            fileUrl: url,
            fileName
        };

        clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(msg)
        });

        setMessages(prev => [
            ...prev,
            {
                type: "right",
                content: "",
                fileUrl: url,
                fileName,
                msgType: type,
                time: new Date().toLocaleTimeString()
            }
        ]);
    };

    useEffect(() => {
        const el = messagesEndRef.current?.parentElement;
        if (!el) return;

        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    useEffect(() => {
        if (callState === "in-call" && localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [callState, localStream]);

    useEffect(() => {
        if (!currentUserId) return;

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(`${socketUrl}?userId=${currentUserId}`),
            reconnectDelay: 5000,
            connectHeaders: {
                username: currentUser.username,
            },
            onConnect: () => {
                setConnected(true);

                client.subscribe("/user/queue/call", async (msg) => {
                    const signal = JSON.parse(msg.body);

                    console.log("📞 Signal:", signal);

                    if (signal.type === "CALL") {
                        targetUserIdRef.current = signal.fromUserId;

                        setCallState("incoming");
                        setIsVideoCall(signal.video);

                        setSelectedChat({
                            userId: signal.fromUserId
                        });
                    }

                    if (signal.type === "REJECT") {
                        console.log("❌ Call rejected");
                        cleanupCall();
                    }

                    if (signal.type === "END") {
                        console.log("📴 Call ended");
                        cleanupCall();
                    }

                    if (signal.type === "OFFER") {
                        targetUserIdRef.current = signal.fromUserId;

                        setCallState("incoming");
                        setIsVideoCall(signal.video);

                        setSelectedChat({
                            userId: signal.fromUserId,
                            name: "Caller"
                        });

                        peerRef.current = createPeer();

                        await peerRef.current.setRemoteDescription(signal.offer);

                        // 🔥 xử lý ICE bị delay
                        iceQueueRef.current.forEach(async (c) => {
                            try {
                                await peerRef.current.addIceCandidate(c);
                            } catch (e) {
                                console.error("ICE error:", e);
                            }
                        });
                        iceQueueRef.current = [];
                    }

                    if (signal.type === "ANSWER") {
                        await peerRef.current.setRemoteDescription(signal.answer);

                        // 🔥 flush ICE queue
                        iceQueueRef.current.forEach(async (c) => {
                            try {
                                await peerRef.current.addIceCandidate(c);
                            } catch (e) {
                                console.error("ICE error:", e);
                            }
                        });
                        iceQueueRef.current = [];
                        setCallState("in-call");
                    }

                    if (signal.type === "ICE") {
                        const pc = peerRef.current;
                        if (!pc) return;

                        const candidate = new RTCIceCandidate(signal.candidate);

                        if (!pc.remoteDescription) {
                            iceQueueRef.current.push(candidate);
                            return;
                        }

                        await pc.addIceCandidate(candidate);
                    }

                    if (signal.type === "END") {
                        endCall();
                    }
                });

                client.subscribe("/user/queue/conversations", (msg) => {
                    const convo = JSON.parse(msg.body);
                    setChats((prev) => {
                        const filtered = prev.filter((c) => c.userId !== convo.userId);
                        return [convo, ...filtered];
                    });
                });

                client.subscribe("/user/queue/messages", (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    const currentChat = selectedChatRef.current;

                    const otherUserId =
                        newMsg.senderId === currentUserId
                            ? newMsg.receiverId
                            : newMsg.senderId;

                    const isCurrentChat =
                        currentChat &&
                        (
                            (newMsg.senderId === currentUserId && newMsg.receiverId === currentChat.userId) ||
                            (newMsg.receiverId === currentUserId && newMsg.senderId === currentChat.userId)
                        );

                    if (!isCurrentChat) return;
                    if (newMsg.senderId === currentUserId) return;

                    setMessages((prev) => [
                        ...prev,
                        {
                            type: "left",
                            content: newMsg.content,
                            fileUrl: newMsg.fileUrl,
                            fileName: newMsg.fileName,
                            msgType: newMsg.type,
                            time: new Date(newMsg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            }),
                        },
                    ]);
                });
            },
            onDisconnect: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => client.deactivate();
    }, [currentUserId]);

    return (
        <div>
            <div className="w-full h-[85vh] bg-white flex overflow-hidden">

                {/* SIDEBAR */}
                <div className="w-[320px] border-r flex flex-col bg-gray-50">

                    {/* HEADER */}
                    <div className="p-4 border-b bg-white">
                        <div className="font-semibold text-lg">Tin nhắn</div>

                        <Input
                            placeholder="Tìm theo tên đại lý hoặc mã booking..."
                            className="mt-3"
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                        />

                        {/* FILTER */}
                        <div className="flex gap-2 mt-3 text-xs bg-gray-100 p-1 rounded-full w-fit">
                            <button
                                onClick={() => setActiveFilter("ALL")}
                                className={`px-3 py-1.5 rounded-full transition-all ${activeFilter === "ALL"
                                    ? "bg-white shadow text-blue-600 font-medium"
                                    : "text-gray-500 hover:text-black"
                                    }`}
                            >
                                Tất cả
                            </button>

                            <button
                                onClick={() => setActiveFilter("UNREAD")}
                                className={`px-3 py-1.5 rounded-full transition-all ${activeFilter === "UNREAD"
                                    ? "bg-white shadow text-blue-600 font-medium"
                                    : "text-gray-500 hover:text-black"
                                    }`}
                            >
                                Chưa đọc
                            </button>

                            <button
                                onClick={() => setActiveFilter("NEGOTIATION")}
                                className={`px-3 py-1.5 rounded-full transition-all ${activeFilter === "NEGOTIATION"
                                    ? "bg-white shadow text-blue-600 font-medium"
                                    : "text-gray-500 hover:text-black"
                                    }`}
                            >
                                Thương lượng
                            </button>
                        </div>
                    </div>

                    {/* LIST */}
                    <div className="flex-1 overflow-auto p-2">
                        {loadingUsers && (
                            <div className="flex justify-center p-4">
                                <Spin />
                            </div>
                        )}

                        {searchText && allUsers.length > 0 && (
                            <div className="p-2">
                                <div className="text-xs text-gray-400 mb-2 px-2">
                                    Kết quả tìm kiếm
                                </div>

                                {allUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => startChat(user)}
                                        className="p-3 rounded-xl cursor-pointer hover:bg-gray-100 flex gap-3 items-center"
                                    >
                                        <Avatar className="bg-green-500">
                                            {user.username?.[0]}
                                        </Avatar>

                                        <div className="text-sm font-medium">
                                            {user.username}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!searchText && displayList.map((item) => (
                            <div
                                key={item.userId}
                                onClick={async () => {
                                    setSelectedChat(item);

                                    await api.post("/chat/read", null, {
                                        params: {
                                            conversationId: item.conversationId,
                                            userId: currentUserId
                                        }
                                    });

                                    const res = await api.get("/chat/conversations", {
                                        params: { userId: currentUserId }
                                    });

                                    setChats(res.data);
                                }}
                                className={`p-3 rounded-xl cursor-pointer mb-2 transition ${selectedChat?.userId === item.userId
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <div className="flex gap-3">

                                    {/* AVATAR */}
                                    <div className="relative">
                                        <Avatar className="bg-blue-500">
                                            {item.name?.[0]}
                                        </Avatar>

                                        {item.unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                                                {item.unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 overflow-hidden">

                                        {/* NAME + TIME */}
                                        <div className="flex justify-between items-center">
                                            <div className="font-medium text-sm">
                                                {item.name}
                                            </div>

                                            <div className="text-xs text-gray-400">
                                                {item.time &&
                                                    new Date(item.time).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                            </div>
                                        </div>

                                        {/* RANK + BOOKING */}
                                        <div className="text-[11px] text-gray-500 flex gap-2 mt-0.5">
                                            <span className="text-yellow-600 font-medium">
                                                {item?.rank != null && (
                                                    <>
                                                        🏆 {item.rank}
                                                    </>
                                                )}
                                            </span>
                                            {item?.type === "BOOKING" && (
                                                <span>
                                                    Booking: {item.booking}
                                                </span>
                                            )}
                                            {item?.type === "NEGOTIATION" && (
                                                <span className="text-green-600 font-medium">
                                                    Thương lượng giá
                                                </span>
                                            )}
                                            {item?.type === "GENERAL" && (
                                                <span className="text-blue-600 font-medium">
                                                    Tin nhắn chung
                                                </span>
                                            )}
                                        </div>

                                        {/* TAG */}
                                        {item.tag && (
                                            <div className="text-[11px] text-orange-500 mt-0.5">
                                                {item.tag}
                                            </div>
                                        )}

                                        {/* LAST MESSAGE */}
                                        <div className="text-xs text-gray-500 truncate mt-1">
                                            {item.lastMessage || "Start chatting..."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex-1 flex flex-col min-h-0">

                    {/* HEADER */}
                    <div className="p-4 border-b bg-white flex justify-between items-center">

                        <div className="flex items-center gap-3">
                            <Avatar className="bg-blue-500">
                                {selectedChat?.name?.[0]}
                            </Avatar>

                            <div>
                                <div className="font-semibold text-sm">
                                    {selectedChat?.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {selectedChat?.phoneNumber}
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedChat?.type === "BOOKING" && (
                        <div className="p-3 border-b bg-gray-50">
                            <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-blue-700">
                                        {selectedChat?.hotelName || "Booking Chat"}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {selectedChat?.checkIn && selectedChat?.checkOut && (
                                            <>
                                                {new Date(selectedChat.checkIn).toLocaleDateString()} -{" "}
                                                {new Date(selectedChat.checkOut).toLocaleDateString()} • #{selectedChat.booking}
                                            </>
                                        )}
                                    </div>

                                    {selectedChat?.room && (
                                        <div className="text-xs text-gray-400">
                                            {selectedChat.room}
                                        </div>
                                    )}
                                </div>

                                <div
                                    onClick={() =>
                                        navigate(`/agency/booking-list/detail/${selectedChat.booking}`)
                                    }
                                    className="text-blue-500 text-xs cursor-pointer"
                                >
                                    Xem chi tiết đơn
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedChat?.type === "NEGOTIATION" && (
                        <div className="p-3 border-b bg-gray-50">
                            <div className="bg-orange-50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-sm text-orange-700">
                                        {selectedChat?.hotelName || "Thương lượng giá"}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {selectedChat?.checkIn && selectedChat?.checkOut && (
                                            <>
                                                {new Date(selectedChat.checkIn).toLocaleDateString()} -{" "}
                                                {new Date(selectedChat.checkOut).toLocaleDateString()}
                                            </>
                                        )}
                                    </div>

                                    {selectedChat?.room && (
                                        <div className="text-xs text-gray-400">
                                            {selectedChat.room}
                                        </div>
                                    )}
                                </div>

                                <div className="text-orange-500 text-xs font-medium">
                                    Đang thương lượng
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MESSAGES */}
                    <div
                        ref={bottomRef}
                        className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-100 space-y-3"
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.type === "right"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[65%] px-4 py-2 rounded-xl text-sm ${msg.type === "right"
                                        ? "bg-blue-500 text-white"
                                        : "bg-white"
                                        }`}
                                >
                                    {msg.msgType === "IMAGE" && msg.fileUrl && (
                                        <img
                                            src={msg.fileUrl}
                                            className="max-w-[200px] rounded cursor-pointer hover:opacity-80 transition"
                                            onClick={() => setPreviewImage(msg.fileUrl)}
                                        />
                                    )}

                                    {msg.msgType === "FILE" && msg.fileUrl && (
                                        <a
                                            href={msg.fileUrl}
                                            target="_blank"
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${msg.type === "right"
                                                ? "bg-white/20 text-white hover:bg-white/30"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                } transition`}
                                        >
                                            📎 <span className="truncate max-w-[150px]">{msg.fileName}</span>
                                        </a>
                                    )}

                                    {msg.msgType !== "IMAGE" && msg.msgType !== "FILE" && (
                                        <div>{msg.content}</div>
                                    )}

                                    <div className="text-[10px] opacity-60 mt-1 text-right">
                                        {msg.time}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT */}
                    <div className="p-3 border-t bg-white flex items-center gap-2">

                        <div className="flex gap-3 text-gray-500 text-lg px-2">
                            <span
                                onClick={() => fileInputRef.current.click()}
                                className="hover:text-blue-500 cursor-pointer transition"
                            >
                                <PaperClipOutlined />
                            </span>

                            <span
                                className="hover:text-yellow-500 cursor-pointer transition"
                            >
                                <ThunderboltOutlined />
                            </span>

                            <span
                                onClick={() => imageInputRef.current.click()}
                                className="hover:text-green-500 cursor-pointer transition"
                            >
                                <PictureOutlined />
                            </span>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            onChange={handleFileUpload}
                        />

                        <input
                            type="file"
                            accept="image/*"
                            ref={imageInputRef}
                            hidden
                            onChange={handleImageUpload}
                        />

                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                        />

                        <div
                            onClick={sendMessage}
                            className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full cursor-pointer"
                        >
                            ➤
                        </div>
                    </div>
                    {callState !== "idle" && (
                        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">

                            {/* 📥 INCOMING CALL */}
                            {callState === "incoming" && (
                                <>
                                    <div className="text-white text-xl mb-6">
                                        📞 Cuộc gọi đến...
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={acceptCall}
                                            className="px-6 py-2 bg-green-500 text-white rounded-full"
                                        >
                                            Nghe
                                        </button>

                                        <button
                                            onClick={rejectCall}
                                            className="px-6 py-2 bg-red-500 text-white rounded-full"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* 📤 CALLING */}
                            {callState === "calling" && (
                                <>
                                    <div className="text-white text-lg mb-4">
                                        📞 Đang gọi...
                                    </div>

                                    <button
                                        onClick={endCall}
                                        className="px-6 py-2 bg-red-500 text-white rounded-full"
                                    >
                                        Hủy
                                    </button>
                                </>
                            )}

                            {/* 📡 IN CALL */}
                            {callState === "in-call" && (
                                <>
                                    {/* VIDEO nếu là video call */}
                                    {isVideoCall && (
                                        <div className="flex gap-4 mb-6">
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                muted
                                                playsInline
                                                className="w-80 h-80 bg-black rounded-lg"
                                            />
                                            <video
                                                ref={remoteVideoRef}
                                                autoPlay
                                                playsInline
                                                muted={false}
                                            />
                                        </div>
                                    )}

                                    {/* AUDIO ONLY */}
                                    {!isVideoCall && (
                                        <div className="text-white text-lg mb-6">
                                            📞 Đang trong cuộc gọi
                                            <audio
                                                ref={remoteAudioRef}
                                                autoPlay
                                                playsInline
                                            />
                                        </div>
                                    )}

                                    {/* ❗ QUAN TRỌNG: Nút kết thúc */}
                                    <button
                                        onClick={endCall}
                                        className="px-6 py-2 bg-red-500 text-white rounded-full"
                                    >
                                        Kết thúc
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                {previewImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                        onClick={() => setPreviewImage(null)}
                    >
                        <img
                            src={previewImage}
                            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
                            onClick={(e) => e.stopPropagation()} // ❗ tránh click ảnh bị đóng
                        />
                    </div>
                )}
                <audio ref={remoteAudioRef} autoPlay playsInline />
            </div>
        </div>

    );
}