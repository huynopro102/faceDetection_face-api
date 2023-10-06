const video = document.getElementById("video");

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam);


async function startWebcam() {
  alert("đã tải các mô hình, bắt đầu khởi động camera");
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  })
    .then(  async (stream) => {
      video.srcObject = stream;
     const a = await faceapi.detectSingeFace(video)
    if(a != undefined){
      console.log("Điểm số:"+ a.score);
      console.log("Hộp giới hạn:"+ a.box);
      console.log(detections);
    }
    })
    .catch((error) => {
      alert("lỗi", error);
    })
    .finally(()=>{
      alert("finally")
    })
}

function getLabeledFaceDescriptions() {
  const labels = ["Felipe", "Messi", "ronaldo"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 3; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
          if (detections.length > 0) {
            alert("nhan dien")
          } else {
            console.log("Không tìm thấy khuôn mặt.");
          }
        descriptions.push(detections.descriptor);
        console.log("mang thong tin"+descriptions[0])
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  alert("load thanh cong")
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

     setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });
      drawBox.draw(canvas);
    });
  }, 100);
});
