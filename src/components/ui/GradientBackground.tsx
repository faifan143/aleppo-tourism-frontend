// In GradientBackground
const GradientBackground = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
    <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none" />
  </div>
);
export default GradientBackground;
