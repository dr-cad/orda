export default function Background() {
  return (
    <video className="bg-video" loop autoPlay muted playsInline>
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>
  );
}
