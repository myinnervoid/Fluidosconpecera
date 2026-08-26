/**
 * AETHERIA | Palette Asset Definitions
 * High-Chroma, Contrast-Rich Color Palettes for Fluid, Lava Lamp, Sand, and Gas.
 * Calibrated to prevent whiteout blending and maximize visual vibrancy.
 */

(function (root) {
  'use strict';

  const Palettes = {
    fluid: {
      aurora: {
        name: '🌌 Aurora Polar (Contraste)',
        colors: [
          [0.0, 1.0, 0.45],    // Verde esmeralda eléctrico
          [0.7, 0.0, 1.0],     // Violeta polar
          [0.0, 0.85, 1.0],    // Cian polar intenso
          [0.05, 0.15, 0.95],  // Azul medianoche
          [0.0, 1.0, 0.75]     // Menta fósforo
        ]
      },
      sakura: {
        name: '🌸 Sakura & Aguamarina',
        colors: [
          [1.0, 0.05, 0.55],   // Magenta rubí
          [1.0, 0.25, 0.75],   // Rosa fucsia vivo
          [0.0, 0.95, 0.85],   // Aguamarina de alto contraste
          [0.85, 0.0, 0.3],    // Carmesí flor
          [0.65, 0.0, 0.9]     // Orquídea
        ]
      },
      abyss: {
        name: '🌊 Abismo & Fuego Azul',
        colors: [
          [0.05, 0.35, 1.0],   // Azul zafiro profundo
          [1.0, 0.55, 0.0],    // Ámbar fuego de contraste
          [0.0, 1.0, 0.85],    // Cian fósforo
          [0.95, 0.0, 0.25],   // Carmesí abisal
          [0.0, 0.65, 1.0]     // Azul océano
        ]
      },
      matcha: {
        name: '🍵 Matcha & Oro Imperial',
        colors: [
          [0.05, 0.85, 0.35],  // Jade esmeralda vivo
          [1.0, 0.75, 0.0],    // Oro imperial
          [0.3, 0.65, 0.1],    // Matcha profundo
          [1.0, 0.25, 0.0],    // Naranja volcánico
          [0.1, 0.95, 0.5]     // Bambú eléctrico
        ]
      },
      biolum: {
        name: '✨ Marea Bioluminiscente',
        colors: [
          [0.0, 0.95, 1.0],    // Cyan brillante
          [0.0, 0.4, 0.95],    // Azul cobalto
          [0.0, 1.0, 0.6],     // Verde fósforo
          [0.9, 0.0, 0.6],     // Magenta estelar
          [0.2, 0.8, 1.0]      // Azul eléctrico
        ]
      },
      neon: {
        name: '⚡ Neón Eléctrico',
        colors: [
          [1.0, 0.0, 0.55],    // Neon Pink
          [0.0, 0.95, 1.0],    // Neon Cyan
          [0.95, 0.85, 0.0],   // Neon Yellow
          [0.65, 0.0, 1.0],    // Neon Purple
          [0.0, 1.0, 0.55]     // Neon Green
        ]
      },
      bauhaus: {
        name: '🎨 Color Block Bauhaus',
        colors: [
          [0.08, 0.32, 0.88],  // Azul cobalto puro
          [0.92, 0.12, 0.15],  // Rojo carmín sólido
          [0.98, 0.82, 0.05],  // Amarillo canario
          [0.15, 0.78, 0.45],  // Verde bosque sólido
          [0.6, 0.0, 0.8]      // Púrpura sólido
        ]
      }
    },

    lava: {
      magmaLava: {
        name: '🔴 Magma & Lava Volcánica',
        colors: [
          [1.0, 0.0, 0.1],     // Rojo carmesí fundido
          [1.0, 0.45, 0.0],    // Naranja lava incandescente
          [1.0, 0.85, 0.0],    // Oro solar
          [0.75, 0.0, 0.45],   // Púrpura volcánico
          [1.0, 0.2, 0.0]      // Fuego líquido
        ]
      },
      neonLava: {
        name: '🧪 Lámpara Neón Psicodélica',
        colors: [
          [1.0, 0.0, 0.6],     // Fucsia flúor
          [0.1, 1.0, 0.0],     // Verde tóxico brillante
          [1.0, 0.95, 0.0],    // Amarillo fosforescente
          [0.0, 0.45, 1.0],    // Azul ultravioleta
          [1.0, 0.3, 0.0]      // Naranja flúor
        ]
      },
      plasmaLava: {
        name: '🔮 Plasma Ultravioleta & Cian',
        colors: [
          [0.6, 0.0, 1.0],     // Violeta profundo
          [1.0, 0.05, 0.45],   // Rosa caliente
          [0.0, 0.95, 1.0],    // Cian plasma
          [0.05, 0.1, 0.85],   // Azul índigo
          [0.85, 0.0, 0.75]    // Amatista
        ]
      }
    },

    sand: {
      desert: {
        name: 'Arena del Sahara',
        colors: [
          [0.95, 0.7, 0.25],   // Arena dorada
          [0.85, 0.45, 0.15],  // Ámbar tostado
          [1.0, 0.85, 0.45],   // Duna clara
          [0.65, 0.35, 0.1],   // Ocre mineral
          [1.0, 0.6, 0.2]      // Terracota
        ]
      },
      cosmicSand: {
        name: 'Arena Cósmica (Púrpura / Cian)',
        colors: [
          [0.0, 0.9, 0.95],    // Grano cian
          [0.75, 0.2, 0.95],   // Grano amatista
          [0.95, 0.3, 0.65],   // Grano rubí
          [0.2, 0.95, 0.6],    // Grano esmeralda
          [1.0, 0.8, 0.1]      // Grano topacio
        ]
      },
      rubyEmerald: {
        name: 'Gemas Preciosas',
        colors: [
          [0.95, 0.05, 0.25],  // Rubí
          [0.05, 0.85, 0.35],  // Esmeralda
          [0.1, 0.45, 0.95],   // Zafiro
          [0.95, 0.8, 0.05]    // Topacio
        ]
      }
    },

    gas: {
      orion: {
        name: 'Nebulosa Orión',
        colors: [
          [0.75, 0.1, 0.95],   // Púrpura cósmico
          [0.05, 0.7, 1.0],    // Gas ionizado
          [0.95, 0.2, 0.6],    // Hidrógeno rosa
          [0.1, 0.95, 0.8]     // Helio azul
        ]
      },
      auroraGas: {
        name: 'Aurora Polar',
        colors: [
          [0.05, 1.0, 0.5],    // Verde aurora
          [0.1, 0.7, 1.0],     // Cian polar
          [0.85, 0.1, 0.9],    // Violeta nocturno
          [0.2, 1.0, 0.8]      // Esmeralda
        ]
      }
    }
  };

  root.AetheriaPalettes = Palettes;
})(typeof window !== 'undefined' ? window : this);
