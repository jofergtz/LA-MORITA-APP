import { User, Publication, Request, Message, ThankYou, Notification, Announcement } from './types';

export const guestUser: User = {
  id: 'guest',
  name: 'Visitante (Sin cuenta)',
  email: 'visitante@lamorita.com',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  zone: 'Barrio La Morita, Santa Cruz',
  bio: 'Explorador visitante sin cuenta registrada.',
  skills: []
};

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Gladys Justiniano',
    email: 'gladys@lamorita.com',
    phone: '770-45678',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    zone: 'Equipetrol, Calle 8 #420',
    bio: 'Abuela querendona de 4 nietos, apasionada de la cocina tradicional camba y las plantas. ¡Siempre lista para dar una mano!',
    skills: ['Cocina Cruceña', 'Jardinería', 'Repostería']
  },
  {
    id: 'u2',
    name: 'Carlos Lorgio Mercado',
    email: 'carlos@lamorita.com',
    phone: '721-54321',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    zone: 'Urbarí, Pasaje Cupesí 120',
    bio: 'Electricista y técnico en refrigeración con más de 20 años en el barrio. Arreglo aires acondicionados, heladeras y lavarropas.',
    skills: ['Electricidad', 'Refrigeración', 'Plomería', 'Cerrajería']
  },
  {
    id: 'u3',
    name: 'Lucía Melgar',
    email: 'lucia@lamorita.com',
    phone: '609-87654',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    zone: 'Av. San Martín, Barrio Sirari #1540',
    bio: 'Estudiante de Ingeniería de Sistemas en la UAGRM. Doy clases particulares de apoyo escolar para primaria y secundaria.',
    skills: ['Apoyo Escolar', 'Matemáticas', 'Computación']
  },
  {
    id: 'u4',
    name: 'Martín Suárez',
    email: 'martin@lamorita.com',
    phone: '708-23456',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    zone: 'Las Palmas, Calle Motacú 830',
    bio: 'Padre de familia. Realizo mantenimiento de jardines, poda, limpieza de patios y pintura los fines de semana.',
    skills: ['Jardinería', 'Pintura', 'Limpieza de patios']
  },
  {
    id: 'u5',
    name: 'Clara Aguilera',
    email: 'clara@lamorita.com',
    phone: '755-87654',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    zone: 'Barrio Hamacas, Calle Tajibo 340',
    bio: 'Pastelera de corazón y amante de las mascotas. Vivo con dos perritos rescatados y me encanta hornear cuñapés los domingos.',
    skills: ['Repostería', 'Cuidado de Mascotas', 'Cocina']
  },
  {
    id: 'currentUser', // Default active user so they can interact right away
    name: 'Juan de Dios Vaca (Tú)',
    email: 'juan@lamorita.com',
    phone: '760-33445',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    zone: 'Equipetrol, Calle 4 #215',
    bio: 'Vecino del Barrio La Morita comprometido con la vecindad. Dispuesto a colaborar en informática y soporte técnico rápido.',
    skills: ['Computación', 'Soporte Técnico', 'Arreglos Rápidos'],
    isAdmin: true
  }
];

