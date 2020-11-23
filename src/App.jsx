import React, { useState, useEffect } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg();

function App() {

  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [progress, setProgress] = useState(1);
  const [progressMessage, setProgressMessage] = useState(1);

  const load = async () => {
    await ffmpeg.load();
    setFfmpegLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const convertVidToGif = async () => {
    setGif();

    ffmpeg.FS('writeFile', 'video-in-memory', await fetchFile(video));

    await ffmpeg.run('-i', 'video-in-memory', '-t', '2.5', '-ss', '2.0', '-f', 'gif', 'out.gif');

    const data = ffmpeg.FS('readFile', 'out.gif');

    const url = URL.createObjectURL(new Blob([data.buffer], {type: 'image/gif'}));

    setGif(url);
  }

  ffmpeg.setLogger(({ type, message }) => {
    setProgressMessage(message)
  });
  
  ffmpeg.setProgress(({ ratio }) => {
    setProgress(ratio)
  });

  return ffmpegLoaded ? (
    <div className="App">
    <video autoPlay muted id="myVideo">
      <source src="background.mov" type="video/mp4"></source>
    </video>

    <main className="content">

    <div id="mission-control" style={{display: (progress >= 1) ? 'block' : 'none'}}>
    <h4>Convert Video to Gif with Web Assembly</h4>
      { video && <video
                    controls
                    width="500"
                    src={URL.createObjectURL(video)}>
                 </video>
      }
      <br/>

      <div class="upload-btn-wrapper">
        <button class="btn">Upload a file</button>
        <input onChange={(e) => setVideo(e.target.files?.item(0))} id="file-selector" type="file" name="myfile" />
      </div>

      <br/>
      <br/>
      
      {video && <button id="convert-button" onClick={convertVidToGif}>Convert</button>}
    </div>

      <div className="progress-bar" style={{display: (progress < 1) ? 'block' : 'none'}}>
        <h3>One Moment. Processing...</h3>
        <div className="progress">{progressMessage}</div>
      </div><br/>


      { gif && [
              <a id="click-to-download" href={gif} download>
                <h3>Click To Download</h3>,
                <img width="500" src={gif} />
              </a>
              ] }
      </main>
    </div>
  ) :
  (<p>Loading...</p>);
}

export default App;
