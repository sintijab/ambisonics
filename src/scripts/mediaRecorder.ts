/// <reference path="./visualizer.ts" />

export function useOnStop(chunks: Blob[]) {
  var soundClips: Element = document.querySelector(".sound-clips") as Element;

  const clipContainer = document.createElement("article");
  const recordings = document.querySelectorAll(".clip");
  clipContainer.id = `sound_clip-${recordings.length + 1}`;
  const clipLabel = document.createElement("p");
  const audio = document.createElement("audio");
  const deleteButton = document.createElement("button");

  clipContainer.classList.add("clip");
  audio.setAttribute("controls", "");
  deleteButton.textContent = "Delete";
  deleteButton.className = "custom-btn btn-purple";
  clipContainer.appendChild(audio);
  clipContainer.appendChild(clipLabel);
  clipContainer.appendChild(deleteButton);
  soundClips.appendChild(clipContainer);

  audio.controls = true;
  const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
  chunks = [];
  const audioURL = window.URL.createObjectURL(blob);
  audio.src = audioURL;

  deleteButton.onclick = function (e: any) {
    e.target.closest(".clip").remove();
  };
  return { blob };
}
