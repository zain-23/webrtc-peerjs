"use client";
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const callingVideoRef = useRef<HTMLVideoElement>(null);

  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myUniqueId, setMyUniqueId] = useState<string>("");
  const [idToCall, setIdToCall] = useState("");

  const generateRandomString = () => Math.random().toString(36).substring(2);

  useEffect(() => {
    if (myUniqueId) {
      let peer: Peer;
      if (typeof window !== undefined) {
        peer = new Peer(myUniqueId, {
          host: "localhost",
          port: 4000,
          path: "/my-app",
        });
        setPeerInstance(peer);

        peer.on("open", (id) => {
          console.log("Peer connected with ID:", id);
        });

        navigator.mediaDevices
          .getUserMedia({
            audio: true,
            video: true,
          })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }

            peer.on("call", (call) => {
              if (call.peer) {
                alert(
                  `Someone is calling you would you like to accept ${call.peer}`
                );
              }
              call.answer(stream);
              call.on("stream", (userVideoStream) => {
                if (callingVideoRef.current) {
                  callingVideoRef.current.srcObject = userVideoStream;
                }
              });
            });

            peer.on("error", (err) => {
              console.log("eerrere", err);
            });

            peer.on("connection", (incoming) => {
              console.log(incoming);
            });
          });
      }
      return () => {
        if (peer) {
          peer.destroy();
        }
      };
    }
  }, [myUniqueId]);

  useEffect(() => {
    setMyUniqueId(generateRandomString);
  }, []);

  const handleCall = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        if (!peerInstance) {
          console.error("peerInstance is undefined");
          return;
        }
        if (!idToCall) {
          console.error("idToCall is undefined or invalid");
          return;
        }
        const call = peerInstance.call(idToCall, stream);
        console.log("Call object:", call); // Debugging log
        if (call) {
          call.on("stream", (userVideoStream) => {
            if (callingVideoRef.current) {
              callingVideoRef.current.srcObject = userVideoStream;
            }
          });
        }
      });
  };

  return (
    <div className="flex flex-col justify-center items-center p-12">
      <p>your id : {myUniqueId}</p>
      <video className="w-72" playsInline ref={videoRef} autoPlay />
      <p>Call to another person</p>
      <input
        className="text-black"
        placeholder="Id to call"
        value={idToCall}
        onChange={(e) => setIdToCall(e.target.value)}
      />
      <button onClick={handleCall}>CALL</button>
      <video className="w-72" playsInline ref={callingVideoRef} autoPlay />
    </div>
  );
}
