/**
 * AETHERIA | Catálogo de Paletas Cromáticas Canónicas: Sanzo Wada × Meximalismo
 * Basado en MANUAL_ARMONIA_CROMATICA_WADA_MEXICO.md (v2.2.0) — Haishoku Soukan (1918–1933)
 * Cero morados sintéticos o neones ciberpunk de plantilla IA.
 * Calibrado para evitar saturación blanca (whiteout) y preservar contraste mineral.
 */

(function (root) {
  'use strict';

  const Palettes = {
    fluid: {
      aurora: {
        name: '🕳️ Cenote Bioluminiscente (Wada)',
        colors: [
          [0.957, 0.502, 0.404], // Grenadine Pink #f48067 (Bioluminiscencia canónica Secc. 7.4)
          [0.000, 0.576, 0.647], // Cerulian Blue #0093a5 (Azul Maya Bonampak)
          [0.000, 0.706, 0.608], // Sea Green #00b49b (Jadeíta Chalchíhuitl)
          [0.471, 0.804, 0.816], // Calamine Blue #78cdd0 (Brisa de Popocatépetl)
          [0.000, 0.443, 0.565]  // Antwerp Blue #007190 (Agua de Cenote Sagrado)
        ]
      },
      rotulo: {
        name: '🪧 Tríada Rótulo Popular (#122)',
        colors: [
          [0.800, 0.071, 0.212], // Carmine #cc1236 (Grana Cochinilla)
          [1.000, 0.867, 0.000], // Apricot Yellow #ffdd00 (Amarillo Canario)
          [0.000, 0.431, 0.722], // Blue #006eb8 (Azul Cobalto Rotulista)
          [0.867, 0.251, 0.153], // Red Orange #dd4027 (Rojo Enchilada Legorreta)
          [0.961, 0.925, 0.761]  // Sulpher Yellow #f5ecc2 (Luz de Cal Viva)
        ]
      },
      barragan: {
        name: '🌺 Tríada Rosa Mexicano (Wada)',
        colors: [
          [0.773, 0.235, 0.412], // Indian Lake #c53c69 (Muros de Luis Barragán)
          [0.718, 0.122, 0.341], // Pomegranate Purple #b71f57 (Bugambilia al Sol)
          [0.949, 0.447, 0.569], // Spinel Red #f27291 (Papel de China)
          [0.961, 0.925, 0.761], // Sulpher Yellow #f5ecc2 (Muro Encalado)
          [0.953, 0.455, 0.125]  // Orange #f37420 (Contrapeso Solar Cempasúchil)
        ]
      },
      quetzal: {
        name: '🦜 Quetzal & Chalchíhuitl (Quiltic)',
        colors: [
          [0.000, 0.592, 0.553], // Benzol Green #00978d (Pluma Tornasol de Quetzal)
          [0.000, 0.706, 0.608], // Sea Green #00b49b (Jadeíta de Palenque)
          [0.384, 0.776, 0.749], // Venice Green #62c6bf (Arrecife de Cozumel)
          [0.686, 0.831, 0.447], // Yellow Green #afd472 (Brote de Milpa)
          [0.792, 0.702, 0.337]  // Pyrite Yellow #cab356 (Pirita Zacatecana)
        ]
      },
      choqueTermico: {
        name: '🏺 Choque Térmico Ancestral (#155)',
        colors: [
          [0.000, 0.576, 0.647], // Cerulian Blue #0093a5 (Azul Maya)
          [0.651, 0.173, 0.216], // Carmine Red #a62c37 (Grana Ritual)
          [0.851, 0.400, 0.161], // English Red #d96629 (Barro de Oaxaca)
          [0.953, 0.635, 0.341], // Golden Yellow #f3a257 (Oro Charro)
          [0.110, 0.259, 0.525]  // Deep Lyons Blue #1c4286 (Talavera Poblana)
        ]
      },
      cempasuchil: {
        name: '🕯️ Altar de Ánimas & Cempasúchil',
        colors: [
          [0.953, 0.455, 0.125], // Orange #f37420 (Cempasúchil Encendido)
          [0.976, 0.616, 0.106], // Yellow Orange #f99d1b (Yema de Pan de Muerto)
          [0.953, 0.635, 0.341], // Golden Yellow #f3a257 (Vela de Cera)
          [0.718, 0.122, 0.341], // Pomegranate Purple #b71f57 (Papel Picado)
          [0.071, 0.208, 0.306]  // Dark Tyrian Blue #12354e (Noche de Añil Xiuquilitl)
        ]
      },
      ferrocarril: {
        name: '🚂 Tríada Ferrocarrilera (#313)',
        colors: [
          [0.102, 0.455, 0.267], // Diamine Green #1a7444 (Verde Bandera)
          [0.800, 0.071, 0.212], // Carmine #cc1236 (Rojo Grana)
          [1.000, 0.867, 0.000], // Apricot Yellow #ffdd00 (Latón Canario)
          [0.961, 0.925, 0.761], // Sulpher Yellow #f5ecc2 (Filete de Cal)
          [0.204, 0.271, 0.298]  // Slate Color #34454c (Acero de Rieles)
        ]
      },
      botanica: {
        name: '🌵 Síntesis Botánica Vernácula (#200)',
        colors: [
          [0.263, 0.467, 0.259], // Cossack Green #437742 (Nopal de Teotihuacán)
          [0.949, 0.447, 0.569], // Spinel Red #f27291 (Tuna & Bugambilia)
          [0.961, 0.925, 0.761], // Sulpher Yellow #f5ecc2 (Muro de Cal)
          [0.710, 0.871, 0.800], // Turquoise Green #b5decc (Turquesa Huichol)
          [0.733, 0.443, 0.145]  // Raw Sienna #bb7125 (Adobe Secado al Sol)
        ]
      }
    },

    sand: {
      tlahuitl: {
        name: '🏺 Tierras Tlahuitl & Nixtamal',
        colors: [
          [0.733, 0.443, 0.145], // Raw Sienna #bb7125 (Adobe y Mezquite)
          [0.851, 0.400, 0.161], // English Red #d96629 (Barro Cocido de Oaxaca)
          [0.973, 0.780, 0.475], // Naples Yellow #f8c779 (Masa de Nixtamal)
          [0.847, 0.639, 0.482], // Ochraceous Salmon #d8a37b (Cántaro Coyotepec)
          [0.961, 0.925, 0.761]  // Sulpher Yellow #f5ecc2 (Cal Viva)
        ]
      },
      tezontle: {
        name: '🌋 Tezontle & Pirita Zacatecana',
        colors: [
          [0.510, 0.141, 0.122], // Vandyke Red #82241f (Tezontle Volcánico)
          [0.682, 0.322, 0.141], // Burnt Sienna #ae5224 (Barro Bruñido al Comal)
          [0.792, 0.702, 0.337], // Pyrite Yellow #cab356 (Pirita de Mina)
          [0.631, 0.639, 0.604], // Warm Gray #a1a39a (Ceniza Volcánica)
          [0.443, 0.314, 0.184]  // Pale Raw Umber #71502f (Madera de Sierra)
        ]
      },
      wixarika: {
        name: '💎 Chaquira Wixárika & Jade',
        colors: [
          [0.000, 0.706, 0.608], // Sea Green #00b49b (Chalchíhuitl)
          [0.000, 0.576, 0.647], // Cerulian Blue #0093a5 (Azul Maya)
          [1.000, 0.867, 0.000], // Apricot Yellow #ffdd00 (Sol Wixárika)
          [0.800, 0.071, 0.212], // Carmine #cc1236 (Venado Rojo)
          [0.710, 0.871, 0.800]  // Turquoise Green #b5decc (Turquesa de la Sierra)
        ]
      }
    },

    gas: {
      copal: {
        name: '💨 Humo de Copal & Tízatl',
        colors: [
          [0.961, 0.925, 0.761], // Sulpher Yellow #f5ecc2 (Polvo de Tízatl)
          [0.922, 0.827, 0.635], // Ivory Buff #ebd3a2 (Cantera Blanca)
          [0.631, 0.639, 0.604], // Warm Gray #a1a39a (Humo de Copal Santo)
          [1.000, 0.937, 0.682], // Pale Lemon Yellow #ffefae (Amate Fino)
          [0.596, 0.435, 0.176]  // Orange Citrine #986f2d (Resina de Copal Dorado)
        ]
      },
      patzcuaro: {
        name: '🌊 Bruma de Pátzcuaro & Cenote',
        colors: [
          [0.737, 0.894, 0.898], // Nile Blue #bce4e5 (Bruma Matutina de Pátzcuaro)
          [0.471, 0.804, 0.816], // Calamine Blue #78cdd0 (Cielo del Altiplano)
          [0.000, 0.576, 0.647], // Cerulian Blue #0093a5 (Azul Maya)
          [0.710, 0.871, 0.800], // Turquoise Green #b5decc (Vapor de Manantial)
          [0.035, 0.569, 0.592]  // Green Blue #099197 (Cenote Abierto)
        ]
      },
      mictlan: {
        name: '🕯️ Incienso de Altar Nocturno',
        colors: [
          [0.953, 0.455, 0.125], // Orange #f37420 (Cempasúchil)
          [0.953, 0.635, 0.341], // Golden Yellow #f3a257 (Luz de Vela)
          [0.957, 0.502, 0.404], // Grenadine Pink #f48067 (Atardecer Costeño)
          [0.773, 0.235, 0.412], // Indian Lake #c53c69 (Grana)
          [0.071, 0.208, 0.306]  // Dark Tyrian Blue #12354e (Añil Nocturno)
        ]
      }
    },

    lava: {
      popocatepetl: {
        name: '🌋 Magma del Popocatépetl',
        colors: [
          [0.890, 0.122, 0.149], // Spectrum Red #e31f26 (Rojo Bermellón Vivo)
          [0.867, 0.251, 0.153], // Red Orange #dd4027 (Rojo Enchilada)
          [0.953, 0.455, 0.125], // Orange #f37420 (Cempasúchil Incandescente)
          [1.000, 0.867, 0.000], // Apricot Yellow #ffdd00 (Fuego Canario)
          [0.510, 0.141, 0.122]  // Vandyke Red #82241f (Costra de Tezontle)
        ]
      },
      sonideroSolar: {
        name: '☀️ Fuego Solar Sonidero 3D',
        colors: [
          [0.953, 0.455, 0.125], // Orange #f37420 (Naranja Encendido)
          [0.988, 0.702, 0.082], // Orange Yellow #fcb315 (Sol Cenital)
          [1.000, 0.867, 0.000], // Apricot Yellow #ffdd00 (Amarillo Canario)
          [1.000, 0.949, 0.000], // Yellow #fff200 (Luz Solar Reflectante)
          [0.922, 0.325, 0.141]  // Jasper Red #eb5324 (Rojo Tocino)
        ]
      },
      granaCobre: {
        name: '🌺 Grana Cochinilla & Cobre',
        colors: [
          [0.800, 0.071, 0.212], // Carmine #cc1236 (Ácido Carmínico Puro)
          [0.773, 0.235, 0.412], // Indian Lake #c53c69 (Laca de Cochinilla)
          [0.957, 0.502, 0.404], // Grenadine Pink #f48067 (Bioluminiscencia Cálida)
          [0.953, 0.635, 0.341], // Golden Yellow #f3a257 (Cobre de Santa Clara)
          [0.718, 0.122, 0.341]  // Pomegranate Purple #b71f57 (Amaranto Ceremonial)
        ]
      }
    }
  };

  root.AetheriaPalettes = Palettes;
})(typeof window !== 'undefined' ? window : this);
