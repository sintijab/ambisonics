import { useOnStop } from "./mediaRecorder";
import { handleSpotify } from "./spotify";
import { mrctx } from "../utils/global";
import { getCookie } from "../utils/cookie";
var {
  audioContext,
  analyser,
  mediaRecorder,
  btnStart,
  main_controls,
  w,
  h,
  center2D,
  context,
  imageData,
  data,
  mouseActive,
  mouseDown,
  mousePos,
  fov,
  speed,
  particles,
  particlesSky,
  particleDistanceTop,
  canvas,
  record_btn,
  stop_record_btn,
  video,
  videoIndex,
} = mrctx;

function init() {
  if (navigator.mediaDevices.getUserMedia) {
    const constraints = { audio: true };
    let chunks: Blob[] = [];

    let onSuccess = function (stream: any) {
      mediaRecorder = new MediaRecorder(stream);
      audioSetup(stream);

      mediaRecorder!.onstop = async function (e) {
        const { blob } = useOnStop(chunks);
        const audioFile = new File([blob], "voice.wav", { type: "audio/wav" });
        chunks = [];
        const data = new FormData();
        data.append("upload_file", audioFile);
        try {
          const pw = getCookie("basic_auth_pw");
          let headers = new Headers();
          let username = "user";
          headers.set("Authorization", "Basic " + btoa(username + ":" + pw));
          const response = await fetch("api/discover", {
            method: "POST",
            body: data,
            headers
          });
          const res = await response.json();
          const { track, matches } = res.result;
          if (matches.length) {
            handleSpotify(track);
          } else {
            const recordings = document.querySelectorAll(".clip");
            const clipContainer: HTMLElement = document.getElementById(
              `sound_clip-${recordings.length}`,
            ) as HTMLElement;
            const title = document.createElement("p");
            title.className = "results_title";
            title.textContent = 'No results, try recording longer';
            clipContainer.appendChild(title);
          }
        } catch (error) {
          console.error(error);
        }
      };
      mediaRecorder!.ondataavailable = function (e) {
        chunks.push(e.data);
      };
    };

    let onError = function (err: any) {
      console.log("The following error occured: " + err);
    };

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  } else {
    console.log("getUserMedia not supported on your browser!");
  }

  record_btn.addEventListener("mousedown", mouseDownHandlerStart, false);
  stop_record_btn.addEventListener("mousedown", mouseDownHandlerStop, false);
  canvas.addEventListener("mousemove", mouseMoveHandler, false);
  canvas.addEventListener("mouseenter", mouseEnterHandler, false);
  canvas.addEventListener("mouseleave", mouseLeaveHandler, false);

  document.body.appendChild(canvas);

  context = canvas.getContext("2d") as CanvasRenderingContext2D;

  window.addEventListener("resize", onResize);

  onResize();

  addParticles(particles, 1);
  addParticles(particlesSky, -1);

  render();

  context.putImageData(imageData, 0, 0);
}

function audioSetup(stream: MediaStream) {
  // @ts-ignore
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);

  analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = 0.75;
  analyser.fftSize = 512 * 32;
  source.connect(analyser);
  // analyser.connect(audioContext.destination);
}

function clearImageData() {
  for (var i = 0, l = data!.length; i < l; i += 4) {
    data![i + 4] = 180;
    data![i + 3] = 180;
    data!![i + 2] = 180;
    data![i + 1] = 180;
  }
}

function setPixel(
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
) {
  var i = (x + y * imageData.width) * 4;

  // data[i] = r;
  // data[i + 1] = g;
  // data[i + 2] = b;
  // data[i + 3] = a;
  data![i + 2] = r;
  data![i + 1] = g;
  data![i + 2] = b;
  data![i + 1] = a;

  // data[i + 4] = r;
  // data[i + 1] = g;
  // data[i + 4] = b;
  // data[i + 3] = a;

  // data[i + 3] = r;
  // data[i + 4] = g;
  // data[i + 2] = b;
  // data[i + 3] = a;

  // data[i + 1] = r;
  // data[i + 6] = g;
  // data[i + 1] = b;
  // data[i + 2] = a;

  // data[i + 2] = r;
  // data[i + 2] = g;
  // data[i + 2] = b;
  // data[i + 3] = a;
}

function drawLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
  g: number,
  b: number,
  a: number,
) {
  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);

  var sx = x1 < x2 ? 1 : -1;
  var sy = y1 < y2 ? 1 : -1;

  var err = dx - dy;

  var lx = x1;
  var ly = y1;

  while (true) {
    if (lx > 0 && lx < w! && ly > 0 && ly < h!) {
      setPixel(lx, ly, r, g, b, a);
    }

    if (lx === x2 && ly === y2) {
      break;
    }

    var e2 = 2 * err;

    if (e2 > -dx) {
      err -= dy;
      lx += sx;
    }

    if (e2 < dy) {
      err += dx;
      ly += sy;
    }
  }
}

interface IParticle {
  x?: number;
  y?: number;
  z?: number;
  x2d?: number;
  y2d?: number;
  index?: number;
}

function addParticle(x: number, y: number, z: number, index: number) {
  var particle: IParticle = {};
  particle.x = x;
  particle.y = y;
  particle.z = z;
  particle.x2d = 0;
  particle.y2d = 0;
  particle.index = index;

  return particle;
}

function addParticles(array: any[], dir: number) {
  var audioBufferIndexMin = 8;
  var audioBufferIndexMax = 512;
  var audioBufferIndex = audioBufferIndexMin;

  for (var z = -fov; z < fov; z += 5) {
    var particlesRow: IParticle[] = [];

    for (var x = -fov; x < fov; x += 5) {
      var yPos = 0;

      if (dir > 0) {
        yPos = Math.random() * 5 + particleDistanceTop;
      } else {
        yPos = Math.random() * 5 - particleDistanceTop;
      }

      var particle = addParticle(x, yPos, z, audioBufferIndex);

      particlesRow.push(particle);

      audioBufferIndex++;

      if (audioBufferIndex > audioBufferIndexMax) {
        audioBufferIndex = audioBufferIndexMin;
      }
    }

    array.push(particlesRow);
  }
}

function onResize() {
  w =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  center2D = { x: w / 2, y: h / 2 };

  canvas.width = w;
  canvas.height = h;

  // context.fillStyle = '#000000';
  context!.fillRect(0, 0, w, h);

  imageData = context!.getImageData(0, 0, w, h) as ImageData;
  data = imageData.data;
}

function mouseDownHandlerStart() {
  if (mediaRecorder!.state === "inactive") {
    mediaRecorder!.start();
    record_btn.style.display = "none";
    stop_record_btn.style.display = "flex";
  }
}
function mouseDownHandlerStop() {
  if (mediaRecorder!.state !== "inactive") {
    mediaRecorder!.stop();
    record_btn.style.display = "flex";
    stop_record_btn.style.display = "none";
  }
}

function mouseEnterHandler() {
  mouseActive = true;
}

function mouseLeaveHandler() {
  mouseActive = false;

  mousePos.x = w! / 2;

  mouseDown = false;
}

function mouseMoveHandler(event: MouseEvent) {
  mousePos = getMousePos(canvas, event);
}

