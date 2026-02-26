using AutoMapper;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;

namespace PastisserieAPI.Services.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ============ USER MAPPINGS ============
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                    src.UserRoles.Select(ur => ur.Rol.Nombre).ToList()));

            // 👇 NUEVO MAPA: Para convertir la entidad User en el resumen pequeño
            CreateMap<User, UsuarioResumenDto>() // O CreateMap<Usuario, UsuarioResumenDto> según tu entidad
                .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

            CreateMap<RegisterRequestDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaRegistro, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.EmailVerificado, opt => opt.MapFrom(src => false));

            CreateMap<CreateUserRequestDto, User>()
                .IncludeBase<RegisterRequestDto, User>();

            CreateMap<UpdateUserRequestDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ============ PRODUCTO MAPPINGS ============
            CreateMap<Producto, ProductoResponseDto>()
                .ForMember(dest => dest.PromedioCalificacion, opt => opt.MapFrom(src =>
                    src.Reviews.Any(r => r.Aprobada)
                        ? src.Reviews.Where(r => r.Aprobada).Average(r => r.Calificacion)
                        : 0))
                .ForMember(dest => dest.TotalReviews, opt => opt.MapFrom(src =>
                    src.Reviews.Count(r => r.Aprobada)));

            CreateMap<CreateProductoRequestDto, Producto>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => true));

            CreateMap<UpdateProductoRequestDto, Producto>()
                .ForMember(dest => dest.FechaActualizacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ============ PEDIDO MAPPINGS (ACTUALIZADO) ============
            CreateMap<Pedido, PedidoResponseDto>()
                .ForMember(dest => dest.NombreUsuario, opt => opt.MapFrom(src => src.Usuario.Nombre))
                // 👇 ESTA LÍNEA ES LA CLAVE: Mapeamos el objeto completo
                .ForMember(dest => dest.Usuario, opt => opt.MapFrom(src => src.Usuario))
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items))
                .ForMember(dest => dest.DireccionEnvio, opt => opt.MapFrom(src => src.DireccionEnvio));

            CreateMap<PedidoItem, PedidoItemResponseDto>()
                .ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : "Producto Desconocido"));

            CreateMap<CreatePedidoRequestDto, Pedido>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaPedido, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => "Pendiente"))
                .ForMember(dest => dest.Aprobado, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.EsPersonalizado, opt => opt.MapFrom(src => src.PersonalizadoConfig != null))
                .ForMember(dest => dest.MetodoPago, opt => opt.Ignore())
                .ForMember(dest => dest.Items, opt => opt.Ignore())
                .ForMember(dest => dest.PersonalizadoConfig, opt => opt.Ignore());

            CreateMap<PedidoItemRequestDto, PedidoItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PedidoId, opt => opt.Ignore())
                .ForMember(dest => dest.PrecioUnitario, opt => opt.Ignore())
                .ForMember(dest => dest.Subtotal, opt => opt.Ignore());

            CreateMap<PersonalizadoConfigRequestDto, PersonalizadoConfig>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PedidoId, opt => opt.Ignore())
                .ForMember(dest => dest.PrecioAdicional, opt => opt.Ignore())
                .ForMember(dest => dest.Ingredientes, opt => opt.Ignore());

            // ============ CARRITO MAPPINGS ============
            CreateMap<CarritoCompra, CarritoResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items))
                .ForMember(dest => dest.Total, opt => opt.MapFrom(src =>
                    src.Items.Sum(i => i.Cantidad * i.Producto.Precio)))
                .ForMember(dest => dest.TotalItems, opt => opt.MapFrom(src =>
                    src.Items.Sum(i => i.Cantidad)));

            CreateMap<CarritoItem, CarritoItemResponseDto>()
                .ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => src.Producto.Nombre))
                .ForMember(dest => dest.PrecioUnitario, opt => opt.MapFrom(src => src.Producto.Precio))
                .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.Cantidad * src.Producto.Precio))
                .ForMember(dest => dest.ImagenUrl, opt => opt.MapFrom(src => src.Producto.ImagenUrl));

            CreateMap<AddToCarritoRequestDto, CarritoItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CarritoId, opt => opt.Ignore())
                .ForMember(dest => dest.FechaAgregado, opt => opt.MapFrom(src => DateTime.UtcNow));

            // ============ REVIEW MAPPINGS ============
            CreateMap<Review, ReviewResponseDto>()
                .ForMember(dest => dest.NombreUsuario, opt => opt.MapFrom(src => src.Usuario.Nombre))
                .ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => src.Producto.Nombre));

            CreateMap<Notificacion, NotificacionResponseDto>();

            CreateMap<CreateReviewRequestDto, Review>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UsuarioId, opt => opt.Ignore())
                .ForMember(dest => dest.Fecha, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Aprobada, opt => opt.MapFrom(src => false));

            // ============ DIRECCION MAPPINGS ============
            CreateMap<DireccionEnvio, DireccionEnvioResponseDto>();

            CreateMap<CreateDireccionRequestDto, DireccionEnvio>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UsuarioId, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow));

            // ============ CATEGORIA MAPPINGS ============
            CreateMap<CategoriaProducto, CategoriaProducto>();

            // ============ INGREDIENTE MAPPINGS ============
            CreateMap<Ingrediente, Ingrediente>();

            // ============ PROMOCION MAPPINGS ============
            CreateMap<Promocion, PromocionResponseDto>();
            CreateMap<CreatePromocionRequestDto, Promocion>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<UpdatePromocionRequestDto, Promocion>()
                .ForMember(dest => dest.FechaActualizacion, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
}