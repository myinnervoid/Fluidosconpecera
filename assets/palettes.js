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
        name: '🌌 Aurora Boreal',
        colors: [
          [0.0, 1.0, 0.8],     // Verde esmeralda eléctrico
          [0.0, 0.6, 1.0],     // Cian polar
          [0.8, 0.0, 1.0],     // Violeta polar
          [1.0, 0.4, 0.0],     // Ámbar solar
          [0.05, 0.15, 0.95]   // Azul medianoche
        ]
      },
      fire: {
        name: '🔥 Fuego & Llamas',
        colors: [
          [1.0, 0.1, 0.0],     // Rojo carmesí fuego
          [1.0, 0.5, 0.0],     // Naranja volcánico
          [1.0, 0.8, 0.0],     // Oro incandescente
          [1.0, 0.2, 0.6],     // Magenta plasma
          [0.9, 0.0, 0.2]      // Fuego profundo
        ]
      },
      ice: {
        name: '❄️ Hielo Ártico',
        colors: [
          [0.2, 0.8, 1.0],     // Azul hielo
          [0.6, 0.9, 1.0],     // Glaciar luminoso
          [1.0, 1.0, 1.0],     // Nieve pura
          [0.0, 0.4, 0.8],     // Azul cobalto
          [0.3, 0.95, 0.9]     // Escarcha cian
        ]
      },
      neon: {
        name: '⚡ Neón Cyberpunk',
        colors: [
          [1.0, 0.0, 1.0],     // Fucsia neón
          [0.0, 1.0, 1.0],     // Cian neón
          [1.0, 0.0, 0.0],     // Rojo láser
          [0.0, 1.0, 0.0],     // Verde matriz
          [0.95, 0.85, 0.0]    // Amarillo eléctrico
        ]
      },
      forest: {
        name: '🌿 Selva Esmeralda',
        colors: [
          [0.0, 0.5, 0.0],     // Verde bosque
          [0.0, 0.8, 0.2],     // Esmeralda viva
          [0.2, 0.6, 0.1],     // Jade profundo
          [0.5, 0.3, 0.0],     // Madera ocre
          [0.1, 0.95, 0.5]     // Bambú fósforo
        ]
      },
      sunset: {
        name: '🌅 Atardecer Dorado',
        colors: [
          [1.0, 0.3, 0.0],     // Naranja crepúsculo
          [1.0, 0.6, 0.0],     // Oro atardecer
          [1.0, 0.9, 0.3],     // Amarillo sol poniente
          [0.8, 0.0, 0.4],     // Magenta horizonte
          [0.4, 0.0, 0.6]      // Violeta noche
        ]
      },
      ocean: {
        name: '🌊 Océano Abisal',
        colors: [
          [0.0, 0.2, 0.6],     // Azul abisal
          [0.0, 0.5, 0.8],     // Azul marino
          [0.2, 0.7, 0.9],     // Océano turquesa
          [0.0, 0.8, 0.6],     // Marea esmeralda
          [0.0, 0.95, 1.0]     // Espuma cian
        ]
      },
      sakura: {
        name: '🌸 Sakura & Orquídea',
        colors: [
          [1.0, 0.05, 0.55],   // Magenta rubí
          [1.0, 0.25, 0.75],   // Rosa fucsia flor
          [0.0, 0.95, 0.85],   // Aguamarina
          [0.85, 0.0, 0.3],    // Carmesí pétalo
          [0.65, 0.0, 0.9]     // Orquídea
        ]
      }
    },

    sand: {
      desert: {
        name: '🏜️ Desierto Sahara',
        colors: [
          [0.8, 0.6, 0.3],     // Arena dorada
          [0.9, 0.7, 0.4],     // Duna clara
          [0.7, 0.5, 0.2],     // Ámbar tostado
          [0.6, 0.4, 0.1],     // Ocre mineral
          [1.0, 0.6, 0.2]      // Terracota
        ]
      },
      mineral: {
        name: '🪨 Mineral Volcánico',
        colors: [
          [0.5, 0.4, 0.3],     // Basalto gris
          [0.6, 0.5, 0.4],     // Granito pardo
          [0.4, 0.3, 0.2],     // Obsidiana
          [0.7, 0.6, 0.5],     // Cuarzo mineral
          [0.8, 0.7, 0.6]      // Sílice blanco
        ]
      },
      gems: {
        name: '💎 Gemas Cósmicas',
        colors: [
          [0.95, 0.05, 0.25],  // Rubí
          [0.05, 0.85, 0.35],  // Esmeralda
          [0.1, 0.45, 0.95],   // Zafiro
          [0.95, 0.8, 0.05],   // Topacio
          [0.75, 0.2, 0.95]    // Amatista
        ]
      }
    },

    gas: {
      nebula: {
        name: '🌌 Nebulosa Cósmica',
        colors: [
          [0.5, 0.0, 0.8],     // Violeta interestelar
          [0.0, 0.4, 0.8],     // Azul espacial
          [0.8, 0.2, 0.6],     // Magenta nebulosa
          [0.2, 0.8, 0.8],     // Gas ionizado
          [0.1, 0.95, 0.8]     // Helio cósmico
        ]
      },
      smoke: {
        name: '💨 Humo & Vapor',
        colors: [
          [0.6, 0.6, 0.6],     // Humo medio
          [0.8, 0.8, 0.8],     // Vapor claro
          [0.4, 0.4, 0.4],     // Ceniza oscura
          [0.9, 0.9, 0.9],     // Bruma blanca
          [0.3, 0.3, 0.35]     // Niebla densa
        ]
      },
      auroraGas: {
        name: '✨ Aurora Gas Polar',
        colors: [
          [0.05, 1.0, 0.5],    // Verde aurora
          [0.1, 0.7, 1.0],     // Cian polar
          [0.85, 0.1, 0.9],    // Violeta nocturno
          [0.2, 1.0, 0.8]      // Esmeralda vapor
        ]
      }
    },

    lava: {
      magma: {
        name: '🌋 Magma Fundido',
        colors: [
          [1.0, 0.2, 0.0],     // Naranja magma
          [0.8, 0.0, 0.0],     // Rojo carmesí
          [1.0, 0.6, 0.0],     // Oro ardiente
          [0.5, 0.0, 0.0],     // Carbón ardiente
          [1.0, 0.05, 0.1]     // Fuego líquido
        ]
      },
      glow: {
        name: '☀️ Resplandor Solar',
        colors: [
          [1.0, 0.5, 0.0],     // Ámbar solar
          [1.0, 0.8, 0.2],     // Oro brillante
          [1.0, 0.2, 0.0],     // Fuego puro
          [0.9, 0.9, 0.0],     // Amarillo fósforo
          [1.0, 0.3, 0.0]      // Naranja corona
        ]
      },
      plasmaLava: {
        name: '🔮 Plasma Ultravioleta',
        colors: [
          [0.6, 0.0, 1.0],     // Violeta ultravioleta
          [1.0, 0.05, 0.45],   // Fucsia plasma
          [0.0, 0.95, 1.0],    // Cian eléctrico
          [0.05, 0.1, 0.85],   // Azul índigo
          [0.85, 0.0, 0.75]    // Amatista
        ]
      }
    }
  };

  root.AetheriaPalettes = Palettes;
})(typeof window !== 'undefined' ? window : this);
