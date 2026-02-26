using FluentValidation;
using PastisserieAPI.Services.DTOs.Request;

namespace PastisserieAPI.Services.Validators
{
    public class CreatePromocionRequestValidator : AbstractValidator<CreatePromocionRequestDto>
    {
        public CreatePromocionRequestValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es requerido")
                .MaximumLength(100).WithMessage("El nombre no puede exceder los 100 caracteres");

            RuleFor(x => x.Valor)
                .GreaterThan(0).WithMessage("El valor del descuento debe ser mayor a 0");

            RuleFor(x => x.FechaInicio)
                .NotEmpty().WithMessage("La fecha de inicio es requerida");

            RuleFor(x => x.FechaFin)
                .NotEmpty().WithMessage("La fecha de fin es requerida")
                .GreaterThan(x => x.FechaInicio)
                .WithMessage("La fecha y hora de fin debe ser estrictamente posterior a la de inicio");
            
            RuleFor(x => x.TipoDescuento)
                .Must(x => x == "Porcentaje" || x == "MontoFijo")
                .WithMessage("El tipo de descuento debe ser 'Porcentaje' o 'MontoFijo'");
        }
    }
}
