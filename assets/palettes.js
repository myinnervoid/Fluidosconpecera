/**
 * AETHERIA | Palette Asset Definitions
 * Curated color palettes for Fluid (Liquid), Sand (Granular Arena), Gas (Smoke), and Retro LUTs.
 */

(function (root) {
  'use strict';

  const Palettes = {
    fluid: {
      biolum: {
        name: 'Marea Bioluminiscente',
        colors: [
          [0.0, 0.95, 1.0],    // Cyan brillante
          [0.0, 0.45, 0.95],   // Azul zafiro
          [0.0, 1.0, 0.65],    // Verde fósforo
          [0.3, 0.85, 1.0],    // Azul hielo
          [0.9, 0.1, 0.6]      // Magenta estelar
        ]
      },
      neon: {
        name: 'Neón Eléctrico',
        colors: [
          [1.0, 0.0, 0.55],    // Neon Pink
          [0.0, 0.95, 1.0],    // Neon Cyan
          [0.95, 0.85, 0.0],   // Neon Yellow
          [0.65, 0.0, 1.0],    // Neon Purple
          [0.0, 1.0, 0.65]     // Neon Green
        ]
      },
      marble: {
        name: 'Tinta Marmoleada',
        colors: [
          [0.95, 0.05, 0.55],  // Carmesí
          [0.1, 0.7, 0.95],    // Azul cielo
          [0.95, 0.75, 0.1],   // Oro
          [0.55, 0.1, 0.85],   // Púrpura
          [0.0, 0.9, 0.6]      // Jade
        ]
      },
      magma: {
        name: 'Magma Volcánico',
        colors: [
          [1.0, 0.15, 0.0],    // Rojo volcánico
          [1.0, 0.55, 0.0],    // Ámbar
          [1.0, 0.9, 0.1],     // Oro solar
          [0.85, 0.0, 0.25],   // Rubí
          [1.0, 0.95, 0.8]     // Blanco incandescente
        ]
      }
    },

    sand: {
      desert: {
        name: 'Arena del Sahara',
        colors: [
          [0.92, 0.72, 0.38],  // Arena dorada
          [0.82, 0.56, 0.26],  // Ámbar tostado
          [0.98, 0.85, 0.55],  // Duna clara
          [0.65, 0.38, 0.15],  // Ocre mineral
          [1.0, 0.92, 0.7]     // Silicio brillante
        ]
      },
      cosmicSand: {
        name: 'Arena Cósmica (Púrpura / Cian)',
        colors: [
          [0.0, 0.9, 0.95],    // Grano cian
          [0.75, 0.2, 0.95],   // Grano amatista
          [0.95, 0.3, 0.65],   // Grano rubí
          [0.2, 0.95, 0.6],    // Grano esmeralda
          [0.95, 0.95, 1.0]    // Polvo estelar
        ]
      },
      rubyEmerald: {
        name: 'Gemas Preciosas',
        colors: [
          [0.95, 0.1, 0.3],    // Rubí
          [0.1, 0.85, 0.4],    // Esmeralda
          [0.15, 0.5, 0.95],   // Zafiro
          [0.95, 0.8, 0.1]     // Topacio
        ]
      }
    },

    gas: {
      orion: {
        name: 'Nebulosa Orión',
        colors: [
          [0.75, 0.2, 0.95],   // Púrpura cósmico
          [0.1, 0.7, 1.0],     // Gas ionizado
          [0.95, 0.3, 0.65],   // Hidrógeno rosa
          [0.2, 0.9, 0.8]      // Helio azul
        ]
      },
      aurora: {
        name: 'Aurora Boreal',
        colors: [
          [0.1, 1.0, 0.55],    // Verde aurora
          [0.2, 0.7, 1.0],     // Cian polar
          [0.85, 0.2, 0.9],    // Violeta nocturno
          [0.3, 1.0, 0.85]     // Esmeralda
        ]
      }
    },

    // LUTs Retro 8-Bit
    pixelLUTs: {
      pico8: {
        name: 'Retro PICO-8 (16 Colores)',
        colors: [
          [0.0, 0.0, 0.0],
          [0.11, 0.17, 0.33],
          [0.49, 0.15, 0.53],
          [0.0, 0.53, 0.32],
          [0.67, 0.32, 0.21],
          [0.37, 0.34, 0.31],
          [0.76, 0.76, 0.76],
          [1.0, 0.95, 0.91],
          [1.0, 0.0, 0.3],
          [1.0, 0.64, 0.0],
          [1.0, 0.93, 0.15],
          [0.0, 0.89, 0.21],
          [0.18, 0.67, 1.0],
          [0.51, 0.46, 0.61],
          [1.0, 0.47, 0.65],
          [1.0, 0.8, 0.67]
        ]
      },
      gameboy: {
        name: 'GameBoy Phosphor (4 Verdes)',
        colors: [
          [0.06, 0.22, 0.06],
          [0.19, 0.38, 0.19],
          [0.55, 0.67, 0.06],
          [0.61, 0.73, 0.06]
        ]
      },
      synthwave: {
        name: 'Synthwave Arcade',
        colors: [
          [0.05, 0.02, 0.15],
          [0.25, 0.0, 0.35],
          [0.55, 0.0, 0.45],
          [0.85, 0.0, 0.55],
          [0.0, 0.85, 0.95],
          [1.0, 0.9, 0.1],
          [1.0, 0.0, 0.5],
          [1.0, 0.98, 0.95]
        ]
      }
    }
  };

  root.AetheriaPalettes = Palettes;
})(typeof window !== 'undefined' ? window : this);
