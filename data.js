(function () {
  function buildPhotoSources(raceId, fileName) {
    return {
      preview: "assets/races/" + raceId + "/previews/" + fileName,
      full: "assets/races/" + raceId + "/full/" + fileName,
      downloadName: fileName
    };
  }

  const races = [
    {
      id: "cdmx-21k-2026",
      name: "Medio Maraton de la Ciudad de Mexico 2025",
      distance: "21K",
      date: "2025-07-13",
      location: "Ciudad de Mexico",
      venue: "Paseo de la Reforma",
      price: 229,
      participants: 30000,
      summary: "Edicion pasada de gran convocatoria sobre Paseo de la Reforma.",
      cover: "assets/races/cdmx-21k-2026/cover.jpg",
      featuredBib: "1043",
      photos: [
        ["1043", "Daniel Vega", "Amanecer sobre Reforma", "1043-1.jpg", "center 24%"],
        ["1389", "Majo Ruiz", "Bloque fuerte en avenida", "1389-1.jpg", "center 26%"],
        ["2582", "Luis Campos", "Ritmo de grupo", "2582-1.jpg", "center 38%"],
        ["6470", "Andrea Leon", "Paso largo en asfalto", "6470-1.jpg", "center 32%"],
        ["9260", "Erik Mora", "Remate en recta", "9260-1.jpg", "center 18%"],
        ["2673", "Paola Gil", "Cadencia estable rumbo a meta", "2673-1.jpg", "center 28%"]
      ]
    },
    {
      id: "trail-bosque-15k-2026",
      name: "Tune Up Trail Ajusco 2025",
      distance: "21K",
      date: "2025-03-02",
      location: "Ajusco, Ciudad de Mexico",
      venue: "Valle de la Cantimplora",
      price: 249,
      participants: 1800,
      summary: "Carrera trail pasada con bosque, desnivel y salida en Ajusco.",
      cover: "assets/races/trail-bosque-15k-2026/cover.jpg",
      featuredBib: "403",
      photos: [
        ["403", "Mar Fer", "Bajada tecnica entre pinos", "403-1.jpg", "center 38%"],
        ["270", "Sofi Lara", "Seccion rapida con barro", "270-1.jpg", "center 34%"]
      ]
    },
    {
      id: "puebla-nocturna-10k-2025",
      name: "Medio Maraton Powerade Rosarito 2025",
      distance: "21K",
      date: "2025-06-22",
      location: "Rosarito",
      venue: "Boulevard Benito Juarez",
      price: 199,
      participants: 2600,
      summary: "Evento pasado a pie de costa con trazado rapido y urbano.",
      cover: "assets/races/puebla-nocturna-10k-2025/cover.jpg",
      featuredBib: "324",
      photos: [
        ["324", "Mario Solis", "Llegada con grupo puntero", "324-1.jpg", "center 42%"],
        ["324", "Mario Solis", "Ritmo estable en el tramo final", "elite-1.jpg", "center 48%"],
        ["5226", "Fernanda Rios", "Empuje final en carril abierto", "5226-1.jpg", "center 36%"]
      ]
    },
    {
      id: "monterrey-42k-2025",
      name: "Maraton Powerade Monterrey 2025",
      distance: "42K",
      date: "2025-12-14",
      location: "Monterrey",
      venue: "Parque Fundidora",
      price: 289,
      participants: 8000,
      summary: "Edicion de gran fondo urbano con salida y meta en Fundidora.",
      cover: "assets/races/monterrey-42k-2025/cover.jpg",
      featuredBib: "421",
      photos: [
        ["421", "Alejandro Mora", "Paso firme en avenida", "421-1.jpg", "center 38%"],
        ["908", "Luis Tamez", "Cierre de grupo elite", "908-1.jpg", "center 42%"]
      ]
    },
    {
      id: "guadalajara-21k-2026",
      name: "XL Medio Maraton Internacional Guadalajara Electrolit 2026",
      distance: "21K",
      date: "2026-02-22",
      location: "Guadalajara",
      venue: "Centro de Guadalajara",
      price: 269,
      participants: 23000,
      summary: "Edicion pasada de etiqueta internacional con salida urbana y alta convocatoria.",
      cover: "assets/races/guadalajara-21k-2026/cover.jpg",
      featuredBib: "611",
      photos: [
        ["611", "Valeria Rios", "Ritmo constante en tramo urbano", "611-1.jpg", "center 30%"],
        ["954", "Jose Parra", "Avance firme rumbo a meta", "954-1.jpg", "center 36%"]
      ]
    },
    {
      id: "apodaca-21k-2025",
      name: "21K Fundacion Apodaca 2025",
      distance: "21K",
      date: "2025-03-23",
      location: "Apodaca",
      venue: "Plaza Principal de Apodaca",
      price: 219,
      participants: 1000,
      summary: "Ruta rapida en Nuevo Leon con formato 21K y ambiente de ciudad.",
      cover: "assets/races/apodaca-21k-2025/cover.jpg",
      featuredBib: "730",
      photos: [
        ["730", "Carlos Luna", "Cruce veloz en recta", "730-1.jpg", "center 42%"],
        ["118", "Daniela Perez", "Paso fuerte entre corredores", "118-1.jpg", "center 30%"]
      ]
    },
    {
      id: "cdmx-maraton-2025",
      name: "Maraton de la Ciudad de Mexico 2025",
      distance: "42K",
      date: "2025-08-31",
      location: "Ciudad de Mexico",
      venue: "Ciudad Universitaria al Zocalo",
      price: 299,
      participants: 30000,
      summary: "Maraton pasado con recorrido emblematico por la capital.",
      cover: "assets/races/cdmx-maraton-2025/cover.jpg",
      featuredBib: "3021",
      photos: [
        ["3021", "Andrea Soto", "Tramo largo sobre avenida principal", "3021-1.jpg", "center 30%"],
        ["517", "Mario Trejo", "Paso firme rumbo al cierre", "517-1.jpg", "center 38%"]
      ]
    },
    {
      id: "san-pedro-10k-2025",
      name: "21 K Nuevo Leon 2025",
      distance: "21K",
      date: "2025-11-16",
      location: "Monterrey",
      venue: "Parque Fundidora",
      price: 189,
      participants: 7000,
      summary: "Medio maraton pasado con salida rapida y ambiente regio.",
      cover: "assets/races/san-pedro-10k-2025/cover.jpg",
      featuredBib: "88",
      photos: [
        ["88", "Rene Villarreal", "Paso veloz en tramo recto", "88-1.jpg", "center 40%"],
        ["243", "Karen Lozano", "Cambio de ritmo en zona urbana", "243-1.jpg", "center 42%"]
      ]
    },
    {
      id: "queretaro-21k-2026",
      name: "Medio Maraton Internacional Tijuana Fundacion Castro-Limon 2025",
      distance: "21K",
      date: "2025-06-15",
      location: "Tijuana",
      venue: "Zona Rio y Centro",
      price: 239,
      participants: 5400,
      summary: "Evento pasado de media maraton con recorrido urbano y buena convocatoria.",
      cover: "assets/races/queretaro-21k-2026/cover.jpg",
      featuredBib: "1504",
      photos: [
        ["1504", "Paola Neri", "Ritmo sostenido al amanecer", "1504-1.jpg", "center 30%"],
        ["982", "Ivan Rubio", "Empuje fuerte al cierre", "982-1.jpg", "center 36%"]
      ]
    },
    {
      id: "trail-sierra-12k-2026",
      name: "Tune Up Trail La Marquesa 2025",
      distance: "21K",
      date: "2025-11-02",
      location: "La Marquesa, Estado de Mexico",
      venue: "Valle del Silencio",
      price: 259,
      participants: 1500,
      summary: "Trail pasado con bosque, altimetria y salida en Rancho Viejo.",
      cover: "assets/races/trail-sierra-12k-2026/cover.jpg",
      featuredBib: "540",
      photos: [
        ["540", "Leo Cardenas", "Ascenso tecnico entre arboles", "540-1.jpg", "center 38%"],
        ["211", "Mariana Ibarra", "Paso fuerte en terraceria", "211-1.jpg", "center 34%"]
      ]
    }
  ];

  races.forEach(function (race) {
    race.photos = race.photos.map(function (item, index) {
      const bib = item[0];
      const runner = item[1];
      const shot = item[2];
      const fileName = item[3];
      const position = item[4];
      const sources = buildPhotoSources(race.id, fileName);

      return {
        id: race.id + "-photo-" + (index + 1),
        raceId: race.id,
        raceName: race.name,
        raceDistance: race.distance,
        bib: bib,
        runner: runner,
        shot: shot,
        title: race.name + " / #" + bib,
        preview: sources.preview,
        full: sources.full,
        downloadName: sources.downloadName,
        position: position || "center"
      };
    });

    race.bibs = Array.from(new Set(race.photos.map(function (photo) {
      return photo.bib;
    })));

    race.totalPhotos = race.photos.length;
  });

  window.RaceArchiveData = {
    brandName: "Finish Line",
    currency: "MXN",
    featuredRaceId: "cdmx-maraton-2025",
    demoSales: [
      {
        createdAt: "2026-04-10T09:18:00-06:00",
        buyerName: "Andrea Morales",
        buyerEmail: "andrea.morales@finishline.mx",
        raceId: "cdmx-21k-2026",
        bib: "1043",
        photosCount: 1,
        paymentMethod: "Tarjeta"
      },
      {
        createdAt: "2026-04-10T13:42:00-06:00",
        buyerName: "Luis Herrera",
        buyerEmail: "luis.herrera@finishline.mx",
        raceId: "trail-bosque-15k-2026",
        bib: "403",
        photosCount: 1,
        paymentMethod: "Tarjeta"
      },
      {
        createdAt: "2026-04-11T11:07:00-06:00",
        buyerName: "Paola Rios",
        buyerEmail: "paola.rios@finishline.mx",
        raceId: "puebla-nocturna-10k-2025",
        bib: "324",
        photosCount: 2,
        paymentMethod: "Tarjeta"
      },
      {
        createdAt: "2026-04-12T17:26:00-06:00",
        buyerName: "Mario Tamez",
        buyerEmail: "mario.tamez@finishline.mx",
        raceId: "monterrey-42k-2025",
        bib: "421",
        photosCount: 1,
        paymentMethod: "Tarjeta"
      },
      {
        createdAt: "2026-04-14T08:55:00-06:00",
        buyerName: "Valeria Neri",
        buyerEmail: "valeria.neri@finishline.mx",
        raceId: "queretaro-21k-2026",
        bib: "1504",
        photosCount: 1,
        paymentMethod: "Tarjeta"
      },
      {
        createdAt: "2026-04-14T19:11:00-06:00",
        buyerName: "Rene Villarreal",
        buyerEmail: "rene.villarreal@finishline.mx",
        raceId: "san-pedro-10k-2025",
        bib: "88",
        photosCount: 1,
        paymentMethod: "Tarjeta"
      },
      {
        createdAt: "2026-04-15T12:34:00-06:00",
        buyerName: "Mariana Cardenas",
        buyerEmail: "mariana.cardenas@finishline.mx",
        raceId: "trail-sierra-12k-2026",
        bib: "540",
        photosCount: 1,
        paymentMethod: "Tarjeta"
      },
      {
        createdAt: "2026-04-16T10:02:00-06:00",
        buyerName: "Carlos Luna",
        buyerEmail: "carlos.luna@finishline.mx",
        raceId: "apodaca-21k-2025",
        bib: "730",
        photosCount: 1,
        paymentMethod: "Tarjeta"
      }
    ],
    adminAuth: {
      username: "admin",
      passwordHash: "4d343fc135d5a6ffa5056120ede12fae1dad73caa2391ff2e2b93546e05fb86a",
      passwordHint: "Cambia esta clave antes de publicar."
    },
    races: races
  };
})();
