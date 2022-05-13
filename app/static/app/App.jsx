function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const useVideoPlayer = (videoElement) => {
  const [playerState, setPlayerState] = React.useState({
    isPlaying: false,
    progress: 0,
    speed: 1,
    isMuted: false,
  });

  const togglePlay = () => {
    setPlayerState({
      ...playerState,
      isPlaying: !playerState.isPlaying,
    });
  };

  React.useEffect(() => {
    playerState.isPlaying ? videoElement.current.play() : videoElement.current.pause();
  }, [playerState.isPlaying, videoElement]);

  const handleOnTimeUpdate = () => {
    const progress = videoElement.current.currentTime;
    setPlayerState({
      ...playerState,
      progress,
    });
  };

  const handleVideoProgress = (event) => {
    const manualChange = Number(event.target.value);
    videoElement.current.currentTime = (videoElement.current.duration / 100) * manualChange;
    setPlayerState({
      ...playerState,
      progress: manualChange,
    });
  };

  const handleVideoSpeed = (event) => {
    const speed = Number(event.target.value);
    videoElement.current.playbackRate = speed;
    setPlayerState({
      ...playerState,
      speed,
    });
  };

  const toggleMute = () => {
    setPlayerState({
      ...playerState,
      isMuted: !playerState.isMuted,
    });
  };

  React.useEffect(() => {
    playerState.isMuted
      ? (videoElement.current.muted = true)
      : (videoElement.current.muted = false);
  }, [playerState.isMuted, videoElement]);

  return {
    playerState,
    togglePlay,
    handleOnTimeUpdate,
    handleVideoProgress,
    handleVideoSpeed,
    toggleMute,
  };
};

function Video({ url, file }) {
  const videoElement = React.useRef(null);
  const { playerState, handleOnTimeUpdate } = useVideoPlayer(videoElement);

  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const upload = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("start", start);
    formData.append("end", end);
    formData.append("video", file);
    try {
      const response = await fetch("/blur/", {
        method: "POST",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: formData,
      });
      if (response.ok) {
        const blobUrl = URL.createObjectURL(await response.blob());
        const new_tab = window.open();
        new_tab.location.href = blobUrl;
        return;
      }
      alert(`error ${response.status}`);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <video
          onTimeUpdate={handleOnTimeUpdate}
          src={url}
          ref={videoElement}
          width="750"
          height="500"
          controls
        />
      </div>
      <div>{JSON.stringify(playerState)}</div>
      <div>Start: {start === null ? "not set" : start} </div>
      <div>End: {end === null ? "not set" : end}</div>
      <button onClick={() => setStart(playerState.progress)}>Set start</button>
      <button onClick={() => setEnd(playerState.progress)}>Set end</button>
      <button onClick={upload} disabled={loading}>
        Upload
      </button>
    </div>
  );
}

function App() {
  const [file, setFile] = React.useState();
  const [fileUrl, setFileUrl] = React.useState();

  return (
    <div className="App">
      <input
        onChange={(e) => {
          setFileUrl(URL.createObjectURL(e.target.files[0]));
          setFile(e.target.files[0]);
        }}
        type={"file"}
        accept="video/*"
      />
      {file ? <Video url={fileUrl} file={file} /> : null}
    </div>
  );
}

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render(React.createElement(App));
