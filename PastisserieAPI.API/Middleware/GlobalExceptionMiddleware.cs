using System.Net;
using System.Text.Json;
using PastisserieAPI.Services.DTOs.Common;

namespace PastisserieAPI.API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ha ocurrido una excepción no controlada en: {Path}", context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var statusCode = HttpStatusCode.InternalServerError;
            var message = "Ocurrió un error inesperado en el servidor.";
            var errors = new List<string>();

            // Manejo de excepciones específicas
            switch (exception)
            {
                case UnauthorizedAccessException:
                    statusCode = HttpStatusCode.Unauthorized;
                    message = "No tiene autorización para realizar esta acción.";
                    break;
                
                case KeyNotFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    message = "El recurso solicitado no fue encontrado.";
                    break;

                // Podrías agregar excepciones personalizadas aquí como ValidationException
                case FluentValidation.ValidationException valEx:
                    statusCode = HttpStatusCode.BadRequest;
                    message = "Error de validación en la solicitud.";
                    errors.AddRange(valEx.Errors.Select(e => e.ErrorMessage));
                    break;
            }

            context.Response.StatusCode = (int)statusCode;

            if (_env.IsDevelopment() && errors.Count == 0)
            {
                message = exception.Message;
                errors.Add(exception.StackTrace ?? string.Empty);
            }

            var response = ApiResponse<object>.ErrorResponse(message, errors);
            
            var options = new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = _env.IsDevelopment()
            };
            
            var json = JsonSerializer.Serialize(response, options);

            await context.Response.WriteAsync(json);
        }
    }
}
