// Pure vertex-array builder for one RoomSegment's wireframe lines (longitudinal
// floor/ceiling/wall lines plus transverse cross-section rings). Extracted
// from the component so the geometry math can be read/tested independent of
// the mesh refs that consume it.
export function buildRoomWireframeVertices(
  W: number,
  H: number,
  depthSegment: number,
  Nx: number,
  Ny: number,
  Nz: number
): Float32Array {
  const vertices: number[] = [];
  const halfW = W / 2;
  const halfH = H / 2;
  const halfD = depthSegment / 2;

  // 1. Longitudinal lines running along Z axis (length of the room)
  // Floor & Ceiling lines
  for (let i = 0; i <= Nx; i++) {
    const x = -halfW + (i / Nx) * W;
    // Floor longitudinal line
    vertices.push(x, -halfH, -halfD, x, -halfH, halfD);
    // Ceiling longitudinal line
    vertices.push(x, halfH, -halfD, x, halfH, halfD);
  }

  // Left & Right Wall lines
  for (let i = 0; i <= Ny; i++) {
    const y = -halfH + (i / Ny) * H;
    // Left wall longitudinal line
    vertices.push(-halfW, y, -halfD, -halfW, y, halfD);
    // Right wall longitudinal line
    vertices.push(halfW, y, -halfD, halfW, y, halfD);
  }

  // 2. Transverse rings (cross sections along X-Y plane at different Z offsets)
  for (let i = 1; i <= Nz; i++) {
    const z = -halfD + (i / Nz) * depthSegment;
    // Horizontal floor transverse line
    vertices.push(-halfW, -halfH, z, halfW, -halfH, z);
    // Horizontal ceiling transverse line
    vertices.push(-halfW, halfH, z, halfW, halfH, z);
    // Vertical left wall transverse line
    vertices.push(-halfW, -halfH, z, -halfW, halfH, z);
    // Vertical right wall transverse line
    vertices.push(halfW, -halfH, z, halfW, halfH, z);
  }

  return new Float32Array(vertices);
}
