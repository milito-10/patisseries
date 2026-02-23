import { productService } from '../services/productService';
import type { Producto } from '../types';

const productsToSeed: any[] = [
    // --- TORTAS (CatId 1) ---
    {
        nombre: "Tarta Ópera Real",
        descripcion: "Capas finas de bizcocho de almendra, crema de café y ganache de chocolate 70%.",
        precio: 45.00,
        stock: 8,
        imagenUrl: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=800",
        categoriaId: 1,
        categoria: "Tortas",
        esPersonalizable: true,
        activo: true
    },
    {
        nombre: "Cheesecake de Frutos del Bosque",
        descripcion: "Base de galleta crujiente con crema de queso suave y coulis artesanal de moras.",
        precio: 38.00,
        stock: 12,
        imagenUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800",
        categoriaId: 1,
        categoria: "Tortas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Mousse de Limón y Merengue",
        descripcion: "Tarta refrescante con crema de limón siciliano y merengue suizo flameado.",
        precio: 35.00,
        stock: 10,
        imagenUrl: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?q=80&w=800",
        categoriaId: 1,
        categoria: "Tortas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Pastel Red Velvet",
        descripcion: "Clásico terciopelo rojo con capas de crema de queso frosting y un toque de vainilla.",
        precio: 42.00,
        stock: 6,
        imagenUrl: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=800",
        categoriaId: 1,
        categoria: "Tortas",
        esPersonalizable: true,
        activo: true
    },
    {
        nombre: "Tarta de Frutillas con Crema",
        descripcion: "Bizcochos esponjosos rellenos de fresas frescas y crema Chantilly.",
        precio: 34.00,
        stock: 15,
        imagenUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800",
        categoriaId: 1,
        categoria: "Tortas",
        esPersonalizable: false,
        activo: true
    },

    // --- PANES (CatId 2) ---
    {
        nombre: "Pan de Masa Madre (Sourdough)",
        descripcion: "Pan artesanal de fermentación lenta (48h) con corteza rústica y miga aireada.",
        precio: 6.50,
        stock: 20,
        imagenUrl: "https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=800",
        categoriaId: 2,
        categoria: "Panes",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Brioche de Canela y Nuez",
        descripcion: "Pan dulce francés enriquecido con mantequilla y espirales de canela premium.",
        precio: 8.00,
        stock: 15,
        imagenUrl: "https://images.unsplash.com/photo-1541119638723-c51cbe2262aa?q=80&w=800",
        categoriaId: 2,
        categoria: "Panes",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Croissants Clásicos (Pack x4)",
        descripcion: "Hojaldre mantequilloso con múltiples capas, crujiente y dorado.",
        precio: 12.00,
        stock: 30,
        imagenUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800",
        categoriaId: 2,
        categoria: "Panes",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Baguette Tradicional",
        descripcion: "La clásica baguette de corteza crujiente y aroma inigualable.",
        precio: 3.50,
        stock: 40,
        imagenUrl: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=800",
        categoriaId: 2,
        categoria: "Panes",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Focaccia de Romero y Sal",
        descripcion: "Pan italiano esponjoso hidratado con aceite de oliva extra virgen.",
        precio: 9.00,
        stock: 10,
        imagenUrl: "https://images.unsplash.com/photo-1573140247632-f8fd7de9d720?q=80&w=800",
        categoriaId: 2,
        categoria: "Panes",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Pan de Centeno y Semillas",
        descripcion: "Pan nutritivo y denso cargado de cereales y vitalidad.",
        precio: 7.50,
        stock: 18,
        imagenUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=800",
        categoriaId: 2,
        categoria: "Panes",
        esPersonalizable: false,
        activo: true
    },

    // --- POSTRES (CatId 3) ---
    {
        nombre: "Caja de Macarons Joya (x12)",
        descripcion: "Surtido gourmet: Pistacho, Lavanda, Sal de Mar, y Chocolate Belga.",
        precio: 25.00,
        stock: 25,
        imagenUrl: "https://images.unsplash.com/photo-1569864358642-9d1619702661?q=80&w=800",
        categoriaId: 3,
        categoria: "Postres",
        esPersonalizable: true,
        activo: true
    },
    {
        nombre: "Éclairs de Avellana y Caramelo",
        descripcion: "Masa choux rellena de praliné y cubierta con toffee artesanal.",
        precio: 6.50,
        stock: 20,
        imagenUrl: "https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=800",
        categoriaId: 3,
        categoria: "Postres",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Tiramisú de Autor",
        descripcion: "Café de especialidad, mascarpone italiano y cacao amargo de origen.",
        precio: 15.00,
        stock: 10,
        imagenUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800",
        categoriaId: 3,
        categoria: "Postres",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Profiteroles de Vainilla",
        descripcion: "Pequeñas delicias de masa choux bañadas en chocolate caliente.",
        precio: 12.00,
        stock: 15,
        imagenUrl: "https://images.unsplash.com/photo-1505394033223-4047469e23b1?q=80&w=800",
        categoriaId: 3,
        categoria: "Postres",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Crème Brûlée Clásica",
        descripcion: "Crema de vainilla de Madagascar con capa de azúcar caramelizada.",
        precio: 14.00,
        stock: 12,
        imagenUrl: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?q=80&w=800",
        categoriaId: 3,
        categoria: "Postres",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Tartita de Chocolate y Nuez",
        descripcion: "Intenso ganache de chocolate sobre base crocante de nueces.",
        precio: 10.50,
        stock: 25,
        imagenUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
        categoriaId: 3,
        categoria: "Postres",
        esPersonalizable: false,
        activo: true
    },

    // --- GALLETAS (CatId 4) ---
    {
        nombre: "Cookies Red Velvet y Queso",
        descripcion: "Galletas rojas aterciopeladas rellenas de crema de queso dulce.",
        precio: 3.50,
        stock: 40,
        imagenUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800",
        categoriaId: 4,
        categoria: "Galletas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Shortbread de Vainilla Francesa",
        descripcion: "Galletas de mantequilla pura que se deshacen en la boca.",
        precio: 1.50,
        stock: 100,
        imagenUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800",
        categoriaId: 4,
        categoria: "Galletas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Cookies Doble Chocolate XXL",
        descripcion: "Cargadas con trozos de chocolate blanco, con leche y amargo.",
        precio: 4.00,
        stock: 35,
        imagenUrl: "https://images.unsplash.com/photo-1490265246297-3ca9da565b9b?q=80&w=800",
        categoriaId: 4,
        categoria: "Galletas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Galletas de Avena y Pasas",
        descripcion: "Opción saludable y deliciosa con canela y hojuelas de avena premium.",
        precio: 2.80,
        stock: 50,
        imagenUrl: "https://images.unsplash.com/photo-1559715745-e1b33a271c8f?q=80&w=800",
        categoriaId: 4,
        categoria: "Galletas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Cookies de Mantequilla de Maní",
        descripcion: "Para los amantes del maní, textura cremosa y toque de sal.",
        precio: 3.20,
        stock: 45,
        imagenUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc2fe0a?q=80&w=800",
        categoriaId: 4,
        categoria: "Galletas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Galletas de Pistacho y Sal Rosa",
        descripcion: "Sabor sofisticado con trozos de pistacho iraní y sal del Himalaya.",
        precio: 4.50,
        stock: 20,
        imagenUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800",
        categoriaId: 4,
        categoria: "Galletas",
        esPersonalizable: false,
        activo: true
    },

    // --- BEBIDAS (CatId 5) ---
    {
        nombre: "Café Latte de Especialidad",
        descripcion: "Granos de origen único con leche emulsionada y un toque de vainilla.",
        precio: 4.50,
        stock: 50,
        imagenUrl: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=800",
        categoriaId: 5,
        categoria: "Bebidas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Té Matcha Ceremonial",
        descripcion: "Té verde japonés de grado premium, preparado tradicionalmente.",
        precio: 5.50,
        stock: 30,
        imagenUrl: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800",
        categoriaId: 5,
        categoria: "Bebidas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Chocolate Caliente Belga",
        descripcion: "Mezcla de chocolates 70% y 50% con malvaviscos artesanales.",
        precio: 6.00,
        stock: 25,
        imagenUrl: "https://images.unsplash.com/photo-1544787210-22bb830635bf?q=80&w=800",
        categoriaId: 5,
        categoria: "Bebidas",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Jugo de Naranja y Frutilla",
        descripcion: "Fruta fresca exprimida al momento, sin azúcar añadida.",
        precio: 5.00,
        stock: 40,
        imagenUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800",
        categoriaId: 5,
        categoria: "Bebidas",
        esPersonalizable: false,
        activo: true
    },

    // --- SALADOS (CatId 6) ---
    {
        nombre: "Quiche de Espinacas y Brie",
        descripcion: "Masa quebrada artesanal rellena de espinacas frescas y queso brie fundido.",
        precio: 12.50,
        stock: 10,
        imagenUrl: "https://images.unsplash.com/photo-1551404973-7bb6af157822?q=80&w=800",
        categoriaId: 6,
        categoria: "Salados",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Empanada de Carne Cortada a Cuchillo",
        descripcion: "La tradicional empanada con carne premium y cocción perfecta.",
        precio: 3.50,
        stock: 60,
        imagenUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=800",
        categoriaId: 6,
        categoria: "Salados",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Croissant de Jamón Serrano y Rúcula",
        descripcion: "Nuestro croissant clásico relleno de ingredientes gourmet.",
        precio: 9.50,
        stock: 15,
        imagenUrl: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?q=80&w=800",
        categoriaId: 6,
        categoria: "Salados",
        esPersonalizable: false,
        activo: true
    },

    // --- PROMOCIONES (CatId 7) ---
    {
        nombre: "Combo Desayuno Dulce",
        descripcion: "1 Cappuccino Grande + 2 Croissants Clásicos + 1 Macaron de regalo.",
        precio: 18.50,
        stock: 100,
        imagenUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800",
        categoriaId: 7,
        categoria: "Promociones",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Pack Degustación Macarons",
        descripcion: "Caja de 24 macarons surtidos con un 15% de descuento incluido.",
        precio: 42.00,
        stock: 50,
        imagenUrl: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=800",
        categoriaId: 7,
        categoria: "Promociones",
        esPersonalizable: false,
        activo: true
    },
    {
        nombre: "Merienda para Dos",
        descripcion: "2 Porciones de Tarta Opera + 2 Tés Matcha + 4 Galletas de Pistacho.",
        precio: 35.00,
        stock: 30,
        imagenUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800",
        categoriaId: 7,
        categoria: "Promociones",
        esPersonalizable: false,
        activo: true
    }
];

export const seedDatabase = async () => {
    console.log("🚀 Iniciando Seed Idempotente de Productos...");
    try {
        const existingProducts = await productService.getAll();
        const existingNames = new Set(existingProducts.map((p: any) => p.nombre.toLowerCase().trim()));

        for (const product of productsToSeed) {
            const productTitle = product.nombre.toLowerCase().trim();

            if (existingNames.has(productTitle)) {
                console.log(`⏩ Saltando duplicado: ${product.nombre}`);
                continue;
            }

            try {
                await productService.create(product as Producto);
                console.log(`✅ Producto creado: ${product.nombre}`);
                existingNames.add(productTitle); // Evitar duplicar en la misma ejecución
            } catch (error) {
                console.error(`❌ Error creando ${product.nombre}:`, error);
            }
        }
        console.log("✨ Seed completado con éxito (sin duplicados).");
    } catch (error) {
        console.error("❌ Error fatal en el seeder:", error);
    }
};
