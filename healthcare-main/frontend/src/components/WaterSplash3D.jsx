import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WaterSplash3D({ onComplete }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = window.innerWidth
    const height = window.innerHeight

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a1929, 0.002)

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 5, 15)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0x4facfe, 1.5)
    mainLight.position.set(5, 10, 5)
    mainLight.castShadow = true
    scene.add(mainLight)

    const blueGlow = new THREE.PointLight(0x00f2fe, 2, 50)
    blueGlow.position.set(0, 5, 0)
    scene.add(blueGlow)

    const cyanGlow = new THREE.PointLight(0x43e97b, 1.5, 30)
    cyanGlow.position.set(-5, 3, 5)
    scene.add(cyanGlow)

    // Water base plane
    const waterGeometry = new THREE.CircleGeometry(12, 64)
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a73e8,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
      specular: 0x4facfe,
    })
    const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial)
    waterPlane.rotation.x = -Math.PI / 2
    waterPlane.position.y = -2
    waterPlane.receiveShadow = true
    scene.add(waterPlane)

    // Splash particles
    const particleCount = 300
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const colors = new Float32Array(particleCount * 3)

    const colorPalette = [
      new THREE.Color(0x4facfe),
      new THREE.Color(0x00f2fe),
      new THREE.Color(0x43e97b),
      new THREE.Color(0x38f9d7),
      new THREE.Color(0x1a73e8),
    ]

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = 0
      positions[i3 + 1] = 0
      positions[i3 + 2] = 0

      const speed = 0.15 + Math.random() * 0.35
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.6

      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed
      velocities[i3 + 1] = Math.cos(phi) * speed * 1.5 + 0.2
      velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed

      sizes[i] = 0.1 + Math.random() * 0.3

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // Droplet meshes for larger splashes
    const dropletCount = 50
    const droplets = []
    const dropletGeometry = new THREE.SphereGeometry(0.15, 8, 8)
    const dropletMaterial = new THREE.MeshPhongMaterial({
      color: 0x4facfe,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    })

    for (let i = 0; i < dropletCount; i++) {
      const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial.clone())
      const speed = 0.2 + Math.random() * 0.4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.7

      droplet.userData.velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed * 2,
        Math.sin(phi) * Math.sin(theta) * speed
      )
      droplet.userData.life = 1.0
      droplet.position.set(0, 0, 0)
      droplet.scale.setScalar(0.5 + Math.random() * 1.5)
      droplet.visible = false
      scene.add(droplet)
      droplets.push(droplet)
    }

    // Ripple rings
    const ringCount = 8
    const rings = []
    for (let i = 0; i < ringCount; i++) {
      const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x4facfe,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = -1.9
      ring.userData.delay = i * 0.15
      ring.userData.maxRadius = 8 + i * 1.5
      ring.visible = false
      scene.add(ring)
      rings.push(ring)
    }

    // Animation state
    let startTime = Date.now()
    const duration = 2500 // 2.5 seconds
    let screenShake = { x: 0, y: 0 }
    let splashPhase = 0

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      // Screen shake
      if (progress < 0.3) {
        const shakeIntensity = (0.3 - progress) / 0.3 * 0.5
        screenShake.x = (Math.random() - 0.5) * shakeIntensity
        screenShake.y = (Math.random() - 0.5) * shakeIntensity
      } else {
        screenShake.x *= 0.9
        screenShake.y *= 0.9
      }
      camera.position.x = screenShake.x
      camera.position.y = 5 + screenShake.y

      // Update particles
      const positions = particles.geometry.attributes.position.array
      const sizes = particles.geometry.attributes.size.array
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const particleProgress = Math.min(elapsed / (1500 + Math.random() * 1000), 1)

        if (particleProgress < 1) {
          positions[i3] += velocities[i3] * 0.3
          positions[i3 + 1] += velocities[i3 + 1] * 0.3 - 0.01
          positions[i3 + 2] += velocities[i3 + 2] * 0.3
          velocities[i3 + 1] -= 0.008

          sizes[i] = Math.max(0, (0.1 + Math.random() * 0.3) * (1 - particleProgress))
        }
      }
      particles.geometry.attributes.position.needsUpdate = true
      particles.geometry.attributes.size.needsUpdate = true
      particles.material.opacity = Math.max(0, 1 - progress * 1.5)

      // Update droplets
      droplets.forEach((droplet, i) => {
        if (elapsed > i * 30) {
          droplet.visible = true
          const v = droplet.userData.velocity
          droplet.position.x += v.x * 0.2
          droplet.position.y += v.y * 0.2 - 0.01
          droplet.position.z += v.z * 0.2
          v.y -= 0.01

          droplet.userData.life -= 0.015
          droplet.material.opacity = Math.max(0, droplet.userData.life)
          droplet.scale.multiplyScalar(0.995)
        }
      })

      // Update ripple rings
      rings.forEach((ring, i) => {
        const ringTime = elapsed - ring.userData.delay * 1000
        if (ringTime > 0 && ringTime < 2000) {
          ring.visible = true
          const ringProgress = ringTime / 2000
          const scale = ring.userData.maxRadius * ringProgress
          ring.scale.set(scale, scale, scale)
          ring.material.opacity = 0.8 * (1 - ringProgress)
        }
      })

      // Water plane animation
      waterPlane.material.opacity = 0.6 * (1 - progress * 0.8)
      waterPlane.scale.setScalar(1 + eased * 0.3)

      // Blue glow pulse
      blueGlow.intensity = 2 * (1 - progress)
      cyanGlow.intensity = 1.5 * (1 - progress)

      renderer.render(scene, camera)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Cleanup
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
        if (onComplete) onComplete()
      }
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(10,25,41,0.4) 0%, rgba(10,25,41,0.8) 100%)',
      }}
    >
      {/* Goal Completed Text */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 100000,
          animation: 'goalFloat 2.8s ease-out forwards',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: '0 0 40px rgba(79,172,254,0.8), 0 0 80px rgba(0,242,254,0.6)',
            letterSpacing: '2px',
            marginBottom: '10px',
          }}
        >
          Goal Completed 🎉
        </div>
        <div
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '500',
          }}
        >
          Amazing hydration work!
        </div>
      </div>

      {/* Floating Bubbles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${10 + Math.random() * 20}px`,
            height: `${10 + Math.random() * 20}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, rgba(79,172,254,0.6), rgba(0,242,254,0.3))`,
            left: `${Math.random() * 100}%`,
            top: `${60 + Math.random() * 40}%`,
            animation: `bubbleFloat 2.5s ease-out ${Math.random() * 1}s forwards`,
            boxShadow: '0 0 10px rgba(79,172,254,0.4)',
          }}
        />
      ))}

      <style>{`
        @keyframes goalFloat {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) translateY(20px);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1) translateY(0);
          }
          30% {
            transform: translate(-50%, -50%) scale(1) translateY(0);
          }
          80% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9) translateY(-40px);
          }
        }
        @keyframes bubbleFloat {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          20% {
            opacity: 0.8;
            transform: translateY(-30px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-150px) scale(0.3);
          }
        }
      `}</style>
    </div>
  )
}
