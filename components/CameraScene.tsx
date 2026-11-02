'use client'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Sparkles, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MODEL_URL } from '../lib/site'

export type Progress = { current: number }

// ── Model-space constants (measured from the uploaded GLB) ──
const S = 0.011                                   // model units → scene units
const PIVOT = new THREE.Vector3(6.4, -72, 40)     // visual centre of body + lens
const EYE = new THREE.Vector3(6.5, -22.5, -15)    // rear viewfinder window ("ViewPort_LP")
const EYE_LOCAL = EYE.clone().sub(PIVOT).multiplyScalar(S)
const LENS_NODES = ['Lence_LP', 'LensInside_LP', 'Iris_LP']
const KNOBS: [string, number][] = [['Knop1_LP_Device_0', 5], ['Knop5_LP_Device_0', -7], ['Knop4_LP_Device_0', 3]]

function ease(t: number): number {
  return t * t * (3 - 2 * t)
}

function seg(p: number, a: number, b: number): number {
  const t = THREE.MathUtils.clamp((p - a) / (b - a), 0, 1)
  return ease(t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function Camera({ progress, mobile }: { progress: Progress; mobile: boolean }) {
  const { scene } = useGLTF(MODEL_URL)
  const group = useRef<THREE.Group>(null!)
    const fill = useRef<THREE.DirectionalLight>(null!)
  const smooth = useRef(0)
  const v = useMemo(
    () => ({
      eye: new THREE.Vector3(),
      n: new THREE.Vector3(),
      orbit: new THREE.Vector3(),
      look: new THREE.Vector3(),
      end: new THREE.Vector3(),
    }),
    []
  )
  const lens = useRef<{ o: THREE.Object3D; base: THREE.Vector3; dir: THREE.Vector3 }[]>([])
  const knobs = useRef<{ o: THREE.Object3D; k: number }[]>([])

  useEffect(() => {
    scene.updateMatrixWorld(true)
    lens.current = LENS_NODES.map((n) => scene.getObjectByName(n))
      .filter(Boolean)
      .map((o) => {
        const q = new THREE.Quaternion()
        o!.parent!.getWorldQuaternion(q)
        // lens axis = +Z in model space → convert to the node's parent space
        return { o: o!, base: o!.position.clone(), dir: new THREE.Vector3(0, 0, 1).applyQuaternion(q.invert()) }
      })
    knobs.current = KNOBS.map(([n, k]) => ({ o: scene.getObjectByName(n)!, k })).filter((x) => x.o)
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mat = m.material as THREE.MeshStandardMaterial
      mat.envMapIntensity = 1.6
      ;[mat.map, mat.metalnessMap, mat.roughnessMap].forEach((t) => {
        if (t) t.anisotropy = mobile ? 4 : 8
      })
    })
  }, [scene, mobile])

  useFrame(({ camera }, dt) => {
    // Extra damping on top of GSAP's scrub = silky, filmic motion
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, 4.5, Math.min(dt, 0.05))
    const p = smooth.current
    const g = group.current

    // 1 · rotate a full 360° and on to the back (540°)
    g.rotation.y = seg(p, 0.08, 0.8) * Math.PI * 3
    g.rotation.x = Math.sin(seg(p, 0.05, 0.8) * Math.PI) * 0.12
    g.rotation.z = Math.sin(seg(p, 0.05, 0.8) * Math.PI * 2) * 0.03
    g.updateMatrixWorld()

    // 2 · the lens barrel racks out, then retracts; dials turn with the scroll
    const ext = 16 * seg(p, 0.22, 0.42) - 16 * seg(p, 0.52, 0.72)
    lens.current.forEach(({ o, base, dir }) => o.position.copy(base).addScaledVector(dir, ext))
    knobs.current.forEach(({ o, k }) => {
      o.rotation.z = p * k * Math.PI * 2
    })

    // 3 · dolly in from a tiny distant object to a hero close-up
    const far = mobile ? 20 : 14
    const near = mobile ? 7.6 : 5.6
    const d = lerp(far, near, seg(p, 0, 0.6))
    v.orbit.set(Math.sin(p * 2) * 0.25, lerp(0.7, 0.2, seg(p, 0, 0.5)), d)
    v.look.set(0, 0, 0)

    // 4 · push through the real eyepiece
    const t = seg(p, 0.82, 0.97)
    v.eye.copy(EYE_LOCAL)
    g.localToWorld(v.eye)
    v.n.set(0, 0, -1).applyQuaternion(g.quaternion)
    v.end.copy(v.eye).addScaledVector(v.n, mobile ? 0.34 : 0.26)
    camera.position.copy(v.orbit.lerp(v.end, t))
    camera.lookAt(v.look.lerp(v.eye, t))
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = lerp(mobile ? 38 : 30, 34, t)
    cam.updateProjectionMatrix()

    // warm light that follows the camera, brightening only for the rear close-up
          fill.current.position.copy(camera.position).add(new THREE.Vector3(1.5, 1.2, 1))
    fill.current.intensity = lerp(0, 1.3, seg(p, 0.6, 0.85)) * (1 - seg(p, 0.92, 0.98))
  })

  return (
    <>
      <group ref={group}>
        <primitive object={scene} scale={S} position={PIVOT.clone().multiplyScalar(-S)} />
      </group>
          <directionalLight ref={fill} color="#ffd9a0" />
    </>
  )
}

export default function CameraScene({
  progress,
  mobile,
  active,
}: {
  progress: Progress
  mobile: boolean
  active: boolean
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: 30, near: 0.01, far: 60, position: [0, 0.7, 14] }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance', toneMappingExposure: 1.05 }}
    >
      <color attach="background" args={['#0b0705']} />
      <fog attach="fog" args={['#0b0705', 9, 30]} />
      <ambientLight intensity={0.35} color="#ffcf99" />
      <Suspense fallback={null}>
        <Camera progress={progress} mobile={mobile} />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.2} color="#ffd8a8" position={[-4, 3, 3]} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#b98a4a" position={[5, 1, -4]} scale={[4, 6, 1]} />
          <Lightformer form="ring" intensity={0.8} color="#fff1d6" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={4} />
        </Environment>
      </Suspense>
      <Sparkles
        count={mobile ? 40 : 90}
        scale={[14, 8, 14]}
        size={mobile ? 2 : 2.4}
        speed={0.15}
        opacity={0.45}
        color="#e9cd93"
      />
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)