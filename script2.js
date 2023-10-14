const videoCamera = document.querySelector("#video")

async function loadModels() {
    Promise.all([
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      await faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ])
      .then(() => {
        console.log("load thanh cong cac models")
      })
  }
  function getWebCam() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    })
      .then(function (data) {
        videoCamera.srcObject = data
      })
      .catch((err) => {
        console.log("loi", err)
      })
  }
  getWebCam()
loadModels()

videoCamera.addEventListener("playing", async () => {

  const canvas = faceapi.createCanvasFromMedia(videoCamera )


  document.body.append(canvas)
  const displaySize = {
    width: videoCamera.width,
    height: videoCamera.height
  }
  setInterval(async () => {
    const detection = await faceapi.detectSingleFace(videoCamera , new faceapi.SsdMobilenetv1Options({ minConfidence: 0.89 }) )
    console.log(detection)
      const resizeDetection = faceapi.resizeResults(detection, displaySize)
      canvas.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height)
      faceapi.draw.drawDetections(canvas, resizeDetection)

  }, 10)

})