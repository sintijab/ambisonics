/// <reference types="astro/client" />

interface IMediaRecorderContext {
  audioContext?: AudioContext;
  analyser: any;
  mediaRecorder?: MediaRecorder;
  btnStart?: HTMLButtonElement;
  main_controls?: HTMLDivElement;
  w?: number;
  h?: number;
  center2D: {
    x?: number;
    y?: number;
  };
  context?: CanvasRenderingContext2D;
  imageData: any;
  data?: number[];
  mouseActive: boolean;
  mouseDown: boolean;
  mousePos: {
    x: number;
    y: number;
  };
  fov: number;
  speed: number;
  particles: any[];
  particlesSky: any[];
  particleDistanceTop: number;
  canvas: HTMLCanvasElement;
  record_btn: HTMLDivElement;
  stop_record_btn: HTMLDivElement;
  video: HTMLVideoElement;
  videoIndex: number;
}

window.mrctx = IMediaRecorderContext;

declare module 'https://*'