function getMousePos(canvas: HTMLCanvasElement, event: MouseEvent) {
  var rect = canvas.getBoundingClientRect();

  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function render() {
  var frequencySource;

  if (analyser) {
    frequencySource = new Uint8Array(analyser.frequencyBinCount);

    analyser.getByteFrequencyData(frequencySource);
  }

  var sortArray = false;

  for (var i = 0, l = particles.length; i < l; i++) {
    var particlesRow = particles[i];
    var particlesRowBack;

    if (i > 0) {
      particlesRowBack = particles[i - 1];
    }

    for (var j = 0, k = particlesRow.length; j < k; j++) {
      var particle = particlesRow[j];

      var scale = fov / (fov + particle.z);

      particle.x2d = particle.x * scale + center2D.x!;
      particle.y2d = particle.y * scale + center2D.y!;

      particle.z -= speed;

      if (analyser) {
        var frequency = (frequencySource as Uint8Array)[particle.index];
        var frequencyAdd = frequency / 10;

        particle.y = frequencyAdd + particleDistanceTop;
      }

      if (particle.z < -fov) {
        particle.z += fov * 2;

        sortArray = true;
      }

      var lineColorValue;

      if (j > 0) {
        var p = particlesRow[j - 1];

        lineColorValue = Math.round((i / l) * 155); //255
        drawLine(
          particle.x2d | 0,
          particle.y2d | 0,
          p.x2d | 0,
          p.y2d | 0,
          0,
          lineColorValue,
          0,
          255,
        );
      }

      if (i > 0 && i < l - 1) {
        var pB = particlesRowBack[j];
        drawLine(
          particle.x2d | 0,
          particle.y2d | 0,
          pB.x2d | 0,
          pB.y2d | 0,
          0,
          lineColorValue as number,
          0,
          255,
        );
      }
    }
  }

  if (sortArray) {
    particles = particles.sort(function (a, b) {
      //return ( b[ 0 ].z === a[ 0 ].z ? 0 : ( b[ 0 ].z < a[ 0 ].z ? -1 : 1 ) );
      return b[0].z - a[0].z;
    });
  }

  for (var i = 0, l = particlesSky.length; i < l; i++) {
    var particlesRow = particlesSky[i];
    var particlesRowBack;

    if (i > 0) {
      particlesRowBack = particlesSky[i - 1];
    }

    for (var j = 0, k = particlesRow.length; j < k; j++) {
      var particle = particlesRow[j];

      var scale = fov / (fov + particle.z);

      particle.x2d = particle.x * scale + center2D.x!;
      particle.y2d = particle.y * scale + center2D.y!;

      particle.z -= speed;

      if (analyser) {
        var frequency = (frequencySource as Uint8Array)[particle.index];
        var frequencyAdd = frequency / 10; //circle.frequencyFactor;

        particle.y = -frequencyAdd - particleDistanceTop;
      }

      if (particle.z < -fov) {
        particle.z += fov * 2;

        sortArray = true;
      }

      var lineColorValue;

      if (j > 0) {
        var p = particlesRow[j - 1];

        lineColorValue = Math.round((i / l) * 255);

        drawLine(
          particle.x2d | 0,
          particle.y2d | 0,
          p.x2d | 0,
          p.y2d | 0,
          0,
          Math.round(lineColorValue / 2),
          lineColorValue,
          255,
        );
      }

      if (i > 0 && i < l - 1) {
        var pB = particlesRowBack[j];

        // v1 = { x:particle.x2d | 0, y:particle.y2d | 0 };
        // v2 = { x:pB.x2d | 0, y:pB.y2d | 0 };

        //var lineColorValue = Math.round( ( ( i - ( fov / 5 ) ) / l ) * 255 );

        //drawLine( v1, v2, lineColorValue, lineColorValue, lineColorValue, 255 );
        drawLine(
          particle.x2d | 0,
          particle.y2d | 0,
          pB.x2d | 0,
          pB.y2d | 0,
          0,
          Math.round((lineColorValue as number) / 2),
          lineColorValue as number,
          255,
        );
      }
    }
  }

  if (sortArray) {
    particlesSky = particlesSky.sort(function (a, b) {
      return b[0].z - a[0].z;
    });
  }

  if (mouseActive) {
    center2D.x! += (mousePos.x - center2D.x!) * 0.015;
  } else {
    center2D.x! += (canvas.width / 2 - center2D.x!) * 0.015;
  }
}

function animate() {
  clearImageData();

  render();

  context!.putImageData(imageData, 0, 0);
  requestAnimationFrame(animate);
}

function videoSyling() {
  if (video.currentTime > video.duration - 2) {
    video.style.opacity = "0";
  } else if (video.currentTime > 0) {
    video.style.opacity = "1";
  }
}

function videoController() {
  const nextVideoIndex = videoIndex > 7 ? 1 : videoIndex + 1;
  video.setAttribute("src", `/images/0${nextVideoIndex}.mp4`);
  video.play();
  videoIndex++;
}

video.addEventListener("ended", videoController, false);
video.addEventListener("timeupdate", videoSyling, false);

function userStart() {
  init();
  video.style.opacity = "1";
  (video as HTMLVideoElement).play();
  btnStart!.removeEventListener("mousedown", userStart);
  const controls = document.querySelector(".controls") as HTMLDivElement;

  controls.style.display = "flex";
  record_btn.style.display = "flex";
  main_controls!.style.display = "none";

  animate();
}

// @ts-ignore
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    // @ts-ignore
    window.webkitRequestAnimationFrame ||
    // @ts-ignore
    window.mozRequestAnimationFrame ||
    // @ts-ignore
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

btnStart = document.getElementById("startStereogram") as HTMLButtonElement;
main_controls = document.getElementById("main_controls") as HTMLDivElement;
btnStart.addEventListener("mousedown", userStart, false);