export const mockPublications: Publication[] = [
  {
    id: 'p1',
    userId: 'u1',
    authorName: 'Gladys Justiniano',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    type: 'vendo',
    title: 'Salteñas cruceñas de carne picante calentitas',
    category: 'Comida',
    description: 'Salteñas caseras de res súper jugosas y picantes, horneadas en el momento con masa dulce tradicional camba. Se retiran calientes los fines de semana. ¡Hacer pedido con al menos 2 horas de anticipación!',
    priceType: 'monto',
    priceValue: 'Bs. 8 c/u (o Bs. 90 la docena)',
    photo: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    zone: 'Equipetrol, Calle 8 #420',
    availability: 'Sábados y Domingos de 08:30 a 12:30 hs',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'p2',
    userId: 'u2',
    authorName: 'Carlos Lorgio Mercado',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'ofrezco',
    title: 'Mantenimiento de aires acondicionados y refrigeración',
    category: 'Reparaciones',
    description: 'Limpieza de filtros, carga de gas refrigerante, reparación de fugas en aires acondicionados tipo Split y de ventana. También soluciono problemas en heladeras y lavarropas a domicilio.',
    priceType: 'a-consultar',
    priceValue: 'A convenir según diagnóstico',
    photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    zone: 'Urbarí, Pasaje Cupesí 120',
    availability: 'Lunes a Sábado de 8:00 a 18:30 hs',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'p3',
    userId: 'u3',
    authorName: 'Lucía Melgar',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'ofrezco',
    title: 'Clases particulares de Matemáticas y Computación',
    category: 'Clases/Tutorías',
    description: 'Nivelación escolar, secundaria y preparación para exámenes de ingreso a la universidad. Excelentes explicaciones didácticas. Puedo atender en mi domicilio o ir al tuyo en el barrio.',
    priceType: 'monto',
    priceValue: 'Bs. 45 por hora',
    photo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    zone: 'Av. San Martín, Barrio Sirari #1540',
    availability: 'Tardes de Martes, Jueves y Sábados completos',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'p4',
    userId: 'u4',
    authorName: 'Martín Suárez',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    type: 'ofrezco',
    title: 'Limpieza de canchones, podas y jardinería general',
    category: 'Servicios',
    description: 'Mantengo tu patio libre de malezas para prevenir el dengue. Realizo podas de seguridad, deshierbe y corte de césped con mi propia maquinaria a gasolina.',
    priceType: 'monto',
    priceValue: 'Desde Bs. 80 (según tamaño del canchón)',
    photo: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&auto=format&fit=crop&q=80',
    zone: 'Las Palmas, Calle Motacú 830',
    availability: 'Sábados y Domingos de 7:30 a 17:00 hs',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
  },
  {
    id: 'p5',
    userId: 'u5',
    authorName: 'Clara Aguilera',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    type: 'vendo',
    title: 'Cuñapés horneados tradicionales de puro queso',
    category: 'Comida',
    description: 'Cuñapés crujientes elaborados con almidón de yuca seleccionado y abundante queso criollo cruceño. Listos para el cafecito de la tarde de las 4 PM. Se entregan recién salidos del horno.',
    priceType: 'monto',
    priceValue: 'Bs. 35 la docena',
    photo: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80',
    zone: 'Barrio Hamacas, Calle Tajibo 340',
    availability: 'Retiros los fines de semana por la tarde',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'p6',
    userId: 'u4',
    authorName: 'Martín Suárez',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    type: 'necesito',
    title: 'Préstamo de escalera telescópica o de más de 3 metros',
    category: 'Ayuda vecinal',
    description: 'Buenas vecinos, requiero limpiar las hojas de las canaletas de mi techo este sábado antes de las lluvias. ¿Alguien tiene una escalera alta de aluminio que me preste por unas horas? Prometo devolverla limpia junto a una botella de somó heladito.',
    priceType: 'intercambio',
    priceValue: 'Invito botella de somó helado de regalo / Favor vecinal',
    photo: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&auto=format&fit=crop&q=80',
    zone: 'Las Palmas, Calle Motacú 830',
    availability: 'Este Sábado de 8:00 a 14:00',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 'p7',
    userId: 'u5',
    authorName: 'Clara Aguilera',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    type: 'necesito',
    title: 'Busco cuidador de confianza para mi perrito "Rocco" este sábado',
    category: 'Ayuda vecinal',
    description: 'Tengo un compromiso familiar todo el día sábado. Busco un vecino que pueda tener a Rocco (un mestizo mediano súper juguetón y dócil) en su patio. Le proporciono su alimento y correa.',
    priceType: 'monto',
    priceValue: 'Bs. 90 por el día',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
    zone: 'Barrio Hamacas, Calle Tajibo 340',
    availability: 'Sábado de 8:30 a 18:00 hs',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 'p8',
    userId: 'u2',
    authorName: 'Carlos Lorgio Mercado',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'necesito',
    title: '¿Alguien que me preste una terraja para roscas de caño plástico?',
    category: 'Ayuda vecinal',
    description: 'Estoy reparando una fuga de agua en mi patio y necesito roscar unos tubos de PVC de 1/2 pulgada. Si algún vecino plomero me presta una terraja manual por unas horas, se lo agradeceré mucho.',
    priceType: 'intercambio',
    priceValue: 'Intercambio por revisión eléctrica gratis',
    photo: 'https://images.unsplash.com/photo-1530124560072-a059b014b37d?w=600&auto=format&fit=crop&q=80',
    zone: 'Urbarí, Pasaje Cupesí 120',
    availability: 'Cualquier momento de esta semana',
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString()
  },
  {
    id: 'p9',
    userId: 'u1',
    authorName: 'Gladys Justiniano',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    type: 'vendo',
    title: 'Plantines de Ají Dulce y Albahaca Orgánicos',
    category: 'Productos',
    description: 'Plantines listos para pasar a maceta o jardín. Cultivados en casa sin fertilizantes químicos, de buena producción para condimentar tus majaditos y comidas.',
    priceType: 'monto',
    priceValue: 'Bs. 10 c/u o 3 por Bs. 25',
    photo: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&auto=format&fit=crop&q=80',
    zone: 'Equipetrol, Calle 8 #420',
    availability: 'Tardes de 16:30 a 19:30 hs',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

export const mockRequests: Request[] = [
  {
    id: 'r1',
    publicationId: 'p1',
    publicationTitle: 'Salteñas cruceñas de carne picante calentitas',
    publicationType: 'vendo',
    publisherId: 'u1',
    requesterId: 'currentUser',
    requesterName: 'Juan de Dios Vaca (Tú)',
    requesterAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    comment: '¡Hola doña Gladys! Me encantaría encargar una docena de salteñas calentitas para retirar este sábado temprano. ¿Se puede para las 9:30 AM?',
    quantity: 1,
    proposedDateTime: 'Sábado a las 9:30 AM',
    status: 'aceptada',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'r2',
    publicationId: 'p6',
    publicationTitle: 'Préstamo de escalera telescópica o de más de 3 metros',
    publicationType: 'necesito',
    publisherId: 'u4',
    requesterId: 'currentUser',
    requesterName: 'Juan de Dios Vaca (Tú)',
    requesterAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    comment: 'Hola Martín, yo tengo una escalera extensible de aluminio que llega hasta 4 metros. Te la presto con gusto, está en mi garaje aquí en Equipetrol.',
    proposedDateTime: 'Sábado a partir de las 8 AM',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 'r3',
    publicationId: 'p7',
    publicationTitle: 'Busco cuidador de confianza para mi perrito "Rocco" este sábado',
    publicationType: 'necesito',
    publisherId: 'u5',
    requesterId: 'u4', // Martín se ofreció a cuidar el perro de Clara
    requesterName: 'Martín Suárez',
    requesterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    comment: '¡Hola Clarita! A mis hijos les encantan las mascotas y tenemos un patio muy seguro en Las Palmas. Traelo con confianza el sábado por la mañana y acá jugará feliz.',
    status: 'completada',
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  }
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    requestId: 'r1',
    senderId: 'currentUser',
    text: 'Hola doña Gladys! Me confirma si le queda espacio para anotarme la docena de salteñas de carne picante por favor.',
    createdAt: new Date(Date.now() - 2.8 * 3600000).toISOString()
  },
  {
    id: 'm2',
    requestId: 'r1',
    senderId: 'u1',
    text: '¡Hola Juan querido! Sí, claro que sí. Te anoté la docena para las 9:30 AM. Te las preparo bien jugositas y listas para servirse.',
    createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString()
  },
  {
    id: 'm3',
    requestId: 'r1',
    senderId: 'currentUser',
    text: 'Buenísimo, mil gracias doña Gladys. El sábado paso directo por su casa.',
    createdAt: new Date(Date.now() - 2.4 * 3600000).toISOString()
  },
  {
    id: 'm4',
    requestId: 'r1',
    senderId: 'u1',
    text: 'Perfecto, te espero. Traete una fuente si podés, así evitamos usar tanto plástico desechable. Un saludo grande.',
    createdAt: new Date(Date.now() - 2.3 * 3600000).toISOString()
  }
];

export const mockThankYous: ThankYou[] = [
  {
    id: 't1',
    targetUserId: 'u4', // To Martín
    authorId: 'u5', // From Clara
    authorName: 'Clara Aguilera',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    text: '¡Martín es un vecino de oro! Cuidó de Rocco el sábado pasado de manera espectacular, regresó cansadito de tanto jugar en su hermoso patio. Súper recomendado para confiar a tus mascotas.',
    createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    publicationTitle: 'Busco cuidador de confianza para mi perrito "Rocco" este sábado'
  },
  {
    id: 't2',
    targetUserId: 'u2', // To Carlos Mercado
    authorId: 'u1', // From Gladys
    authorName: 'Gladys Justiniano',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    text: 'Muchísimas gracias a don Carlos por venir volando a revisar mi congelador. Tenía miedo de perder la masa de mis salteñas, pero lo solucionó volando y me dio un descuento de vecino. ¡Gran técnico!',
    createdAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString(),
    publicationTitle: 'Mantenimiento de aires acondicionados y refrigeración'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'currentUser',
    type: 'status_change',
    title: '¡Solicitud Aceptada!',
    message: 'Doña Gladys aceptó tu pedido de Salteñas cruceñas de carne picante calentitas.',
    requestId: 'r1',
    createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    read: false
  },
  {
    id: 'n2',
    userId: 'currentUser',
    type: 'new_message',
    title: 'Nuevo mensaje de Gladys',
    message: '"Perfecto, te espero. Traete una fuente..."',
    requestId: 'r1',
    createdAt: new Date(Date.now() - 2.3 * 3600000).toISOString(),
    read: false
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: '🍔🌭 ¡CONVOCATORIA PARA EMPRENDEDORES EN LA MORITA! 🍰🥤',
    content: `La Junta Vecinal del Barrio La Morita invita a todas las emprendedoras dedicadas a la venta de gastronomía, postres, repostería y refrescos típicos (somó, mocochinchi, chicha camba) a participar de la Gran Kermesse Vecinal Deportiva.

📅 Sábado 25 de julio de 2026
🕑 Desde las 14:00 hrs.
📍 Cancha Polifuncional del Barrio La Morita

💰 Aporte de inscripción: Bs. 20 (pro fondos mejoras de la iluminación de la cancha)

Cada participante deberá:
✅ Llevar su propia mesa, stand o mantel.
✅ Contar con un tacho o bolsa de basura para su puesto.
✅ Mantener limpio su espacio antes, durante y después de la jornada.

Será una excelente oportunidad para ofrecer tus comidas, cuñapés y productos al barrio en un ambiente familiar y seguro de sana convivencia vecinal.

📲 Informes e inscripciones: 750-59925

Organiza:
Junta Vecinal de Propietarios de La Morita`,
    date: '2026-07-21T10:00:00.000Z',
    important: true
  },
  {
    id: 'ann_2',
    title: '🚧 Trabajos de Bacheo y Limpieza en Av. Las Américas 🛠️',
    content: `Se comunica a los vecinos que el jueves 23 de julio de 2026 se realizarán trabajos de bacheo de baches y deshierbe sobre la Av. Las Américas.

🚗 Rogamos circular con extrema precaución o tomar rutas alternas, ya que un carril estará parcialmente cerrado por el camión de la municipalidad de 8:30 a 12:30 hrs.

¡Hagamos de La Morita un barrio más transitable y limpio para todos!`,
    date: '2026-07-19T08:30:00.000Z',
    important: false
  }
];
