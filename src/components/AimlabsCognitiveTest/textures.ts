import * as THREE from "three";

/**
 * Creates a procedural checkerboard texture matching classic Aimlabs training rooms.
 * Alternating clean light/subtle off-white and cool gray grid tiles with beveled border seams.
 */
export function createCheckerboardFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const size = 64; // 8x8 tiles per texture tile unit
    for (let x = 0; x < 512; x += size) {
      for (let y = 0; y < 512; y += size) {
        const isEven = ((x / size) + (y / size)) % 2 === 0;
        // Tile colors: Aimlabs gray / soft slate-white checkered pattern
        ctx.fillStyle = isEven ? "#d3d8e2" : "#eaedf3";
        ctx.fillRect(x, y, size, size);

        // Thin grout lines
        ctx.strokeStyle = "rgba(40, 50, 70, 0.15)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

        // Subtle specular highlight on edge
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + size - 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x + size - 2, y + 2);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.anisotropy = 8;
  return texture;
}

/**
 * Creates a procedural slate-gray futuristic grid panel texture matching Aimlabs walls.
 */
export function createGridWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark modern Aimlabs slate base
    ctx.fillStyle = "#1e2430";
    ctx.fillRect(0, 0, 512, 512);

    const cellSize = 64;
    for (let x = 0; x < 512; x += cellSize) {
      for (let y = 0; y < 512; y += cellSize) {
        const isEven = ((x / cellSize) + (y / cellSize)) % 2 === 0;
        ctx.fillStyle = isEven ? "#232b38" : "#1a202c";
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // Grid panel seam
        ctx.strokeStyle = "rgba(10, 15, 24, 0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // Subtle top bevel highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 2);
        ctx.lineTo(x + cellSize - 1, y + 2);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 6);
  texture.anisotropy = 8;
  return texture;
}


