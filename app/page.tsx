"use client";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useRef, useState } from "react";
import { Rings } from "react-loader-spinner";
import Webcam from "react-webcam";
import { toast } from "sonner";
import {
  Camera,
  Divide,
  FlipHorizontal,
  MoonIcon,
  PersonStanding,
  Power,
  PowerOff,
  ShieldMinus,
  ShieldPlus,
  SunIcon,
  Video,
  Volume2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { beep } from "@/utils/beep";
import * as cocossd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import { DetectedObject, ObjectDetection } from "@tensorflow-models/coco-ssd";
import { drawOnCanvas } from "@/utils/draw";
import { formatDate } from "@/utils/formatDate";
import { base64toBlob } from "@/utils/base64toBlob";
import SocialMediaLinks from "@/components/social-links";

type Props = {};

let interval: any = null;
let stopTimeout: any = null;

const HomePage = (props: Props) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [mirrored, setMirrored] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(false);
  const [volume, setVolume] = useState(0.8);
  const [model, setModel] = useState<ObjectDetection>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isVideoShown, setIsVideoShown] = useState<boolean>(false);

  useEffect(() => {
    if (webcamRef && webcamRef.current) {
      const stream = (webcamRef.current.video as any).captureStream();
      if (stream) {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            const recordedBlob = new Blob([e.data], {
              type: "video",
            });
            const videoUrl = URL.createObjectURL(recordedBlob);
            const a = document.createElement("a");
            a.href = videoUrl;
            a.download = `${formatDate(new Date())}.webm`;
            a.click();
          }
        };
        mediaRecorderRef.current.onstart = (e) => {
          setIsRecording(true);
        };
        mediaRecorderRef.current.onstop = (e) => {
          setIsRecording(false);
        };
      }
    }
  }, [webcamRef, isVideoShown]); //to know if webcam is available before we record anything

  function userPromptScreenshot() {
    if (!webcamRef.current) {
      toast("Camera not found. Please refresh.");
    } else {
      const imgSrc = webcamRef.current.getScreenshot();
      const blob = base64toBlob(imgSrc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formatDate(new Date())}.png`;
      a.click();
    }
  }

  function userPromptRecord() {
    if (!webcamRef.current) {
      toast("Camera not found. Please refresh.");
    }
    // console.log(mediaRecorderRef.current?.state);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
      toast("Recording saved to downloads folder");
    } else {
      startRecording(false);
    }
  }

  function startRecording(sound: boolean) {
    try {
      if (
        webcamRef.current &&
        mediaRecorderRef.current?.state !== "recording"
      ) {
        mediaRecorderRef.current?.start();
        sound && beep(volume);
        stopTimeout = setTimeout(() => {
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.requestData();
            mediaRecorderRef.current.stop();
          }
        }, 30000);
      }
    } catch (error) {
      console.error("Error starting recording: ", error);
    }
  }

  function toggleAutoRecord(event: any) {
    if (autoRecordEnabled) {
      setAutoRecordEnabled(false);
      toast("Autorecord disabled.", {
        // description: "Sunday, December 03, 2023 at 9:00 AM",
      });
    } else {
      setAutoRecordEnabled(true);
      toast("Autorecord enabled.", {
        // description: "Sunday, December 03, 2023 at 9:00 AM",
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    initModel();
  }, []);

  //load ai model && set a state variable
  async function initModel() {
    const loadModel: ObjectDetection = await cocossd.load({
      base: "mobilenet_v2",
    });
    setModel(loadModel);
  }

  useEffect(() => {
    if (model) {
      setLoading(false);
    }
  }, [model]);

  async function runPrediction() {
    if (
      model &&
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
      // HAVE_ENOUGH_DATA	4	Enough data is available—and the download rate is high enough—that the media can be played through to the end without interruption.
    ) {
      const predictions: DetectedObject[] = await model.detect(
        webcamRef.current.video
      );
      // Returns an array of classes and probabilities that looks like:
      // [{
      //   bbox: [x, y, width, height],
      //   class: "person",
      //   score: 0.8380282521247864
      // }, {
      //   bbox: [x, y, width, height],
      //   class: "kite",
      //   score: 0.74644153267145157
      // }]
      resizeCanvas(canvasRef, webcamRef);
      drawOnCanvas(mirrored, predictions, canvasRef.current?.getContext("2d"));
      let isPerson: boolean = false;
      if (predictions.length > 0) {
        predictions.forEach((pred) => {
          isPerson = pred.class === "person";
        });
        if (isPerson && autoRecordEnabled) {
          startRecording(true);
        }
      }
    }
  }

  useEffect(() => {
    interval = setInterval(() => {
      runPrediction();
    }, 100); //time for every prediction

    return () => clearInterval(interval); //we clear interval so if the useEffect is called multiple times, we have only one prediction left. If not we will have multiple predictions.
  }, [webcamRef.current, model, mirrored, autoRecordEnabled]); //eslint-disable-line

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* left - webcam */}
      <div className="relative flex-1">
        {isVideoShown ? (
          <div className="relative h-screen w-full">
            <Webcam
              ref={webcamRef}
              mirrored={mirrored}
              className="h-full w-full object-contain p-2"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 h-full w-full object-contain"
            ></canvas>
          </div>
        ) : (
          <div className="relative">
            <div className="w-full h-screen flex items-center justify-center gap-4 flex-col">
              <p className="text-sm text-foreground">Enable camera to start</p>
              <div className="border border-red-600 p-4 rounded-full">
                <Power
                  size={24}
                  className="cursor-pointer"
                  color="red"
                  onClick={() => setIsVideoShown(true)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* right - buttons */}
      <div className="flex flex-row ">
        <div className="border-primary/5 border-2 max-w-xs flex flex-col gap-2 justify-between shadow-md rounded-md p-4">
          {/* top */}
          <div className="flex flex-col gap-2">
            <ModeToggle />
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={() => {
                setMirrored((prev) => !prev);
              }}
              disabled={!isVideoShown}
            >
              <FlipHorizontal />
            </Button>
            <Separator className="my-2" />
          </div>

          {/* middle */}
          <div className="flex flex-col gap-2">
            <Separator className="my-2" />
            <Button
              variant={"outline"}
              onClick={userPromptScreenshot}
              size={"icon"}
              disabled={!isVideoShown}
            >
              <Camera />
            </Button>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={userPromptRecord}
              size={"icon"}
              disabled={!isVideoShown}
            >
              <Video />
            </Button>
            <Separator className="my-2" />
            <Button
              variant={autoRecordEnabled ? "destructive" : "outline"}
              size={"icon"}
              onClick={toggleAutoRecord}
              disabled={!isVideoShown}
            >
              {autoRecordEnabled ? (
                <Rings color="white" height={40} width={40} />
              ) : (
                <PersonStanding />
              )}
            </Button>
          </div>

          {/* bottom */}
          <div className="flex flex-col gap-2">
            <Button variant={"outline"} size={"icon"}>
              {isVideoShown ? (
                <PowerOff
                  size={22}
                  className="cursor-pointer"
                  onClick={() => setIsVideoShown((prev) => !prev)}
                />
              ) : (
                <Power
                  size={22}
                  className="cursor-pointer"
                  color="red"
                  onClick={() => setIsVideoShown((prev) => !prev)}
                />
              )}
            </Button>
            <Separator className="my-2" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} size={"icon"}>
                  <Volume2 />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Slider
                  max={1}
                  min={0}
                  step={0.2}
                  defaultValue={[volume]}
                  onValueCommit={(val) => {
                    setVolume(val[0]);
                    beep(val[0]);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="h-full flex-1 py-4 px-2 overflow-y-scroll">
          <RenderFeatureHighlightsSection />
        </div>
      </div>
      {loading && (
        <div className="z-50 absolute w-full h-full flex items-center justify-center bg-primary-foreground">
          Getting started ... <Rings height={50} color="red" />
        </div>
      )}
    </div>
  );

  function RenderFeatureHighlightsSection() {
    return (
      <div className="text-xs text-muted-foreground">
        <ul className="space-y-4">
          <li className="flex items-center justify-between p-2">
            <div className="flex-1 px-2">
              <strong>Dark Mode/Sys Theme 🌗</strong>
              <p>Toggle between dark mode and system theme.</p>
            </div>
            <div className="flex items-center justify-end gap-1 min-w-20 p-2">
              <Button
                className="my-2 h-6 w-6"
                variant={"outline"}
                size={"icon"}
              >
                <SunIcon size={14} />
              </Button>
              /
              <Button
                className="my-2 h-6 w-6"
                variant={"outline"}
                size={"icon"}
              >
                <MoonIcon size={14} />
              </Button>
            </div>
          </li>
          <li className="flex items-center justify-between p-2">
            <div className="flex-1 px-2">
              <strong>Horizontal Flip ↔️</strong>
              <p>Adjust horizontal orientation.</p>
            </div>
            <div className="flex items-center justify-end gap-1 min-w-20 p-2">
              <Button
                className="h-6 w-6 my-2"
                variant={"outline"}
                size={"icon"}
                onClick={() => {
                  setMirrored((prev) => !prev);
                }}
                disabled={!isVideoShown}
              >
                <FlipHorizontal size={14} />
              </Button>
            </div>
          </li>
          <Separator />
          <li className="flex items-center justify-between p-2">
            <div className="flex-1 px-2">
              <strong>Take Pictures 📸</strong>
              <p>Capture snapshots at any moment from the video feed.</p>
            </div>
            <div className="flex items-center gap-1 w-20 p-2 justify-end">
              <Button
                className="h-6 w-6 my-2"
                variant={"outline"}
                size={"icon"}
                onClick={userPromptScreenshot}
                disabled={!isVideoShown}
              >
                <Camera size={14} />
              </Button>
            </div>
          </li>
          <li className="flex items-center justify-between p-2">
            <div className="flex-1 px-2">
              <strong>Manual Video Recording 📽️</strong>
              <p>Manually record video clips as needed.</p>
            </div>
            <div className="flex items-center gap-1 w-20 p-2 justify-end">
              <Button
                className="h-6 w-6 my-2"
                variant={isRecording ? "destructive" : "outline"}
                size={"icon"}
                onClick={userPromptRecord}
                disabled={!isVideoShown}
              >
                <Video size={14} />
              </Button>
            </div>
          </li>
          <Separator />
          <li className="flex items-center justify-between p-2">
            <div className="flex-1 px-2">
              <strong>Enable/Disable Auto Record 🚫</strong>
              <p>
                Option to enable/disable automatic video recording whenever
                required.
              </p>
            </div>
            <div className="flex items-center justify-end gap-1 w-20 p-2">
              <Button
                className="h-6 w-6 my-2"
                variant={autoRecordEnabled ? "destructive" : "outline"}
                size={"icon"}
                onClick={toggleAutoRecord}
                disabled={!isVideoShown}
              >
                {autoRecordEnabled ? (
                  <Rings color="white" height={30} />
                ) : (
                  <PersonStanding size={14} />
                )}
              </Button>
            </div>
          </li>

          <li className="px-4 py-2">
            <strong>Volume Slider 🔊</strong>
            <p>Adjust the volume level of the notifications.</p>
          </li>
          <li className="px-4 py-2">
            <strong>Camera Feed Highlighting 🎨</strong>
            <p>
              Highlights persons in{" "}
              <span style={{ color: "#FF0F0F" }}>red</span> and other objects in{" "}
              <span style={{ color: "#00B612" }}>green</span>.
            </p>
          </li>
          <Separator />
          <li className="space-y-4 px-4 py-2">
            <strong>Share your thoughts 💬 </strong>
            <SocialMediaLinks />
            <br />
            <br />
            <br />
          </li>
        </ul>
      </div>
    );
  }
};

export default HomePage;

function resizeCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  webcamRef: React.RefObject<Webcam>
) {
  const canvas = canvasRef.current;
  const video = webcamRef.current?.video;

  if (canvas && video) {
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  }
}
