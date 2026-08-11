import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formsearch-main',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './formsearch-main.html',
  styleUrl: './formsearch-main.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormsearchMain {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  searchForm: FormGroup;
  days = signal<number | null>(null);
  tiempoOptions = signal([
    { value: 1, label: '1 dia' },
    { value: 3, label: '3 dias' },
    { value: 7, label: '1 semana' },
    { value: 15, label: '15 dias' },
    { value: 30, label: '1 mes' },
    { value: 90, label: '3 meses' },
    { value: 365, label: '1 año' },
  ]);

  // Output para emitir los datos de búsqueda al componente padre
  searchSubmitted = output<any>();
  mesasDisponibles = input([{ value: 0, label: 'Mesa 0' }]);
  mesaSeleccionada = input<number>(0);

  constructor() {
    this.searchForm = this.fb.group({
      mesa: [''],
      fecha: [''],
      fechaFin: [''],
      tiempo: [30],
    });

    effect(() => {
      const mesa = this.mesaSeleccionada();
      if (mesa && mesa > 0) {
        this.searchForm.get('mesa')?.setValue(mesa);
        this.cdr.markForCheck();
      }
    });

    this.searchForm.get('fechaFin')?.valueChanges.subscribe(() => {
      this.calcularDias();
    });
  }

  calcularDias() {
    const fecha = this.searchForm.get('fecha')?.value;
    const fechaFin = this.searchForm.get('fechaFin')?.value;
    if (fecha && fechaFin) {
      const startDate = new Date(fecha);
      const endDate = new Date(fechaFin);
      const difference = endDate.getTime() - startDate.getTime();
      const calculatedDays = Math.ceil(difference / (1000 * 60 * 60 * 24));
      this.days.set(calculatedDays);
      const daysOption = {
        value: calculatedDays + 1,
        label: `${calculatedDays + 1} dias seleccionados`,
      };
      // Agregar la opción si no existe
      const existing = this.tiempoOptions().find((opt) => opt.value === daysOption.value);
      if (!existing) {
        this.tiempoOptions.update((options) => [daysOption, ...options]);
      }
      this.searchForm.get('tiempo')?.setValue(daysOption.value);
      this.cdr.markForCheck(); // Forzar change detection bajo OnPush
    }
  }

  onQuickSearch(days: number) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);
    const formattedStartDate = startDate.toLocaleDateString('en-CA');
    this.searchForm.get('fecha')?.setValue(formattedStartDate);
    this.searchForm.get('tiempo')?.setValue(days);
    this.onSubmit();
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.searchSubmitted.emit(this.searchForm.value); // Emitir datos al padre
      this.cdr.markForCheck(); // Forzar change detection si es necesario
    }
  }

  onExportar() {
    console.log('Exportar CSV');
    // Lógica para exportar
  }
}
