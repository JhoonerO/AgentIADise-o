import { PulsingBorder } from "@paper-design/shaders-react"

export default function PulsingBorderShader({ size = "w-20 h-20" }) {
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
      colors={["#5800FF", "#E77EDC", "#C800DE", "#BEECFF"]}
      colorBack="#00000000"
      speed={1.5}
      roundness={1}
      thickness={0.05}
      softness={0.1}
      intensity={1}
      spotsPerColor={5}
      spotSize={0.1}
      pulse={0.2}
      smoke={0.5}
      smokeSize={2}
      scale={0.65}
      rotation={0}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: "50%", // Forzar círculo perfecto
        aspectRatio: "1 / 1", // Mantener aspecto cuadrado
        backgroundImage: "radial-gradient(circle in oklab, oklab(0% 0 -.0001 / 0%) 25.22%, oklab(30.5% 0.029 -0.184) 43.89%, oklab(0% 0 -.0001 / 0%) 60.04%)"
      }}
    />
  )
}