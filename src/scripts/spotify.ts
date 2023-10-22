import { fetchSpotify } from "../utils/request";
import { getCookie } from "../utils/cookie";

function toggleRecommendations(e) {
  console.log(e);
  const id = e.target.id;
  const seq = id.split("-");
  const item = document.getElementById(`rec_element_list-${seq[1]}`)!;
  item.toggleAttribute("hidden");
  const link = document.getElementById(`rec_element_link-${seq[1]}`);
  link!.classList.toggle("toggle_indicator");
}

export async function handleSpotify(track: any) {
  try {
    let access_token = getCookie(`access_token`);
    let refresh_token = getCookie(`refresh_token`);
    let authQuery = `access_token=${access_token}&refresh_token=${refresh_token}`;
    // Track search
    const trackProvider = track.hub.providers.find(
      (provider: { type: "SPOTIFY" }) => provider.type === "SPOTIFY",
    );
    const isrc = `isrc%3A${track.isrc}`;
    const trackaActions = trackProvider.actions.find(
      (action: { type: "uri" }) => action.type === "uri",
    );
    const trackUri = trackaActions.uri.replace("spotify:search:", "");
    let trackInfo = await fetchSpotify(
      `api/search?${authQuery}&q=${trackUri}%2520${track.isrc ? isrc : ""}`,
    );
    if (!trackInfo) {
      await fetchSpotify(
        `api/search?${authQuery}&q=${trackUri}%2520${track.isrc ? isrc : ""}`,
      );
    }
    // Track details
    const {
      tracks: { items },
    } = trackInfo;
    const trackDetails = items.find((item: { name: string }) =>
      track.title.includes(item.name),
    );
    const trackId = trackDetails?.id;
    if (trackId) {
      let trackFeatures = await fetchSpotify(
        `api/features?${authQuery}&track_id=${trackId}`,
      );
      if (!trackFeatures) {
        trackFeatures = await fetchSpotify(
          `api/features?${authQuery}&track_id=${trackId}`,
        );
      }
      const link = document.createElement("a");
      link.href = `https://open.spotify.com/track/${trackId}`;
      link.target = "_blank";
      link.className = "link_button";
      link.textContent = `${track.sections?.[0]?.metadata?.[0].text},  ${track.subtitle}, ${track.genres.primary}`;
      const title = document.createElement("p");
      title.appendChild(link);
      const recordings = document.querySelectorAll(".clip");
      const clipContainer: HTMLElement = document.getElementById(
        `sound_clip-${recordings.length}`,
      ) as HTMLElement;
      clipContainer.appendChild(title);
      // Recommendations
      const descr_wrapper = document.createElement("div");
      const description = document.createElement("p");
      description.id = `rec_element_link-${recordings.length}`;
      description.textContent = "Other similar tracks";
      description.className = "link_button toggle_indicator-closed";
      description.addEventListener("mousedown", toggleRecommendations);
      descr_wrapper.appendChild(description);
      clipContainer.appendChild(descr_wrapper);
      let seed_artists = trackDetails.artists.map((artist: any) => artist.id);
      seed_artists = seed_artists.join(",");
      const seed_genres = track.genres.primary;
      const seed_tracks = trackId;
      let recommendations = await fetchSpotify(
        `api/recommendations?${authQuery}&seed_artists=${seed_artists}&seed_genres=${seed_genres}&seed_tracks=${seed_tracks}`,
      );
      if (!recommendations) {
        recommendations = await fetchSpotify(
          `api/recommendations?${authQuery}&seed_artists=${seed_artists}&seed_genres=${seed_genres}&seed_tracks=${seed_tracks}`,
        );
      }
      const rec_element_list = document.createElement("ul");
      rec_element_list.id = `rec_element_list-${recordings.length}`;
      rec_element_list.className = "rec_list";
      recommendations.tracks.forEach((rec_track: any) => {
        const artists = rec_track?.artists?.map((artist) => artist.name);
        const rec_element_item = document.createElement("li");
        const rec_element = document.createElement("a");
        rec_element.textContent = `${rec_track?.name} - ${artists.join(", ")}`;
        rec_element.target = "_blank";
        rec_element.href = rec_track?.external_urls?.spotify;
        rec_element_item.appendChild(rec_element);
        rec_element_list.appendChild(rec_element_item);
      });
      rec_element_list.hidden = true;

      clipContainer.appendChild(rec_element_list);
    }
  } catch (e) {
    console.log(e);
  }
}
