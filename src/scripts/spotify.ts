import { fetchSpotify } from "../utils/request";
import { getCookie } from "../utils/cookie";

function toggleRecommendations(e: any) {
  const id = e.target!.id;
  const seq = id.split("-");
  const item = document.getElementById(`rec_element_list-${seq[1]}`)!;
  item.toggleAttribute("hidden");
  const link = document.getElementById(`rec_element_link-${seq[1]}`);
  link!.classList.toggle("toggle_indicator");
}

export async function handleSpotify(track: any) {
  try {
    // Details
    const recordings = document.querySelectorAll(".clip");
    const clipContainer: HTMLElement = document.getElementById(
      `sound_clip-${recordings.length}`,
    ) as HTMLElement;
    const title = document.createElement("div");
    const track_title = document.createElement("p");
    track_title.className = "link_button link_button_text";
    track_title.textContent = `${track.sections?.[0]?.metadata?.[0].text}`;
    title.appendChild(track_title);
    const track_description = document.createElement("p");
    track_description.textContent = `${track.subtitle}`;
    track_description.className = "link_button link_button_text";
    title.appendChild(track_description);
    clipContainer.appendChild(title);
    // Auth
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
      let updated_token = getCookie(`access_token`);
      let updated_authQuery = `access_token=${updated_token}&refresh_token=${refresh_token}`;
      trackInfo = await fetchSpotify(
        `api/search?${updated_authQuery}&q=${trackUri}%2520${track.isrc ? isrc : ""}`,
      );
    }
    // Track details
    let trackDetails = trackInfo.tracks.items.find((item: { name: string }) =>
      track.title.includes(item.name)
    );
    if (!trackDetails) {
      // Track not found by isrc
      trackInfo = await fetchSpotify(
        `api/search?${authQuery}&q=${trackUri}`,
      );
      if (!trackInfo) {
        let updated_token = getCookie(`access_token`);
        let updated_authQuery = `access_token=${updated_token}&refresh_token=${refresh_token}`;
        trackInfo = await fetchSpotify(
          `api/search?${updated_authQuery}&q=${trackUri}`,
        );
      }
    }
    trackDetails = trackInfo.tracks.items.find((item: { name: string }) =>
      track.title.includes(item.name)
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
      const logo_link = document.createElement("a");
      logo_link.href = `https://open.spotify.com/track/${trackId}`;
      logo_link.target = "_blank";
      logo_link.className = "link_button link_button_img";
      const image = new Image();
      image.src = 'images/spotify_icon.png';
      image.height = 30;
      logo_link.textContent = 'Open Spotify';
      const title_spotify = document.createElement("p");
      title_spotify.className = 'title_spotify';
      title_spotify.appendChild(image);
      title_spotify.appendChild(logo_link);
      clipContainer.appendChild(title_spotify);
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
      let seed_genres = track?.genres?.primary;
      seed_genres = seed_genres ? encodeURI(seed_genres) : '';
      const seed_tracks = trackId;
      let recommendations = await fetchSpotify(
        `api/recommendations?${authQuery}&seed_artists=${seed_artists}${seed_genres ? '&seed_genres=' + seed_genres : ''}&seed_tracks=${seed_tracks}`,
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
        const artists = rec_track?.artists?.map((artist: any) => artist.name);
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
