import { PulsingBorder } from "@paper-design/shaders-react"

export default function PulsingBorderShader({ size = "w-20 h-20", theme = "dark" }) {
  // Mapeo más preciso con valores fijos en píxeles
  const sizeMap = {
    "w-6 h-6": { width: "24px", height: "24px" },
    "w-8 h-8": { width: "32px", height: "32px" },
    "w-10 h-10": { width: "40px", height: "40px" },
    "w-12 h-12": { width: "48px", height: "48px" },
    "w-20 h-20": { width: "80px", height: "80px" },
    "w-48 h-48": { width: "192px", height: "192px" },
    "w-64 h-64": { width: "256px", height: "256px" },
    "w-80 h-80": { width: "320px", height: "320px" }
  }
  
  const dimensions = sizeMap[size] || sizeMap["w-20 h-20"]
  
  return (
    <PulsingBorder
      colors={theme === "dark" 
        ? ["#ffffff", "#E77EDC", "#C800DE", "#BEECFF"]
        : ["#9333EA", "#EC4899", "#8B5CF6", "#BEECFF"]
      }
      colorBack="#00000000"
      speed={1.5}
      roundness={1}
      thickness={theme === "dark" ? 0.05 : 0.05}
      softness={0.1}
      intensity={theme === "dark" ? 2 : 2}
      spotspercolor={4}
      spotSize={0.1}
      pulse={theme === "dark" ? 0.4 : 0.4}
      smoke={0.5}
      smokeSize={2}
      scale={0.65}
      rotation={0}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: "50%",
        aspectRatio: "1 / 1",
        backgroundImage: theme === "dark"
          ? "radial-gradient(circle in oklab, oklab(0% 0 -.0001 / 0%) 25.22%, oklab(25% 0.12 -0.15 / 0.6) 43.89%, oklab(0% 0 -.0001 / 0%) 60.04%)"
          : "radial-gradient(circle in oklab, oklab(0% 0 -.0001 / 0%) 25.22%, oklab(60% 0.3 -0.25 / 0.25) 43.89%, oklab(0% 0 -.0001 / 0%) 60.04%)",
        filter: theme === "dark" ? "none" : "none",
        opacity: theme === "dark" ? 1 : 0.8
      }}
    />
  )
}