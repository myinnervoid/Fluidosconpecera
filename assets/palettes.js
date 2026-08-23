/**
 * AETHERIA | Palette Asset Definitions
 * Curated color palettes for Fluid (Liquid), Sand (Granular Arena), Gas (Smoke), and Ambient Relax Videos.
 */

(function (root) {
  'use strict';

  const Palettes = {
    fluid: {
      aurora: {
        name: '🌌 Aurora Boreal',
        colors: [
          [0.1, 0.9, 0.6],    // Verde esmeralda polar
          [0.2, 0.5, 0.9],    // Azul petróleo
          [0.6, 0.9, 0.8],    // Menta bioluminiscente
          [0.5, 0.3, 0.8],    // Violeta boreal
          [0.15, 0.95, 0.75]  // Verde hielo
        ]
      },
      pastel: {
        name: '🥛 Líquido Pastel & Seda',
        colors: [
          [1.0, 0.8, 0.8],    // Melocotón mate
          [1.0, 0.7, 0.9],    // Rosa cuarzo
          [0.8, 0.7, 1.0],    // Lila suave
          [0.95, 0.9, 0.7],   // Crema vainilla
          [0.75, 0.88, 1.0]   // Azul bebé
        ]
      },
      abyss: {
        name: '🌊 Abismo Oceánico',
        colors: [
          [0.0, 0.2, 0.5],    // Azul marino profundo
          [0.0, 0.6, 0.85],   // Zafiro
          [0.2, 0.9, 0.9],    // Cian aguamarina
          [0.8, 1.0, 1.0],    // Blanco espuma de mar
          [0.05, 0.4, 0.65]   // Azul abisal
        ]
      },
      sakura: {
        name: '🌸 Sakura Zen',
        colors: [
          [1.0, 0.75, 0.82],  // Flor de cerezo rosa
          [0.92, 0.45, 0.65],  // Magenta suave
          [1.0, 0.92, 0.95],  // Niebla blanca
          [0.85, 0.25, 0.45],  // Rubí translúcido
          [1.0, 0.85, 0.9]    // Pétalo de durazno
        ]
      },
      matcha: {
        name: '🍵 Bosque Matcha & Jade',
        colors: [
          [0.45, 0.65, 0.25],  // Matcha verde
          [0.72, 0.80, 0.35],  // Musgo dorado
          [0.18, 0.42, 0.22],  // Jade oscuro
          [0.85, 0.68, 0.25],  // Ámbar cálido
          [0.3, 0.55, 0.35]   // Bambú
        ]
      },
      silver: {
        name: '🪐 Plata & Titanio (Cometa)',
        colors: [
          [0.88, 0.92, 0.98],  // Plata brillante
          [0.65, 0.70, 0.78],  // Titanio gris
          [0.42, 0.46, 0.54],  // Carbón metálico
          [1.0, 1.0, 1.0],     // Destello blanco
          [0.55, 0.65, 0.75]   // Acero espacial
        ]
      },
      bauhaus: {
        name: '🎨 Color Block Bauhaus',
        colors: [
          [0.08, 0.32, 0.88],  // Azul cobalto puro
          [0.92, 0.12, 0.15],  // Rojo carmín sólido
          [0.98, 0.82, 0.05],  // Amarillo canario
          [0.15, 0.78, 0.45],  // Verde bosque sólido
          [0.95, 0.95, 0.95]   // Blanco puro
        ]
      },
      biolum: {
        name: '✨ Marea Bioluminiscente',
        colors: [
          [0.0, 0.95, 1.0],    // Cyan brillante
          [0.0, 0.45, 0.95],   // Azul zafiro
          [0.0, 1.0, 0.65],    // Verde fósforo
          [0.3, 0.85, 1.0],    // Azul hielo
          [0.9, 0.1, 0.6]      // Magenta estelar
        ]
      },
      neon: {
        name: '⚡ Neón Eléctrico',
        colors: [
          [1.0, 0.0, 0.55],    // Neon Pink
          [0.0, 0.95, 1.0],    // Neon Cyan
          [0.95, 0.85, 0.0],   // Neon Yellow
          [0.65, 0.0, 1.0],    // Neon Purple
          [0.0, 1.0, 0.65]     // Neon Green
        ]
      },
      magma: {
        name: '🔥 Magma Volcánico',
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
        name: 'Aurora Polar',
        colors: [
          [0.1, 1.0, 0.55],    // Verde aurora
          [0.2, 0.7, 1.0],     // Cian polar
          [0.85, 0.2, 0.9],    // Violeta nocturno
          [0.3, 1.0, 0.85]     // Esmeralda
        ]
      }
    }
  };

  root.AetheriaPalettes = Palettes;
})(typeof window !== 'undefined' ? window : this);
